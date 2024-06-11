const mongoose = require('../config/database.js')
const Schema = mongoose.Schema;

const deploymentSchema = new Schema({
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    url: { type: String, required: true },
    req: [{type: Date}],
    status: { type: String, enum: ['suspended', 'active'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
  });
  

const Deploy = mongoose.model('Deploy', deploymentSchema);
module.exports = Deploy;
  