const express = require('express');
const { createInvitation, getInvitationsForUser, acceptInvitation, rejectInvitation, getCollaborators, removeCollaborator } = require('../controllers/invitationControllers');
const { validateInviteRequest, validateAcceptOrRejectInvitation } = require('../middlewares/invitationMiddlewares');
const { ProtectRoute } = require('../middlewares/authMiddlewares');

const invitationRouter = express.Router();

invitationRouter.route('/send').post(ProtectRoute,validateInviteRequest ,createInvitation)
invitationRouter.route('/get-all').post(ProtectRoute, getInvitationsForUser)
invitationRouter.route('/accept').post(ProtectRoute, validateAcceptOrRejectInvitation ,acceptInvitation)
invitationRouter.route('/reject').post(ProtectRoute, validateAcceptOrRejectInvitation ,rejectInvitation)

module.exports = invitationRouter;