const express = require('express');
const { createProject, getAllProjects, updateProjectName, deleteProjectById, removeCollaborator } = require('../controllers/projectControllers');
const { ProtectRoute } = require('../middlewares/authMiddlewares');
const { validateProjectOwner, validateCreateProject } = require('../middlewares/projectMiddlewares');

const projectRouter = express.Router();

projectRouter.route('/create').post(ProtectRoute, validateCreateProject,createProject)
projectRouter.route('/get-all').post(ProtectRoute, getAllProjects)
projectRouter.route('/edit-name').post(ProtectRoute, updateProjectName)
projectRouter.route('/delete').post(ProtectRoute, validateProjectOwner ,deleteProjectById)
projectRouter.route('/remove-collaborator').post(ProtectRoute, validateProjectOwner ,removeCollaborator)

module.exports = projectRouter;