const axios = require('axios');
const config = require('../config/config');

const axiosRequest = async function (url, options){
    url = config.executionServerURL + url;
    options.interServerRequestKey = config.devcollabInterServerRequestKey;
    return await axios.post(url, options);
}

module.exports.onExecutionServer = async function (id, isFile, task, nameOrContent){
    let options = {
        id,
        isFile,
        task,
        nameOrContent
    };
    return await axiosRequest('/on-local/crud', options);
}

module.exports.runProject = async function (projectId, userId){
    let options = {
        projectId,
        userId
    };
    return await axiosRequest('/run-nodejs/init', options);
}

module.exports.createEmptyOnExec = async function(projectId){
    let options = {
        projectId
    };
    return await axiosRequest('/on-local/create-empty', options);
}

module.exports.deleteProjectOnExecutionServer = async function (projectId){
    let options = {
        projectId
    };
    return await axiosRequest('/on-local/delete', options);
}

module.exports.runExec = async function (projectId){
    let options = {
        projectId
    };
    return await axiosRequest('/run-nodejs/start', options);
}

module.exports.stopExec = async function (projectId){
    let options = {
        projectId
    };
    return await axiosRequest('/run-nodejs/stop', options);
}