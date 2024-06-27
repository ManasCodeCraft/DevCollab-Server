
module.exports = (io) =>{
    const activityLogNamespace = io.of('/activity-log-socket');
    const socketMap = new Map();

    activityLogNamespace.on('connection', (socket) => {

        socket.on('register', (userId)=>{
            socketMap.set(userId, socket.id);
        })

        socket.on('send-log', (details)=>{
            const userId = details.userId;
            const collaborators = details.collaborators;
            const data = details.data;
            for(let collaborator of collaborators){
                if(collaborator == userId){
                    continue;
                }
                const socketId = socketMap.get(collaborator);
                activityLogNamespace.to(socketId).emit('add-log', data);
            }
        })

    });
}