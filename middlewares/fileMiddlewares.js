const { isBinaryFileSync } = require("isbinaryfile");
const { ifFileWithSameNameExist, ifFileIsBinary } = require("../services/fileServices");
const { uploadImageCloudinary } = require("../services/cloudinaryServices");


module.exports.validateFileName = async function (req, res, next){
    try{
        const parentDirectoryId = req.body.parentDirectoryId;
        const name = req.body.name || req.body.newName;
        if(!name){
            if(req.file){
                name = req.file.originalname;
            }
            else{
                return res.status(400).json({message: 'Name is required'})
            }
        }
        const check = await ifFileWithSameNameExist(name, parentDirectoryId);
        if(check){
            return res.status(400).json({message: 'File with same name already exists'})
        }
        next();
    }
    catch(error){
        console.error(error);
    }
}

module.exports.createFileMiddleware = async function (req, res, next){
    try{
        req.body.content = '';
        req.body.contentType = 'String';
        req.body.directory = req.body.parentDirectoryId;
        req.body.project = req.body.projectId;
        if(!req.body.project || !req.body.directory){
            return res.status(400).send();
        }
        next();
    }
    catch(error){
        console.error(error);
    }
}

module.exports.fileUploadMiddleWare = async function(req, res, next){
    try{
        var { parentDirectoryId, projectId } = req.body;
        var file = req.file;
        if(!file || !parentDirectoryId || !projectId){
            return res.status(400).json({message: 'Invalid Request'})
        }
        var buffer = req.file.buffer;
        const isBinary = isBinaryFileSync(buffer);
        if(isBinary){
            const secure_url = await uploadImageCloudinary(buffer);
            req.body.contentType = 'Binary';
            req.body.url = secure_url;
            req.body.directory = parentDirectoryId;
            req.body.project = projectId;
            req.body.name = req.file.originalname;
            next();
        }

        else{
            req.body.content = '';
            req.body.contentType = 'String';
            req.body.directory = parentDirectoryId;
            req.body.project = projectId;
            req.body.name = req.file.originalname;
            next();
        }
    }

    catch(error){
        console.error(error);
        return res.status(500).json('Internal Server Error')
    }
}

module.exports.updateContentMiddleware = async function(req, res, next){
    try{
        const {id, content} = req.body;
        if(!id ||!content){
            return res.status(400).json({message: 'Invalid Request'})
        }

        const check = await ifFileIsBinary(id);

        if(check){
            return res.status(400).json({message: 'Invalid Request'})
        }

        next();
    }
    catch(error){
        console.error(error);
        return res.status(500).json('Internal Server Error')
    }
}