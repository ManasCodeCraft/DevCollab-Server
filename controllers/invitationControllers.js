const { baseURL } = require('../config/config');
const { registerInvitation, getInviations, acceptProjectInvitation, rejectProjectInvitation } = require('../services/inviteServices');
const { getProjectDetails, getProjectCollaborator} = require('../services/projectServices')
const { logActivity } = require('../services/activityLogServices');
const io = require('socket.io-client');
const socket = io(`${baseURL}/invite-socket`)

module.exports.createInvitation = async function createInvitation(req, res) {
  try {
    const newInvitation = await registerInvitation(req.body);
    const data = await newInvitation.populate('sender project')
    socket.emit('send-invite', {userId: newInvitation.recipient, data})
    res.status(201).json(newInvitation);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error creating invitation', error });
  }
};

module.exports.getInvitationsForUser = async function getInvitationsForUser(req, res) {
  const userId = req.userid; 

  try {
    var invitations = await getInviations(userId);
    res.status(200).json(invitations);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error fetching invitations', error });
  }
};

module.exports.acceptInvitation = async function acceptInvitation(req, res) {
  const { invitationId } = req.body;

  try {
    const invitation = await acceptProjectInvitation(invitationId);
    logActivity(req.userid, invitation.project, `joined via invite`)
    const details = await getProjectDetails(invitation.project, invitation.recipient);
    const data = await getProjectCollaborator(invitation.project, invitation.recipient)
    socket.emit('add-collab', {userId: invitation.sender, projectId: invitation.project, data})
    res.status(200).json(details);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error accepting invitation'});
  }
};

module.exports.rejectInvitation = async function rejectInvitation(req, res) {
  const { invitationId } = req.body;

  try {
    const invitation = await rejectProjectInvitation(invitationId)
    res.status(200).json(invitation);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting invitation', error });
  }
};

