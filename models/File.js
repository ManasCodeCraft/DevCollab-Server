const mongoose = require('../config/database');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        enum: ['String', 'Binary'],
        required: true
    },
    content: {
        type: String
    },
    url: {
        type: String,
    },
    directory: {
        type: Schema.Types.ObjectId,
        ref: 'Directory',
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    }
});

// Create the File model
const File = mongoose.model('File', fileSchema);

module.exports = File;
