const { mongodbModelsOperation, emitConsoleLog, updateRunningStatus, updatePackageJson } = require('../services/executionServerRequest');

const secretKey = require('../config/config').devcollabInterServerRequestKey

var isConnected = false;
var serverSocket = null;

module.exports.sendOnExecutionServer = async function (eventName ,data){
    if(isConnected && serverSocket){
        if(typeof data !== 'object'){
            console.error('incorrect data - format, on sending request to execution server')
            return null;
        }
        data.key = secretKey;
        return await new Promise((resolve, reject) => {
            serverSocket.emit(eventName, data);
            serverSocket.on(`${eventName}-response`, resolve);
        })
    }
    console.error('Execution Server is not connected');
    return null;
}

module.exports.nameSpace = (io) => {
    const executionServerNamespace = io.of('/execution-server-socket');

    executionServerNamespace.on('connection', (socket) => {
        isConnected = true;
        serverSocket = socket;

        socket.on('mongodb-models', async ({key, executionString})=>{
            if(key === secretKey){
               const data = await mongodbModelsOperation(executionString);
               serverSocket.emit('mongodb-models-response', {key, data})
            }
        })

        socket.on('console-log', async ({key, log})=>{
            if(key === secretKey){
                const result = await emitConsoleLog(log);
                serverSocket.emit('console-log-response', {key, data: result});
            }
        })

        socket.on('update-status', async ({key, projectId, status})=>{
            if(key === secretKey){
                const result = await updateRunningStatus(projectId, status);
                serverSocket.emit('update-status-response', {key, data: result})
            }
        })

        socket.on('update-package-json', async ({key, projectId, content})=>{
            if(key === secretKey){
                const result = await updatePackageJson(projectId, content);
                serverSocket.emit('update-package-json-response', {key, data: result})
            }
        })

        socket.on('get-server-config', async ({key})=>{
            if(key === secretKey){
                const config = require('../config/config');
                const result = { ...config };
                result.cloudinary = null;
                serverSocket.emit('get-server-config-response', {key, data: result})
            }
        })

        socket.on('disconnect', () => {
            isConnected = false;
            serverSocket = null;
        })
    });
}