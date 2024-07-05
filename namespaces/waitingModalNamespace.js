
module.exports = (io) => {
  const waitingModalNamespace = io.of("/waiting-modal-socket");

  const users = new Map();
  waitingModalNamespace.on("connection", (socket) => {
    socket.on("register", (userId) => {
      if (!userId) return;
      socket.userId = userId;
      users.set(userId, socket.id);
    });

    socket.on("trigger-launch-modal", ({ userId, text }) => {
      if (!userId || !text) {
        return;
      }
      const socketId = users.get(userId.toString());
      if (socketId) {
        waitingModalNamespace.to(socketId).emit("launch-modal", text);
      }
    });

    socket.on("trigger-close-modal", (userId) => {
      if(!userId) return;
      const socketId = users.get(userId.toString());
      if (socketId) {
        waitingModalNamespace.to(socketId).emit("close-modal");
      }
    });

    socket.on("trigger-change-text", ({userId, text}) => {
      const socketId = users.get(userId.toString());
      if (socketId) {
        waitingModalNamespace.to(socketId).emit("change-text", text);
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
