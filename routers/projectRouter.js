const express = require('express');
const { createProject, getAllProjects, updateProjectName, deleteProjectById, removeCollaborator, uploadProject, runNodejsProject, stopNodejsProject, createEmptyProject } = require('../controllers/projectControllers');
const { ProtectRoute } = require('../middlewares/authMiddlewares');
const { validateProjectOwner, validateCreateProject } = require('../middlewares/projectMiddlewares');
const { getAllActivityLogs } = require('../controllers/activityControllers');

const projectRouter = express.Router();

projectRouter.route('/create').post(ProtectRoute, validateCreateProject,createProject)
projectRouter.route('/create-empty').post(ProtectRoute, validateCreateProject, createEmptyProject);
projectRouter.route('/get-all').post(ProtectRoute, getAllProjects)
projectRouter.route('/edit-name').post(ProtectRoute, updateProjectName)
projectRouter.route('/delete').post(ProtectRoute, validateProjectOwner ,deleteProjectById)
projectRouter.route('/remove-collaborator').post(ProtectRoute, validateProjectOwner ,removeCollaborator)
projectRouter.route('/get-activity-logs').post(ProtectRoute ,getAllActivityLogs)
projectRouter.route('/run').post(ProtectRoute, runNodejsProject);
projectRouter.route('/stop').post(ProtectRoute, stopNodejsProject);

module.exports = projectRouter;