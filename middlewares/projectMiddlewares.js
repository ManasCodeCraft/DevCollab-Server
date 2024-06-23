const { checkForProjectOwner, ifMaxProjectsExceeded, getProjectName } = require("../services/projectServices");


module.exports.validateProjectOwner = async function (req, res, next){
    try{
        var user_id = req.userid;
        var projectId = req.body.projectId || req.body.projecid || req.body.project || req.body.id;
        if(!projectId){
            return res.status(400).json({message: 'Project not found'})
        }
        const check = await checkForProjectOwner(projectId, user_id);
        if(check){
            return next();
        }
        return res.status(401).json({message: 'You are not authorized to perform this action'})
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message: 'Internal Server Error'})
    }
}


module.exports.removeCollaboratorMiddleware = async function (req, res, next){
    try{
        const collaboratorId = req.body.collaboratorId;
        const userId = req.userid;
        if(userId == collaboratorId){
            return res.status(400).json({message: 'You cannot remove yourself as a collaborator'})
        }
        next();
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

module.exports.validateCreateProject = async function (req, res, next)
{
    try{
        const userId = req.userid;
        if(await ifMaxProjectsExceeded(userId)){
            return res.status(400).json({message: `You have reached the limit of ${require('../config/config').maxAllowedProjects} projects`})
        }
        const projectName = req.body.projectName;
        if(!projectName){
            return res.status(400).json({message: 'Project name is required'})
        }

        req.body.owner = userId;
        req.body.collaborators = [userId];
        req.body.name = projectName;
        return next();
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

module.exports.validateDownloadRequest = async function(req, res, next){
    const projectId = req.params.projectId;
    if(!projectId){
        return res.status(400).json({message: 'Project not found'})
    }
    const name = await getProjectName(projectId);
    if(!name){
        return res.status(400).json({message: 'Project not found'})
    }
    req.projectId = projectId;
    req.projectName = name
    return next();
}