const mongoose = require('../config/database')
const schema = mongoose.Schema;

const log_schema = new mongoose.Schema({
    project: {
        type: schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    details: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ["console", "error"],
        default:"console"
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const ConsoleLog = mongoose.model('ConsoleLog', log_schema);



module.exports = ConsoleLog;