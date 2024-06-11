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
    isDeployed: {
        type: Boolean,
        default: false
    }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
