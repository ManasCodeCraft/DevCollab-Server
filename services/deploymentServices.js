const Directory = require("../models/Directory");
const File = require("../models/File");
const Project = require("../models/Project");
const Deploy = require("../models/Deploy");
const path = require("path");
const fs = require("fs-extra");
const {
  ClientProjectPath,
  getEntryFile,
  modifyAppFile,
  checkForEntryFile,
} = require("../utils/deploymentUtils");
const ClientAppManager = require("../client_request_handlers/clientAppManager");
const ConsoleLog = require("../models/ConsoleLog");
const { formatProjectLogs } = require("../utils/formatUtils");
const { setUpClientRoute } = require("../client_request_handlers/clientRouteSetUp");
const { runClientProject } = require("../client_request_handlers/runClientProject");

async function copyProjectfromDatabase(projectId) {
  const project = await Project.findById(projectId);
  const dirPath = ClientProjectPath(projectId);

  await copyDirectoryFromDatabase(dirPath, project.rootDirectory);

  const entryfile = await getEntryFile(dirPath);
  await modifyAppFile(path.join(dirPath, entryfile));
}

async function copyDirectoryFromDatabase(dirPath, dirId) {
  await fs.ensureDir(dirPath);
  const directory = await Directory.findById(dirId);

  // copying sub-directories
  if (directory.subDirectory && directory.subDirectory.length > 0) {
    for (let dir of directory.subDirectory) {
      const dir_ = await Directory.findById(dir);
      if (dir_.name === "node_modules") {
        continue;
      }
      await copyDirectoryFromDatabase(path.join(dirPath, dir_.name), dir_._id);
    }
  }

  // copying files
  const files = directory.files;
  if (files && files.length > 0) {
    for (let file of files) {
      const file_ = await File.findById(file);
      if (file_.contentType === "Binary") {
        await downloadImageFromCloudinary(
          file_.url,
          path.join(dirPath, file_.name)
        );
      } else {
        await fs.writeFile(path.join(dirPath, file_.name), file_.content);
      }
    }
  }
}

module.exports.deployClientProject = async function (projectId) {
  try {
    await copyProjectfromDatabase(projectId);
    const baseURL = require("../config/config").baseURL;

    const deployed_project = new Deploy({
      project: projectId,
      status: "active",
      url: `${baseURL}/client-project/${projectId}`,
    });
    await deployed_project.save();

    const result = await runClientProject(projectId);
    if(!result){
      return null;
    }

    if (await Project.findByIdAndUpdate(projectId, { isDeployed: true })) {
      setUpClientRoute(projectId);
      return deployed_project;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.suspendClientProject = async function (deployId) {
  try {
    const project = await Deploy.findByIdAndUpdate(deployId, {
      status: "suspended",
    });
    if (!project) {
      return null;
    }
    return project;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.reloadClientProject = async function (projectId) {
  try {

    await runClientProject(projectId);

    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.resumeClientProject = async function (deployId) {
  try {
    const project = await Deploy.findByIdAndUpdate(deployId, {
      status: "active",
    });
    if (!project) {
      return null;
    }
    return project;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.getDeployId = async function(projectId){
   const project = await Deploy.findOne({project: projectId});
   return project._id;
}

module.exports.deleteClientProject = async function (deployId) {
  try {
    const project = await Deploy.findById(deployId);
    if (!project) {
      return null;
    }

    ClientAppManager.removeClientApp(project.project);
    fs.rmdirSync(ClientProjectPath(project.project), { recursive: true });

    return await Deploy.findByIdAndDelete(deployId);
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.getProjectLogs = async function (deployId) {
  try {
    const project = await Deploy.findById(deployId);
    if(!project){
      return null;
    }
    const projectId = project.project;

    const logs = await ConsoleLog.find({ project: projectId });

    const data = formatProjectLogs(logs);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};


module.exports.getRequestData = async function(projectId){
    const getReq = async (startDate, endDate)=>{ 
       const reqData = (await Deploy.findOne({project: projectId})).req;
       const reqData_ =  reqData.filter((rq)=>{
          return rq >= startDate && rq <= endDate;
       })
       return reqData_.length;
    }

  var todayReq = await getReq(
    new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
    new Date(new Date().setHours(23, 59, 59, 999)) // End of today
  )

  var thisMonthReq = await getReq(
     new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of this month
     new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999) // End of this month
  )

  return {
    todayReq: todayReq,
    thisMonthReq: thisMonthReq
  }

}

async function getFileOrFolderPath(id, isFile) {
  var pathStack = [];
  var projectId = null;
  var clientpath = null;

  while (id) {
    if (isFile) {
      const file = await File.findById(id);
      if (!projectId) {
        projectId = file.project;
        clientpath = ClientProjectPath(projectId);
      }
      pathStack.push(file.name);
      id = file.directory;
      isFile = false;
    } else {
      const directory = await Directory.findById(id);
      if (!projectId) {
        projectId = directory.project;
        clientpath = ClientProjectPath(projectId);
      }
      if (directory.parentDirectory) {
        pathStack.push(directory.name);
        id = directory.parentDirectory;
      } else {
        id = null;
      }
    }
  }
  clientpath += "/";
  clientpath += pathStack.reverse().join("/");

  if (!fs.existsSync(clientpath)) {
    console.log(`path not exist - ${clientpath}`);
    return null;
  }

  return clientpath;
}

module.exports.manageOnLocal = async function (
  id,
  isFile,
  task,
  nameOrContent = null
) {
  try {
    const filefolderpath = await getFileOrFolderPath(id, isFile);
    if (!filefolderpath) {
      return null;
    }
    if (task === "create") {
      if (isFile) {
        await fs.writeFile(filefolderpath, "");
      } else {
        await fs.ensureDir(filefolderpath);
      }
    } else if (task === "editname") {
      if (!nameOrContent) {
        throw new Error(
          "You have forgot to provide name for renaming the file or folder"
        );
      }
      var newPath = path.join(filefolderpath, "../", nameOrContent);
      await fs.rename(filefolderpath, newPath);
    } else if (task === "delete") {
      await fs.remove(filefolderpath);
    } else if (task === "write") {
      if (!isFile) {
        throw new Error("Write operation can be only be performed in a file");
      }
      await fs.writeFile(filefolderpath, nameOrContent);
      if (await checkForEntryFile(filefolderpath)) {
        await modifyAppFile(filefolderpath);
      }
    } else {
      throw new Error(`Invalid Task - ${task}`);
    }

    return true;
  } catch (error) {
    console.error(error);
  }
};
