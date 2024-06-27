const chatNamespace = require('./namespaces/chatNamespace');
const activityLogNamespace = require('./namespaces/activityLogNamespace');
const dirStructureNamespace = require('./namespaces/dirStructureNamespace');
const codeEditorNamespace = require('./namespaces/codeEditorNamespace');
const { frontendURL } = require('./config/config')

module.exports = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            origin: frontendURL,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    chatNamespace(io);
    activityLogNamespace(io);
    dirStructureNamespace(io);
    codeEditorNamespace(io);

    return io;
};
