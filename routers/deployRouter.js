const express = require('express');
const { validateDeployRequest, passDeployId } = require('../middlewares/deployMiddlewares');
const { deployProject ,resumeClientSite, disableClientSite, reloadClientSite, getlogs, getStats } = require('../controllers/deploymentControllers');
const { ProtectRoute } = require('../middlewares/authMiddlewares');

const deployRouter = express.Router()

deployRouter.route('/hostProject').post(ProtectRoute, validateDeployRequest ,deployProject)
deployRouter.route('/enableHosting').post(ProtectRoute, passDeployId, resumeClientSite)
deployRouter.route('/disableHosting').post(ProtectRoute, passDeployId ,disableClientSite)
deployRouter.route('/reload').post(ProtectRoute ,reloadClientSite)
deployRouter.route('/logs').post(ProtectRoute, passDeployId ,getlogs)

module.exports.deployRouter = deployRouter;
