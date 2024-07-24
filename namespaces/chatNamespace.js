const { getAllCollaborators } = require("../services/projectServices");

let clients = new Map();

module.exports = (io) => {
  const chatNamespace = io.of("/chat-socket");

  chatNamespace.on("connection", (socket) => {
    let socketId = socket.id;

    socket.on("register", async (userId) => {
      socket.userId = userId;
      clients.set(userId, socketId);
    });

    socket.on("send-message", async ({ projectId, userId, message }) => {
      console.log(projectId, userId, message);
      if (!projectId || !userId || !message) {
        return;
      }
      const collaborators = await getAllCollaborators(projectId)
      console.log(collaborators.length, collaborators)

      for (let collaborator of collaborators) {
        console.log('collab - ', collaborator)
        if (collaborator == userId) {
          continue;
        }
        const socketId = clients.get(collaborator.toString());
        if (!socketId) {
          continue;
        }
        console.log('sending... ', socketId, projectId, message)
        chatNamespace.to(socketId).emit("message", {
          projectId,
          message,
        });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        clients.delete(socket.userId);
      }
    });
  });
};

