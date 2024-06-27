let clients = new Map();

module.exports = (io) => {
  const chatNamespace = io.of("/chat-socket");

  chatNamespace.on("connection", (socket) => {
    let socketId = socket.id;

    socket.on("register", (data) => {
      const projectId = data.projectId;
      const collaborators = data.collaborators;
      const userId = data.userId;

      if (!projectId || !collaborators || collaborators.length === 0) {
        console.dev(
          "ProjectId, collaborators not found",
          projectId,
          collaborators
        );
        return;
      }

      // register new chat room for project
      if (!clients.has(projectId)) {
        const map = new Map();
        map.set(userId, socketId);
        clients.set(projectId, map);
      } else {
        // adding collaborator to chat room
        const map = clients.get(projectId);
        map.set(userId, socketId);
        clients.set(projectId, map);
      }
    });

    socket.on("message", (data) => {
      const map = clients.get(data.projectId);
      if(!map){
        return;
      }
      const collaborators = Array.from(map.keys());

      for(let collaborator of collaborators){
        if(collaborator === data.userId){
          continue;
        }
        const socketId = map.get(collaborator);
        if(!socketId){
          continue;
        }
        chatNamespace.to(socketId).emit("message", data.message);
      }

    });

  });
};
