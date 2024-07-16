const chatNamespace = require("./namespaces/chatNamespace");
const activityLogNamespace = require("./namespaces/activityLogNamespace");
const dirStructureNamespace = require("./namespaces/dirStructureNamespace");
const inviteNamespace = require("./namespaces/inviteNamespace");
const consoleLogNamespace = require("./namespaces/consoleLogNamespace");
const activeCollabNamespace = require("./namespaces/activeCollabNamespace");
const runningStatusNamespace = require("./namespaces/runningStatusNamespace");
const waitingModalNamespace = require("./namespaces/waitingModalNamespace"); 
const executionServerNamespace = require("./namespaces/executionServerNamespace").nameSpace;

const { frontendURL, executionServerURL } = require("./config/config");

module.exports = (server) => {
  const allowedURLs = [frontendURL, executionServerURL]
  const io = require("socket.io")(server, {
    cors: {
      origin: (origin, callback) => {
        if (allowedURLs.includes(origin) || !origin) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  chatNamespace(io);
  activityLogNamespace(io);
  dirStructureNamespace(io);
  inviteNamespace(io);
  consoleLogNamespace(io);
  activeCollabNamespace(io);
  runningStatusNamespace(io);
  waitingModalNamespace(io);
  executionServerNamespace(io);

  return io;
};
