const { registerDirectory, getDirectoryContent, changeDirectoryName, deleteProjectDirectory } = require('../services/directoryServices');
const { formatDir } = require('../utils/formatUtils');

// Create a new directory
module.exports.createDirectory = async function createDirectory(req, res) {
  try {
    const dir = await registerDirectory(req.body);
    res.status(201).json(formatDir(dir));
  } catch (error) {
    res.status(500).json({ message: 'Error creating directory'});
  }
}

// Get a specific directory by ID
module.exports.getDirectory = async function getDirectory(req, res) {
  const id = req.body.id

  try {
    const directory = await getDirectoryContent(id);
    if(!directory){
      return res.status(400).json({message: 'Directory not found'})
    }

    res.json(directory);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: 'Error fetching directory', error });
  }
}

// Update a directory's name
module.exports.editDirectoryName = async function editDirectoryName(req,res){
    try{
       const {id, newName} = req.body;
       const dir = await changeDirectoryName(id,newName);
       if(!dir){
         return res.status(400).json({message: 'Directory not found'})
       }

       res.status(200).json(newName)
    }
    catch(err){
      console.log(err);
      res.status(500).json({message: 'Internal Server Error'})
    }
}

// Delete a directory 
module.exports.deleteDirectory = async function deleteDirectory(req, res) {
  const id = req.body.id;
  if(!id){
    return res.status(400).json({message: "Invalid Directory"})
  }

  try {
    const directory = await deleteProjectDirectory(id);
    if(!directory){
      return res.status(400).json({message: 'Directory not found'})
    }

    res.status(200).json({ message: 'Directory deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting directory', error });
  }
}


