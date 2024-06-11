const {
  ProjectNotDeployed,
  getProjectFileNames,
} = require("../services/projectServices");
const ClientAppManager = require("../client_request_handlers/clientAppManager");
const { getDeployId } = require("../services/deploymentServices");

module.exports.validateDeployRequest = async function (req, res, next) {
  try {
    const projectId = req.body.projectId || req.body.id || req.body.project;
    const fileNames = await getProjectFileNames(projectId);
    if(!fileNames){
      return res.status(404).send()
    }

    if (!fileNames.includes("package.json")) {
      return res
        .status(400)
        .json({ message: "No package.json file found in project" });
    }

    if (await ProjectNotDeployed(projectId)) {
      return next();
    }

    return res.status(400).json({ message: "Invalid Request" });
  } catch (error) {
    console.error(error);
  }
};

module.exports.passDeployId = async function (req, res, next) {
  try {
    const projectId = req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ message: "Invalid Request" });
    }
    const deployId = await getDeployId(projectId);
    if(!deployId){
      return res.status(400).json({ message: "Invalid Request" });
    }
    req.body.deployId = deployId;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports.validateSelfRequest = async function (req,res, next)
{
  try{
     if(!req.body.clientapp){
        console.log(req.body);
        return res.status(400).send();
     }
     const selfId = req.query.key;
    
     if(selfId === require('../config/config').devcollabKey){
         return next();
     }
     return res.status(401).json({message: "Invalid Request"});
  }
  catch(error){
    console.error(error);
    return res.status(500).json({message: "Internal Server Error"});
  }
}