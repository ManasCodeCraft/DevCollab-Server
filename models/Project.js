const mongoose = require('../config/database');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        type: Schema.Types.ObjectId,
        ref: 'User', 
    }],
    rootDirectory: {
        type: Schema.Types.ObjectId,
        ref: 'Directory',
    },
    runningStatus: {
        type: String,
        enum: ["running", "not running", "crashed"],
        default: 'running',
    }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
