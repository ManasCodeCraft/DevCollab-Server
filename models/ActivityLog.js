const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Project' },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    activity: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '5d' } 
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
