const { registerInvitation, getInviations, acceptProjectInvitation, rejectProjectInvitation } = require('../services/inviteServices');

module.exports.createInvitation = async function createInvitation(req, res) {
  try {
    const newInvitation = await registerInvitation(req.body);
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
    res.status(200).json(invitation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error accepting invitation', error });
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

