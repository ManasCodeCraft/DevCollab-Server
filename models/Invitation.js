const mongoose = require('../config/database'); 
const Schema = mongoose.Schema;

const invitationSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true, 
  },
  project: {
    type: Schema.Types.ObjectId, 
    ref: 'Project',
    required: true, 
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending',
  },
  created_at: {
    type: Date,
    default: Date.now, 
  },
});

const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;
