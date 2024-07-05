const { getAllCollaborators } = require("../services/projectServices");

module.exports = (io) => {
  const runningStatusNamespace = io.of("/running-status-socket");

  const users = new Map();
  runningStatusNamespace.on("connection", (socket) => {
    socket.on("register", (userId) => {
      if (!userId) return;
      socket.userId = userId;
      users.set(userId, socket.id);
    });

    socket.on("update-status", async ({ projectId, userId, status }) => {
      try {
        if (!projectId || !status) {
          return;
        }
        const allCollaborators = await getAllCollaborators(projectId);
        for (let collaborator of allCollaborators) {
          if (collaborator === userId) continue;
          const socketId = users.get(collaborator.toString());
          if (socketId) {
            runningStatusNamespace
              .to(socketId)
              .emit("status-update", { projectId, status });
          }
        }
      } catch (error) {
        console.error("Error fetching collaborators: ", error);
      }
    });

    socket.on("disconnect", () => {
      const userId = socket.userId;
      if (userId) {
        users.delete(userId);
      }
    });
  });
};
