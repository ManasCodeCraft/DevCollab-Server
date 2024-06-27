const express = require('express');
const { getDirectory, createDirectory, editDirectoryName, deleteDirectory } = require('../controllers/directoryControllers');
const { ProtectRoute } = require('../middlewares/authMiddlewares');
const { validateEditDirectoryName, validateCreateDirectory } = require('../middlewares/directoryMiddleware');

const directoryRouter = express.Router();

directoryRouter.route('/get-content').post(getDirectory)
directoryRouter.route('/create').post(ProtectRoute ,validateCreateDirectory ,createDirectory)
directoryRouter.route('/edit-name').post(ProtectRoute, validateEditDirectoryName ,editDirectoryName)
directoryRouter.route('/delete').post(ProtectRoute, deleteDirectory)

module.exports = directoryRouter; 