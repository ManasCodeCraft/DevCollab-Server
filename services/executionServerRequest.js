const Project = require('../models/Project');
const User = require('../models/User');
const File = require('../models/File');
const Directory = require('../models/Directory');
const ActivityLog = require('../models/ActivityLog');
const ConsoleLog = require('../models/ConsoleLog');
const io = require('socket.io-client');
const { baseURL } = require('../config/config');
const { formatProjectLog } = require('../utils/formatUtils')

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
    io('/running-status-socket').emit('update-status', {projectId, status})
    return project;
}
