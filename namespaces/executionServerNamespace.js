const {
    mongodbModelsOperation,
    emitConsoleLog,
    updateRunningStatus,
    updatePackageJson,
    getFileOrFolderPath,
  } = require("../services/executionServerRequest");
  
  const config = require("../config/config");
  const secretKey = config.devcollabInterServerRequestKey;
  const axios = require("axios");
const { waitInMs } = require("../utils/wait");
  
  let serverSocket = null;
  let sendingReconnectionRequest = false;
  
  module.exports.sendOnExecutionServer = async function (eventName, data) {
    if (serverSocket) {
      if (typeof data !== "object") {
        console.error("Incorrect data format on sending request to execution server");
        return null;
      }
      data.key = secretKey;
      return new Promise((resolve, reject) => {
        serverSocket.emit(eventName, data);
        serverSocket.once(`${eventName}-response`, (response) => {
          resolve(response);
        });
      });
    } else {
      console.error("Execution Server is not connected");
  
      if (!sendingReconnectionRequest) {
        await sendReconnectionRequest();
      }
  
      if (serverSocket) {
        return module.exports.sendOnExecutionServer(eventName, data);
      } else {
        return null;
      }
    }
  };
  
  module.exports.nameSpace = (io) => {
    const executionServerNamespace = io.of("/execution-server-socket");
  
    executionServerNamespace.on("connection", (socket) => {
      console.log("Execution Server connected with socket ID:", socket.id);
      serverSocket = socket;
  
      const setupListeners = () => {
        socket.on("mongodb-models", async ({ key, executionString }) => {
          if (key === secretKey) {
            const data = await mongodbModelsOperation(executionString);
            socket.emit("mongodb-models-response", { key, data });
          }
        });
  
        socket.on("console-log", async ({ key, log }) => {
          if (key === secretKey) {
            const result = await emitConsoleLog(log);
            socket.emit("console-log-response", { key, data: result });
          }
        });
  
        socket.on("update-status", async ({ key, projectId, status }) => {
          if (key === secretKey) {
            const result = await updateRunningStatus(projectId, status);
            socket.emit("update-status-response", { key, data: result });
          }
        });
  
        socket.on("update-package-json", async ({ key, projectId, content }) => {
          if (key === secretKey) {
            const result = await updatePackageJson(projectId, content);
            socket.emit("update-package-json-response", { key, data: result });
          }
        });
  
        socket.on("get-server-config", async ({ key }) => {
          if (key === secretKey) {
            const result = { ...config };
            result.cloudinary = null;
            socket.emit("get-server-config-response", { key, data: result });
          }
        });
  
        socket.on("get-file-folder-path", async ({ key, id, isFile }) => {
          if (key === secretKey) {
            const result = await getFileOrFolderPath(id, isFile);
            socket.emit("get-file-folder-path-response", { key, data: result });
          }
        });
  
        socket.on("disconnect", () => {
          console.log("Execution Server disconnected with socket ID:", socket.id);
          serverSocket = null;
  
          if (!sendingReconnectionRequest) {
             sendReconnectionRequest();
          }
        });
      };
  
      setupListeners();
    });
  };
  

  var reconnectTry = 0;
  async function sendReconnectionRequest() {
    try {
      if(reconnectTry > 10){
         reconnectTry = 0;
         await waitInMs(1000*60*10);
      }
      reconnectTry++;
      console.log("Attempting to reconnect with execution server, reconnect try - ", reconnectTry)
      sendingReconnectionRequest = true;
      const response = await axios.get(`${config.executionServerURL}/from-main-server/reconnect`, {
        headers: {
          "secret-token": config.devcollabInterServerRequestKey,
        },
      });
      sendingReconnectionRequest = false;
  
      console.log("Reconnection request succeeded");
    } catch (err) {
      console.error("Reconnection request error:", err);
      await waitInMs(1000*5);
      await sendReconnectionRequest();
    }
  }
  