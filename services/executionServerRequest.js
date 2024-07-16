const Project = require('../models/Project');
const User = require('../models/User');
const File = require('../models/File');
const Directory = require('../models/Directory');
const ActivityLog = require('../models/ActivityLog');
const ConsoleLog = require('../models/ConsoleLog');
const io = require('socket.io-client');
const { baseURL } = require('../config/config');
const { formatProjectLog, formatFile } = require('../utils/formatUtils')
const runningStatusSocket = io(`${baseURL}/running-status-socket`);
const dirStructureSocket = io(`${baseURL}/dir-structure-socket`);

module.exports.mongodbModelsOperation = async function(executionString){
    var executeOperation = null;
    eval(`
        executeOperation = async function (){
            const result = ${executionString};
            return result;
        }
    `)
    const result = await executeOperation();
    return result;
}

module.exports.emitConsoleLog = async function (log){
    const consoleLog = new ConsoleLog(log);
    await consoleLog.save();

    const socket = io(`${baseURL}/console-log-socket`);
    socket.emit('send-console-log', {projectId: consoleLog.project, log: formatProjectLog(consoleLog)})
}

module.exports.updateRunningStatus = async function (projectId, status){
    const project = await Project.findByIdAndUpdate(projectId, {runningStatus: status}, {new: true});
    runningStatusSocket.emit('update-status', {projectId, userId:null ,status})
    return project;
}

module.exports.updatePackageJson = async function (projectId, content){
    const file = await File.findOneAndUpdate({project: projectId, name: 'package.json'}, {content: content});
    const details = {
        type: 'update',
        target: 'file',
        data: {id: file._id, content: content},
        userId: null,
        directory: file.directory,
        collaborators: (await Project.findById(file.project)).collaborators
    }
    dirStructureSocket.emit('send-operation', details);
    return true;
}

module.exports.getFileOrFolderPath = async function (id, isFile){
    if(isFile) return (await File.findById(id)).path;
    return (await Directory.findById(id)).path;
}