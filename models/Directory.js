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
    path: [{
        type: String,
    }],
    subDirectory: [{
        type: Schema.Types.ObjectId,
        ref: 'Directory'
    }],
    files: [{
        type: Schema.Types.ObjectId,
        ref: 'File'
    }]
});

DirectorySchema.pre('save', async function(next){
    if(this.parentDirectory && this.isModified('parentDirectory')){
        const directory = await Directory.findById(this.parentDirectory);
        this.path = [...directory.path ,this.name];
    }
    next();
})

const Directory = mongoose.model('Directory', DirectorySchema);

module.exports = Directory;
