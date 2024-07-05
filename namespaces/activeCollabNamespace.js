const { getCollaboratorDetails } = require("../services/authServices");

const users = new Map(); // userId, socketId
const activeCollabStore = new Map(); // projectId, array of collaborators

module.exports = (io) => {
  const activeCollabNamespace = io.of("/active-collab-socket");
  activeCollabNamespace.on("connection", (socket) => {
    socket.on("register", (userId) => {
      socket.userId = userId;
      users.set(userId, socket.id);
    });

    socket.on("join-collab", async ({ projectId, userId }) => {
      try {
        const collabs = updateActiveCollab(projectId, userId);

        socket.projectId = projectId;

        const collabsInfo = await getCollabsInfo(collabs);
        const collabsInfoToSend = collabsInfo.map(
          (collabInfo) => collabInfo.data
        );
        collabsInfo.forEach((collab) => {
          activeCollabNamespace
            .to(collab.socketId)
            .emit("update-active-collab", {
              projectId,
              data: collabsInfoToSend,
            });
        });
      } catch (error) {
        console.error("Error joining collab:", error);
      }
    });

    socket.on("disconnect", async () => {
      const userId = socket.userId;
      if (userId) {
        users.delete(userId);
      }

      const projectId = socket.projectId;
      if (projectId) {
        try {
          const collabs = activeCollabStore.get(projectId);
          const collabsInfo = await getCollabsInfo(collabs);
          const collabsInfoToSend = collabsInfo.map(
            (collabInfo) => collabInfo.data
          );
          collabsInfo.forEach((collab) => {
            activeCollabNamespace
              .to(collab.socketId)
              .emit("update-active-collab", {
                projectId,
                data: collabsInfoToSend,
              });
          });
        } catch (error) {
          console.error("Error handling disconnect:", error);
        }
      }
    });
  });
};

function updateActiveCollab(projectId, userId) {
  let collabs = activeCollabStore.get(projectId) || [];
  if (!collabs.includes(userId)) {
    collabs.push(userId);
    activeCollabStore.set(projectId, collabs);
  }
  return collabs;
}

async function getCollabsInfo(collabs) {
  if (!collabs) return [];
  const result = [];
  for (let coll of collabs) {
    const socketId = users.get(coll.toString());
    if (socketId) {
      try {
        const data = await getCollaboratorDetails(coll);
        result.push({ socketId, data });
      } catch (error) {
        console.error("Error getting collaborator details:", error);
      }
    }
  }
  return result;
}
