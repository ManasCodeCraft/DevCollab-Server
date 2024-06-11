const { registerNewFile, changeFileName, deleteProjectFile, updateFileContent } = require('../services/fileServices');
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
