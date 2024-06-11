const Invitation = require('../models/Invitation')
const User = require('../models/User');
const Project = require('../models/Project')

module.exports.ifInvitationIsInvalid = async function (senderId, recipientId, projectId){
    try{
        const recipient = await User.findById(recipientId);
        const project = await Project.findById(projectId);
    
        if (!senderId || !recipient || !project) {
          return { message: 'Sender, recipient, or project not found' }
        }
    
        if(project.collaborators.includes(recipient)){
           return { message: 'Recipient is already a collaborator' }
        }
    
        const preExistingInvitation = await Invitation.find({sender: senderId, recipient: recipientId, project: projectId})
        if(preExistingInvitation.length > 0){
            for(let invitation of preExistingInvitation){
                 if(invitation.status === 'pending' || invitation.status === 'accepted'){
                    return { message: 'Invitation already exists' }
                 }
            }
        }

        return false;
    }
    catch(error){
        console.error(error);
        return null;
    }
}


module.exports.registerInvitation = async function(invitation) {
    try{
        const newInvitation = new Invitation(invitation);
        return newInvitation.save();
    }
    catch(error){
        console.error(error);
        return null;
    }
}

module.exports.getInviations = async function(userId){
    try{
        var invitations = await Invitation.find({ recipient: userId }).populate('sender project');
        return invitations.filter(invitation => invitation.status === 'pending')
    }
    catch(error){
        console.error(error);
        return null;
    }
}


module.exports.ifInvitationReceivedBy = async function(userId ,invitationId){
  try{
    const invitation = await Invitation.findById(invitationId);
    
    if (!invitation || !(invitation.recipient == userId)) {
      return false;
    }
    return true;
  }
  catch(error){
    console.error(error);
    return null;
  }
}

module.exports.acceptProjectInvitation = async function (invitationId){
    try{
        const invitation = await Invitation.findById(invitationId);
        invitation.status = 'accepted';

        const project = await Project.findById(invitation.project);
        project.collaborators.push(invitation.recipient);
        await project.save();
        return invitation.save();
    }
    catch(error){
        console.error(error);
        return null;
    }
}


module.exports.rejectProjectInvitation = async function (invitationId){
    try{
        const invitation = await Invitation.findById(invitationId);
        invitation.status = 'rejected';
        return invitation.save();
    }
    catch(error){
        console.error(error);
        return null;
    }
}