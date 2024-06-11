const { deployClientProject, suspendClientProject, resumeClientProject, reloadClientProject, getProjectLogs, saveConsoleLog, saveClientApp, getRequestData } = require('../services/deploymentServices');

module.exports.deployProject = async function (req, res){
    const projectId = req.body.projectId; 
    const result = await deployClientProject(projectId)
    if(result){
        return res.status(200).json({message: 'Project deployed successfully', url: result.url});
    }
    return res.status(400).json({message: 'Project not deployed successfully'});
}

module.exports.disableClientSite = async function (req, res){
     try{
        const result = await suspendClientProject(req.body.deployId);
        if(result){
            return res.status(200).send()
        }
        return res.status(400).send()
     }
     catch(error){
        console.error(error);
        return res.status(500).send();
     }
}

module.exports.resumeClientSite = async function (req, res){
    try{
        const result = await resumeClientProject(req.body.deployId);
        if(result){
            return res.status(200).send();
        }
        return res.status(400).send();
     }
     catch(error){
        console.error(error);
        return res.status(500).send();
     }
}

module.exports.reloadClientSite = async function (req, res) {
    try{
        const result = await reloadClientProject(req.body.projectId);
        if(result){
            return res.status(200).send();
        }
        return res.status(400).send();
     }
     catch(error){
        console.error(error);
        return res.status(500).send();
     }
}

module.exports.getlogs = async function (req, res){
    const deployId = req.body.deployId;
    const logsString = await getProjectLogs(deployId);

    return res.status(200).json(logsString);
}

