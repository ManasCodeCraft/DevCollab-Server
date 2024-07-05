    
module.exports = (io) =>{
    const dirStructureNamespace = io.of('/dir-structure-socket');
    const socketMap = new Map();

    dirStructureNamespace.on('connection', (socket) => {

        socket.on('register', (userId)=>{
            socket.userId = userId;
            socketMap.set(userId, socket.id);
        })

        socket.on('operation', (details)=>{
            const directory = details.directory;
            const userId = details.userId;
            const collaborators = details.collaborators;
            const data = details.data;
            const type = details.type;
            const target = details.target;
            for(let collaborator of collaborators){
                if(collaborator == userId){
                    continue;
                }
                const socketId = socketMap.get(collaborator);
                dirStructureNamespace.to(socketId).emit('operation', {directory, data, type, target});
            }
        })

        socket.on('disconnect', () => {
            if(socket.userId){
                socketMap.delete(socket.userId);
            }
        })

    });
}