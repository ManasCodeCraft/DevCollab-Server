const { getAllCollaborators } = require("../services/projectServices");

let clients = new Map();

module.exports = (io) => {
  const consoleLogNamespace = io.of("/console-log-socket");

  consoleLogNamespace.on("connection", (socket) => {
    socket.on("register", async (userId) => {
      if (!userId) return;
      socket.userId = userId;
      clients.set(userId.toString(), socket.id);
    });

    socket.on("send-console-log", async ({ projectId, log }) => {
      const allCollabs = await getAllCollaborators(projectId);
      if (!allCollabs) {
        console.error(
          "Unable to retrieve all collaborators for project",
          projectId,
          allCollabs
        );
        return;
      }

      for (let collaborator of allCollabs) {
        const socketId = clients.get(collaborator.toString());
        if (!socketId) {
          continue;
        }
        consoleLogNamespace
          .to(socketId)
          .emit("console-log", { projectId, log });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        clients.delete(socket.userId);
      }
    });
  });
};
