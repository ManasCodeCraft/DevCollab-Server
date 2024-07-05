const { mongodbModelsOperation, emitConsoleLog, updateRunningStatus } = require("../services/executionServerRequest")
const config = require("../config/config")

module.exports.mongodbModels = async function (req, res, next){
    const executionString = req.body.executionString;
    if(!executionString){
        return res.status(400).json({ message: 'No execution string provided' });
    }
    const result = await mongodbModelsOperation(executionString);
    res.status(200).json(result);
}

module.exports.getServerConfig = async function (req, res){
    const serverConfig = { ...config };
    serverConfig.cloudinary = null;
    res.status(200).json(serverConfig);
}

module.exports.onConsoleLog = async function (req,res){
    const log = req.body.log;
    await emitConsoleLog(log);
    res.status(200).json({ message: 'Log emitted successfully' });
}

module.exports.updateRunningStatusHandler = async function (req, res){
    const { projectId, status } = req.body
    if(!projectId || !status) {
        return res.status(400).json({ message: 'Missing projectId or status' });
    }
    return await updateRunningStatus(projectId, status)
}