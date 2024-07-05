
module.exports = (io) =>{
    const codeEditorNamespace = io.of('/code-editor-socket');
    const socketMap = new Map();

    codeEditorNamespace.on('connection', (socket) => {

        socket.on('register', (userId)=>{
            socket.userId = userId;
            socketMap.set(userId, socket.id);
        })

        socket.on('text-change', (details)=>{
            const userId = details.userId;
            const collaborators = details.collaborators;
            const data = details.data;
            for(let collaborator of collaborators){
                if(collaborator == userId){
                    continue;
                }
                const socketId = socketMap.get(collaborator);
                codeEditorNamespace.to(socketId).emit('text-change', data);
            }
        })

        socket.on('disconnect', () => {
            const userId = socket.userId;
            if (userId) {
                socketMap.delete(userId);  
            }
        });

    });
}