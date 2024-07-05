const express = require('express');
const { validateExecutionServerRequest } = require('../middlewares/validateExecutionServer');
const { mongodbModels, getServerConfig, onConsoleLog, updateRunningStatusHandler } = require('../controllers/executionServerController');

const executionServerRouter = express.Router();

executionServerRouter.route('/mongodb-models').post(validateExecutionServerRequest, mongodbModels)
executionServerRouter.route('/server-config').post(validateExecutionServerRequest, getServerConfig)
executionServerRouter.route('/console-log').post(validateExecutionServerRequest, onConsoleLog)
executionServerRouter.route('/update-status').post(validateExecutionServerRequest, updateRunningStatusHandler);

module.exports = executionServerRouter;