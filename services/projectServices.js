const Project = require('../models/Project')
const File = require('../models/File')
const User = require('../models/User')
const Invitation = require('../models/Invitation');
const ConsoleLog = require('../models/ConsoleLog');
const { DeleteOldImageFromCloudinary } = require('./cloudinaryServices');
const { directoryCleanUp } = require('./directoryServices');
const Directory = require('../models/Directory');
const { formatProject, formatProjectLogs } = require('../utils/formatUtils');
const { deleteInvitation } = require('./inviteServices');
const { isMongooseObjectId } = require('../utils/typeChecking');
const { baseURL} = require('../config/config');
const io = require('socket.io-client');
const { runProject, deleteProjectOnExecutionServer, runExec, stopExec, createEmptyOnExec } = require('./apiClient');
const { projectInitialTemplate, packageJsonTemplate } = require('../utils/templates')

module.exports.projectCleanUp = async function (project){
    try {
        const projectId = project._id;
        deleteProjectOnExecutionServer(projectId)
        await Invitation.deleteMany({ project: projectId });
        await ConsoleLog.deleteMany({ project: projectId});

        const files = await File.find({ project: projectId });

        const fileDeletionPromises = files.map(async (file) => {
          if (file.contentType === 'Binary') {
            await DeleteOldImageFromCloudinary(file.url);
          }
        });

        await Promise.all(fileDeletionPromises);
        await File.deleteMany({ project: projectId });

        const directory = await Directory.findById(project.rootDirectory);
        await Directory.findByIdAndDelete(directory);
        await directoryCleanUp(directory);

      } catch (error) {
        console.error('Error during project cleanup:', error);
      }
}


module.exports.registerProject = async function (project) {
  try{
    // creating project object 
    const newProject = new Project(project);
    const savedProject = await newProject.save();

    // updating project with root Directory
    const rootDirectory = new Directory({
      name: 'root',
      project: savedProject._id
    })
    const root = await rootDirectory.save();
    const updatedProject = await Project.findByIdAndUpdate(savedProject._id, {rootDirectory: root._id}, {new: true})

    // creating template 
    const file = new File({
      name: 'app.js',
      contentType: 'String',
      content: projectInitialTemplate(),
      project: updatedProject._id,
      directory: updatedProject.rootDirectory
    })

    await file.save();

    const packagejson = new File({
      name: 'package.json',
      contentType: 'String',
      content: packageJsonTemplate(),
      project: updatedProject._id,
      directory: updatedProject.rootDirectory
    })

    await packagejson.save();
    await Directory.findByIdAndUpdate(updatedProject.rootDirectory, { $push: { files: file._id } })
    await Directory.findByIdAndUpdate(updatedProject.rootDirectory, { $push: { files: packagejson._id } })
    
    await runProject(newProject._id, newProject.owner);
    return updatedProject;
  }
  catch(error){
    console.error('Error during project registration:', error);
  }
}

module.exports.registerEmptyProject = async function (project) {
  try{
    // creating project object 
    const newProject = new Project(project);
    newProject.runningStatus = "not running";
    const savedProject = await newProject.save();

    // updating project with root Directory
    const rootDirectory = new Directory({
      name: 'root',
      project: savedProject._id
    })
    const root = await rootDirectory.save();
    const updatedProject = await Project.findByIdAndUpdate(savedProject._id, {rootDirectory: root._id}, {new: true})
    await createEmptyOnExec(newProject._id);

    return updatedProject;
  }
  catch(error){
    console.error('Error during project registration:', error);
  }
}


module.exports.getUserProjects = async function (userid) {
  try {
      const projects = await Project.find({ $or: [{ owner: userid }, { collaborators: { $in: [userid] } }] });
      const formattedData = await Promise.all(projects.map(async (project) => module.exports.getProjectDetails(project, userid)));

      return formattedData;
  } catch (error) {
      console.error('Error getting user projects:', error);
      return null;
  }
};

module.exports.changeProjectName = async function (projectid, projectName){
  try{
      return await Project.findByIdAndUpdate(projectid, { name: projectName})
  }
  catch(error){
    console.error(error);
  }
}

module.exports.deleteProject = async function (projectId){
  try{
      const project = await Project.findById(projectId);
      module.exports.projectCleanUp(project);
      await Project.findByIdAndDelete(projectId);
      return project;
  }
  catch(error){
    console.error(error);
    return null;
  }
}

module.exports.checkForProjectOwner = async function (projectId, userid){
  try{
    const project = await Project.findById(projectId);
    if(project.owner == userid){
      return true;
    }
    return false;
  }
  catch(error){
    console.error(error);
    return false;
  }
}

module.exports.removeProjectCollaborator = async function (projectId, collaboratorId){
   try{
      const project = await Project.findById(projectId);
      project.collaborators = project.collaborators.filter((collabId) => collabId != collaboratorId)
      await deleteInvitation(projectId, collaboratorId)
      const socket = io(`${baseURL}/invite-socket`);
      socket.emit('remove-collab', {userId: collaboratorId, projectId: projectId});
      return await project.save();
   }
   catch(error){
    console.error(error);
    return null;
   }
}

module.exports.getProjectCollaborator = async function (projectId, userId){
  try{
    const project = await Project.findById(projectId);
    const user = await User.findById(userId);
    if(project.collaborators.includes(userId)){
       return {
          name: user.UserName,
          id: userId,
          profile: user.ProfilePic,
       }
    }
    return null;
  }
  catch(error){
    console.error(error);
    return null;
  }
}

module.exports.getProjectFileNames = async function (projectId){
   try{
    const project = await Project.findById(projectId);
    const directory = await Directory.findById(project.rootDirectory).populate('files');
    const fileNames = directory.files.map(file => file.name );
    return fileNames;
   }
   catch(error){
     console.error(error);
     return null;
   }
}

module.exports.getProjectDetails = async function (project, userid){
 try{
  if(isMongooseObjectId(project)){
    project = await Project.findById(project);
  }
  let data = {}
  const { getCollaboratorsDetails } = require('./authServices');
  data.collaborators = await getCollaboratorsDetails(project.collaborators);
  data.consoleLogs = await module.exports.getAllConsoleLogs(project._id);
  const formattedData = formatProject(project, userid, data);
  return formattedData;
 }
 catch(error){
  console.error(error);
  return null;
 }
}

module.exports.ifMaxProjectsExceeded = async function (userId){
  try{
    const projects = await Project.find({owner: userId});
    const maxProjects = require('../config/config').maxAllowedProjects;
    if(projects.length > maxProjects){
        return true;
    }
    return false;
  }
  catch(error){
    console.error(error);
    return null;
  }
}

module.exports.getProjectName = async function (projectId){
   const project = await Project.findById(projectId);
   if(!project){
    return null;
   }
   return project.name;
}

module.exports.getAllCollaborators = async function (projectId){
   const project = await Project.findById(projectId);
   if(!project){
    return null;
   }
   return project.collaborators;
}

module.exports.runProject = async function (projectId){
  const project = await Project.findById(projectId);
  if(!project){
    return null;
  }
  project.runningStatus = "running";
  await project.save();
  await runExec(projectId);
  return true;
}

module.exports.stopProject = async function (projectId){
  const project = await Project.findById(projectId);
  if(!project){
    return null;
  }
  project.runningStatus = "not running";
  await project.save();
  await stopExec(projectId);
  return true;
}

module.exports.getAllConsoleLogs = async function (projectId){
  const logs = await ConsoleLog.find({project: projectId})
  return formatProjectLogs(logs);
}