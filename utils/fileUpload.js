const { isBinaryFile } = require('isbinaryfile');
const { uploadImageCloudinary } = require('../services/cloudinaryServices');

module.exports.handleFileUplaodInDirectory =  async function (file){
    const isBinary = await isBinaryFile(file.buffer);
    if(isBinary){
         const url = await uploadImageCloudinary(file.buffer);
         return {
            name: file.originalname,
            url: url,
            contentType: 'Binary',
            directory: file.directory
         }
    }
    else{
        return {
            name: file.originalname,
            contentType: 'String',
            content: file.buffer.toString(),
            directory: file.directory
        }
    }
}

module.exports.updateRelativePaths = function (files){
  const projectName = files[0].webkitRelativePath.slice(0, filePath.indexOf('/'));
  files.forEach(file=>{
       let filePath = file.webkitRelativePath;
       file.webkitRelativePath = filePath.slice(filePath.indexOf('/')+1, filePath.length)
  })
  return projectName;
}