const express = require('express');
const { createProject, getAllProjects, updateProjectName, deleteProjectById, removeCollaborator, downloadProject, uploadProject } = require('../controllers/projectControllers');
const { ProtectRoute } = require('../middlewares/authMiddlewares');
const { validateProjectOwner, validateCreateProject, validateDownloadRequest } = require('../middlewares/projectMiddlewares');
const { getAllActivityLogs } = require('../controllers/activityControllers');

const projectRouter = express.Router();

projectRouter.route('/create').post(ProtectRoute, validateCreateProject,createProject)
projectRouter.route('/get-all').post(ProtectRoute, getAllProjects)
projectRouter.route('/edit-name').post(ProtectRoute, updateProjectName)
projectRouter.route('/delete').post(ProtectRoute, validateProjectOwner ,deleteProjectById)
projectRouter.route('/remove-collaborator').post(ProtectRoute, validateProjectOwner ,removeCollaborator)
projectRouter.route('/download/:projectId').get(validateDownloadRequest, downloadProject)
projectRouter.route('/get-activity-logs').post(ProtectRoute ,getAllActivityLogs)

module.exports = projectRouter;