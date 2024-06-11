module.exports.validateCreateDirectory = async function (req, res, next) {
  try {
    const { name, projectId, parentDirectoryId } = req.body;
    if (!name || !projectId || !parentDirectoryId) {
      return res.status(400).json({
        message: "Please fill all the fields",
      });
    }

    if (name === "node_modules") {
      return res.status(403).json({ message: "Don't include node_modules" });
    }

    req.body.project = projectId;
    req.body.parentDirectory = parentDirectoryId;
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.validateEditDirectoryName = async function (req, res, next){
    try{
        const {id, newName} = req.body;
        if(!id || !newName){
           return res.status(400).json({message: "Invalid Directory"})
        }
        if(newName.length === 0){
           return res.status(400).json({message: "Empty Name can't be given to a directory"})
        }
        if(newName === "node_modules"){
          return res.status(400).json({message: "You don't need to create node_modules directory"})
        }
        next();
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "Internal Server Error"});
    }
}
