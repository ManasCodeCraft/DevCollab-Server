const { copyProjectfromDatabase } = require("../services/deploymentServices");
const {
  registerProject,
  getProjectDetails,
  getUserProjects,
  changeProjectName,
  deleteProject,
  removeProjectCollaborator,
} = require("../services/projectServices");
const archiver = require("archiver");
const { ClientProjectPath } = require("../utils/deploymentUtils");
const fs = require("fs-extra");
const { nodeEnv } = require("../config/config");
const { updateRelativePaths } = require("../utils/fileUpload");
const { uploadDirectory } = require("../services/directoryServices");
const { logActivity } = require("../services/activityLogServices");

module.exports.createProject = async function createProject(req, res) {
  try {
    const userid = req.userid;
    const projectName = req.body.projectName;
    if (projectName && userid) {
      const savedProject = await registerProject(req.body);
      const createdProject = await getProjectDetails(savedProject, userid);
      logActivity(req.userid, savedProject._id, `created project - ${savedProject.name}`);

      res.status(201).json(createdProject);
    } else {
      res.status(400).json({ message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAllProjects = async function getAllProjects(req, res) {
  try {
    const id = req.userid;
    const projects = await getUserProjects(id);
    res.status(200).json({ projects: projects });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.updateProjectName = async function updateProjectName(req, res) {
  try {
    const projectId = req.body.id;
    const projectName = req.body.name;
    const updatedProject = await changeProjectName(projectId, projectName);
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    logActivity(req.userid, updatedProject._id, `renamed project to ${updatedProject.name}`);

    res.status(200).json(projectName);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.deleteProjectById = async function deleteProjectById(req, res) {
  try {
    const projectId = req.body.id;

    const project = await deleteProject(projectId);
    if (!project) {
      return res.status(404).json({ messsage: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.removeCollaborator = async function removeCollaborator(
  req,
  res
) {
  const projectId = req.body.projectId;
  const collaboratorId = req.body.collaboratorId;
  try {
    const project = await removeProjectCollaborator(projectId, collaboratorId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error removing collaborators", error });
  }
};

module.exports.downloadProject = async function (req, res) {
  const projectId = req.projectId;
  const projectName = req.projectName;
  const result = await copyProjectfromDatabase(projectId);
  const dirPath = ClientProjectPath(projectId);

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  archive.on("error", function (err) {
    throw err;
  });

  res.attachment(`${projectName}.zip`);

  archive.pipe(res);

  archive.directory(dirPath, false);

  await archive.finalize();

  if (result) {
    fs.remove(dirPath);
  }
};
