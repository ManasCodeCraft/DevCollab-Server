const express = require('express')
const { createFile, uploadProjectFile, editFileName, deleteFile, updateFile } = require('../controllers/fileControllers')
const multer = require('multer');
const { ProtectRoute } = require('../middlewares/authMiddlewares');
const { validateFileName, createFileMiddleware, fileUploadMiddleWare, updateContentMiddleware } = require('../middlewares/fileMiddlewares');

const fileRouter = express.Router()

fileRouter.route('/create').post(ProtectRoute, validateFileName, createFileMiddleware, createFile)
fileRouter.route('/upload').post(ProtectRoute ,multer().single('file'), fileUploadMiddleWare ,uploadProjectFile)
fileRouter.route('/edit-name').post(ProtectRoute, validateFileName ,editFileName)
fileRouter.route('/delete').post(ProtectRoute, deleteFile)
fileRouter.route('/save').post(ProtectRoute, updateContentMiddleware,updateFile)

module.exports = fileRouter