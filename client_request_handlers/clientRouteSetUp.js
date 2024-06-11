const ClientAppManager = require("./clientAppManager");
const Deploy = require('../models/Deploy');
const devcollabKey = require("../config/config").devcollabKey;

var Server = undefined;

module.exports.setUpClientRoute = function setUpClientRoute(projectId) {
  if (!Server) {
    throw new Error("Server configuration failed");
  }
  Server.use(`/client-project/${projectId}`, async (req, res, next) => {
    const key = `${devcollabKey}_projectId`;
    req[key] = projectId;
    next();
  });

  Server.use(`/client-project/${projectId}`, async (req, res, next) => {
     const status = await getProjectDeployStatus(projectId);
     if(status === 'active'){
        return next();
     }
     res.status(404).send();
  });

  Server.use(`/client-project/${projectId}`, async (req, res, next) => {
    const app = ClientAppManager.getApp(projectId);
    if(!app){
        return res.status(404).send();
    }
    trackRequest(projectId);
    app(req, res, next);
  });
};

module.exports.storeNodeApp = function (app) {
  Server = app;
};


async function trackRequest(projectId){
    await Deploy.updateOne({project: projectId}, {$push: { req: Date.now()}})
}

async function getProjectDeployStatus (projectId) {
    try {
      const project = await Deploy.findOne({ project: projectId });
      if (!project) {
        return null;
      }
      return project.status;
    } catch (error) {
      console.error(error);
      return null;
    }
  };