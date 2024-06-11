const mongoose = require('../config/database');
const Schema = mongoose.Schema;

const DirectorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    project: { 
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    parentDirectory: {
        type: Schema.Types.ObjectId,
        ref: 'Directory'
    },
    subDirectory: [{
        type: Schema.Types.ObjectId,
        ref: 'Directory'
    }],
    files: [{
        type: Schema.Types.ObjectId,
        ref: 'File'
    }]
});

const Directory = mongoose.model('Directory', DirectorySchema);

module.exports = Directory;
