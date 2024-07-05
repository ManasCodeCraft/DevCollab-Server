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
      if (!projectId || !userId || !message) {
        return;
      }
      const collaborators = (await getAllCollaborators(projectId)).map((coll) =>
        coll.toString()
      );

      for (let collaborator of collaborators) {
        if (collaborator == userId) {
          continue;
        }
        const socketId = clients.get(collaborator);
        if (!socketId) {
          continue;
        }
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

