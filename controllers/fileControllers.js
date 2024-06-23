const { registerDirectory, ifDirectoryExist } = require('../services/directoryServices');
const { registerNewFile, changeFileName, deleteProjectFile, updateFileContent } = require('../services/fileServices');
const { handleFileUplaodInDirectory } = require('../utils/fileUpload');
const { formatFile } = require('../utils/formatUtils');

// Create a new file
module.exports.createFile = async function createFile(req, res) {
  try {
   
    const newFile = await registerNewFile(req.body);
    if(!newFile){
      return res.status(400).json({message: 'Failed to create file'})
    }

    const createdFileDetails = formatFile(newFile)
    res.status(201).json(createdFileDetails);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error creating file' });
  }
}


// upload file
module.exports.uploadProjectFile = async function uploadProjectFile(req,res){
    try{
        const createdFile = await registerNewFile(req.body);
        const createdFileDetails = formatFile(createdFile);
        res.status(201).json(createdFileDetails);
    }
    catch(error){
      console.log(error)
      res.status(500).json({ message: 'Error uploading file', error });
    }
}


module.exports.editFileName = async function editFileName(req, res) {
  try {
    const {id, newName} = req.body;
    if(!id){
        return res.status(400).json({ message: "Invalid File" });
    }

    const file = await changeFileName(id, newName);
    res.status(200).json(newName);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete a file
module.exports.deleteFile = async function deleteFile(req, res) {
  const id = req.body.id;
  if (!id) {
    return res.status(400).json({ message: "Invalid File" });
  }

  try {
    const file = await deleteProjectFile(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error });
  }
};

module.exports.updateFile = async function upadateFile(req,res){
   try{
       const {id, content} = req.body
       const file = await updateFileContent(id, content)
       return res.status(200).json(file);
   }
   catch(error){
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
   }
}

module.exports.uploadFilePath = async function uploadFilePath(req,res){
    const path = req.body.relativePath;
    const project = req.body.project;
    const file = req.file;
    var dirId = req.body.directory;

    if(path.indexOf('node_modules') !== -1){
      return res.status(400).json({message: 'Invalid Path'})
    }

    const pathArray = path.split('/');

    for(let i = 0; i<pathArray.length-1; i++) {
        const preExist = await ifDirectoryExist(project, dirId ,pathArray[i]);
        if(preExist){
          dirId = preExist._id;
          continue;
        }
        const dir = await registerDirectory({
          name: pathArray[i],
          parentDirectory: dirId,
          project: project
        })
        if(!dir){
          return res.status(400).json({message: 'Failed to create directory'})
        }
        dirId = dir._id;
    }

    const fileObj = await handleFileUplaodInDirectory(file);
    fileObj.project = project;
    fileObj.directory = dirId;
    const newFile = await registerNewFile(fileObj);

    if(newFile){
      return res.status(201).json(newFile);
    }

    return res.status(400).json({message: 'Failed to create file'})
}