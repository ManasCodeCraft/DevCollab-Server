
module.exports = (io) =>{
    const inviteNamespace = io.of('/invite-socket');
    const socketMap = new Map();

    inviteNamespace.on('connection', (socket) => {

        socket.on('register', (userId)=>{
            socket.userId = userId;
            socketMap.set(userId, socket.id);
        })

        socket.on('send-invite', ({userId, data})=>{
            const recipientSocketId = socketMap.get(userId);
            if(recipientSocketId){
                inviteNamespace.to(recipientSocketId).emit('invite', data);
            }
        })

        socket.on('add-collab', ({userId, projectId, data})=>{
            const recipientSocketId = socketMap.get(userId);
            if(recipientSocketId){
                inviteNamespace.to(recipientSocketId).emit('collab', {projectId, data});
            }
        })

        socket.on('remove-collab', ({userId, projectId})=>{
            const recipientSocketId = socketMap.get(userId);
            if(recipientSocketId){
                inviteNamespace.to(recipientSocketId).emit('delete-collab', { projectId });
            }
        })

        socket.on('disconnect', () => {
            if(socket.userId){
                socketMap.delete(socket.userId);
            }
        })

    });

    return inviteNamespace;
}