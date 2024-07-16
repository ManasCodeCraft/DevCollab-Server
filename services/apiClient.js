const { sendOnExecutionServer} = require('../namespaces/executionServerNamespace');

module.exports.onExecutionServer = async function (id, isFile, task, nameOrContent){
    let options = {
        id,
        isFile,
        task,
        nameOrContent
    };
    return await sendOnExecutionServer('on-local-crud', options);
}

module.exports.runProject = async function (projectId, userId){
    let options = {
        projectId,
        userId
    };
    return await sendOnExecutionServer('run-nodejs-init', options);
}

module.exports.createEmptyOnExec = async function(projectId){
    let options = {
        projectId
    };
    return await sendOnExecutionServer('on-local-create-empty', options);
}

module.exports.deleteProjectOnExecutionServer = async function (projectId){
    let options = {
        projectId
    };
    return await sendOnExecutionServer('on-local-delete', options);
}

module.exports.runExec = async function (projectId){
    let options = {
        projectId
    };
    return await sendOnExecutionServer('run-nodejs-start', options);
}

module.exports.stopExec = async function (projectId){
    let options = {
        projectId
    };
    return await sendOnExecutionServer('run-nodejs-stop', options);
}