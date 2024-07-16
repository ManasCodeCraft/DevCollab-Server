const mongoose = require('../config/database');
const Directory = require('./Directory');
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
    path: [{
        type: String,
    }],
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    }
});

fileSchema.pre('save', async function(next){
    if(this.isModified('name')){
        const directory = await Directory.findById(this.directory);
        this.path = [...directory.path ,this.name];
    }
    next();
})

// Create the File model
const File = mongoose.model('File', fileSchema);

module.exports = File;
