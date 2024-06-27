const ActivityLog = require('../models/ActivityLog');
const baseURL = require('../config/config').baseURL;
const io = require('socket.io-client');
const { getAllCollaborators } = require('./projectServices');
const socket = io(`${baseURL}/activity-log-socket`)

// Log an activity
module.exports.logActivity = async (userId, projectId ,activity) => {
    try {
        const newLog = new ActivityLog({ user: userId, project: projectId, activity });
        await newLog.save();
        const data = await newLog.populate('user')
        const collaborators = await getAllCollaborators(projectId);
        socket.emit('send-log', {
            userId: userId,
            collaborators: collaborators,
            data: data
        })
        return newLog;
    } catch (error) {
        throw new Error(`Unable to log activity: ${error.message}`);
    }
};

// Get all activity logs
module.exports.getProjectLogs = async (projectId) => {
    try {
        return await ActivityLog.find({project: projectId}).populate('user');
    } catch (error) {
        throw new Error(`Unable to retrieve activity logs: ${error.message}`);
    }
};
