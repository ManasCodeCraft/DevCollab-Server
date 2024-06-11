const Directory = require("../models/Directory");
const File = require("../models/File");
const { formatDirectoryContent, formatFile, formatDir } = require("../utils/formatUtils");
const { DeleteOldImageFromCloudinary } = require("./cloudinaryServices");
const { manageOnLocal } = require("./deploymentServices");

module.exports.directoryCleanUp = async function (directory) {
  try {
    var directories = directory.subDirectory;
    for (let dir of directories) {
      let subDir = await Directory.findById(dir);
      await Directory.findByIdAndDelete(dir);
      await module.exports.directoryCleanUp(subDir);
    }
    for (let file of directory.files) {
      if (file.contentType === "Binary") {
        DeleteOldImageFromCloudinary(file.url);
      }
      await File.findByIdAndDelete(file);
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports.registerDirectory = async function (directory) {
  try {
    const dir = new Directory(directory);
    const savedDir = await dir.save();
    
    if(dir.parentDirectory){
      const parent = await Directory.findById(directory.parentDirectory);
      parent.subDirectory.push(savedDir._id);
      await parent.save();
    }

    await manageOnLocal(savedDir._id, false, 'create')
    return savedDir

  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.getDirectorySubDirectoriesAndFiles = async function (directory) {
  try {
    const dirs = directory.subDirectory;
    const files = directory.files;
    var data = {}
    if (dirs && dirs.length> 0){
      data.directories = await Promise.all(dirs.map(async (dir) => {
        const dir_ = await Directory.findById(dir);
        return formatDir(dir_);
      }))
    }
    else{
      data.directories = [];
    }
    
    if(files && files.length > 0){
      data.files = await Promise.all(files.map(async (file) => {
        const file_ = await File.findById(file);
        return formatFile(file_);
      }))
    }
    else{
      data.files = [];
    }

    return data;
  } catch (error) {
    console.error(error);
    return {};
  }
};

module.exports.getDirectoryContent = async function (id) {
  try {
    const directory = await Directory.findById(id);
    if(!directory){
      return null;
    }
    const data = await module.exports.getDirectorySubDirectoriesAndFiles(directory);
    const dirContent = await formatDirectoryContent(directory, data);
    return dirContent;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.changeDirectoryName = async function (id, newName){
    try{
        const dir = await Directory.findById(id);
        await manageOnLocal(id, false, 'editname', newName);
        dir.name = newName;
        return await dir.save();
    }
    catch(error){
        console.error(error);
        return null;
    }
}

module.exports.deleteProjectDirectory = async function (id){
    try{
        await manageOnLocal(id, false, 'delete')
        const directory = await Directory.findById(id);
        if(!directory) {
            return null;
        }

        const parentDirectory = await Directory.findById(directory.parentDirectory);
        parentDirectory.subDirectory.pull(directory._id);
        await parentDirectory.save();

        module.exports.directoryCleanUp(directory)

        await Directory.findByIdAndDelete(id);
        return directory;
    }
    catch(error){
        console.error(error);
        return null;
    }
}
