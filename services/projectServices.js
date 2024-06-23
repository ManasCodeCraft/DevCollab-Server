const Project = require('../models/Project')
const File = require('../models/File')
const Deploy = require('../models/Deploy');
const Invitation = require('../models/Invitation');
const { DeleteOldImageFromCloudinary } = require('./cloudinaryServices');
const { directoryCleanUp } = require('./directoryServices');
const Directory = require('../models/Directory');
const { formatProject } = require('../utils/formatUtils');
const { deleteClientProject, getRequestData } = require('./deploymentServices');
const ClientAppManager = require('../client_request_handlers/clientAppManager');

module.exports.projectCleanUp = async function (project){
    try {
        const projectId = project._id;
        await Invitation.deleteMany({ project: projectId });

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
        if(project.isDeployed){
            const deployId = ClientAppManager.DeployId(project._id);
            if(deployId){
                await deleteClientProject(deployId);
            }
        }
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
    console.error(error, { new: true });
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
      return await project.save();
   }
   catch(error){
    console.error(error);
    return null;
   }
}

module.exports.ProjectNotDeployed = async function (projectId){
  try{
      const project = await Project.findById(projectId);
      if(!project){
        return null;
      }
      if(!project.isDeployed){
        return true;
      }
      return false;
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
  let data = {}
  const { getCollaboratorsDetails } = require('./authServices');
  data.collaborators = await getCollaboratorsDetails(project.collaborators);
  if(project.isDeployed){
  data.status = (await Deploy.findOne({project: project._id})).status;
  let stats = await getRequestData(project._id);
  data.stats = stats;
  }

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
