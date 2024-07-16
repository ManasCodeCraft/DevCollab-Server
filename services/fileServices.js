const File = require('../models/File')
const Directory = require('../models/Directory');
const { DeleteOldImageFromCloudinary } = require('./cloudinaryServices');
const { onExecutionServer } = require('./apiClient');

module.exports.ifFileWithSameNameExist = async function (fileName, parentDirId){
   try{
      const dir = await Directory.findById(parentDirId).populate('files');
      if(!dir){
        return false;
      }
      const files = dir.files;
      if(!dir.files){
        return false;
      }
      const fileNames = files.filter(file=>file.name)

      if(fileNames.includes(fileName)){
        return true;
      }
      return false;
   }
   catch(error){
    console.error(error);
   }
}

module.exports.registerNewFile = async function (file){
    try{
        const file_object = new File(file);
        const savedFile = await file_object.save();
        const dir = savedFile.directory;

        //updating parent directory
        const directory = await Directory.findById(dir);
        directory.files.push(savedFile._id);
        await directory.save();

        await onExecutionServer(savedFile._id, true, 'create', file.content)

        return savedFile;
    }
    catch(error){
        console.error(error);
    }
}

module.exports.changeFileName = async function (id, fileName){
    try{
        const file= await File.findById(id);
        if(!file){
            return null;
        }
        await onExecutionServer(id, true, 'editname', fileName)
        file.name = fileName;
        return await file.save();
    }
    catch(error){
        console.error(error);
        return null;
    }
}

module.exports.deleteProjectFile = async function (id){
    try{
        const file = await File.findById(id);
        if(!file){
            return null;
        }
        await onExecutionServer(id, true, 'delete')
        
        if(file.contentType === 'Binary'){
            DeleteOldImageFromCloudinary(file.url);
        }

        const dir = await Directory.findById(file.directory);
        dir.files.pull(file._id);
        await dir.save();

        await File.findByIdAndDelete(file._id);
        return file;
    }
    catch(error){
        console.error(error);
        return null;
    }
}

module.exports.ifFileIsBinary = async function(id){
    try{
        const file = await File.findById(id);
        if(!file){
            return null;
        }
        return (file.contentType === 'Binary');
    }
    catch(error){
        console.error(error);
        return null;
    }
}

module.exports.updateFileContent = async function (id, content){
    try{
        const file = await File.findById(id);
        if(!file){
            return null;
        }
        await onExecutionServer(id, true, 'write', content)
        file.content = content;
        return await file.save();
    }
    catch(error){
        console.error(error);
        return null;
    }
}