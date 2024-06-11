const { ifInvitationIsInvalid, ifInvitationReceivedBy } = require("../services/inviteServices");

module.exports.validateInviteRequest = async function(req, res, next){
  try{
      const senderId = req.userid;
      const { recipientId, projectId } = req.body;
      
      const check = await ifInvitationIsInvalid(senderId, recipientId, projectId);
      if(check){
          return res.status(400).json(check);
      }

      req.body.sender = senderId;
      req.body.recipient = recipientId;
      req.body.project = projectId;
      return next();
  }
  catch(error){
    console.error(error);
    res.status(500).json({message : 'Internal Server Error'});
  }
}


module.exports.validateAcceptOrRejectInvitation = async function (req, res, next) {
    try {
        const userid = req.userid;
        const invitationId = req.body.invitationId;

        const check = await ifInvitationReceivedBy(userid, invitationId);
        if(!check){
            return res.status(400).json({message: 'Invalid Request'});
        }
        next();
    }
catch(error){
    console.error(error);
    res.status(500).json({message : 'Internal Server Error'});
}
}