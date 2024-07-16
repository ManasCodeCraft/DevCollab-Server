const express = require('express');
const { validateExecutionServerRequest } = require('../middlewares/validateExecutionServer');
const { getServerConfig } = require('../controllers/executionServerController');

const executionServerRouter = express.Router();

executionServerRouter.route('/server-config').post(validateExecutionServerRequest, getServerConfig)

module.exports = executionServerRouter;