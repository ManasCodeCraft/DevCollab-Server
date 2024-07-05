const { baseURL, executionServerURL, devcollabKey } = require("../config/config");

// formatting Mongodb Error Object
module.exports.formatValidationError = function formatValidationError(error) {
  const errors = {};
  for (const field in error.errors) {
    errors[field] = error.errors[field].message;
  }
  return errors;
};

module.exports.getPublicIdFromUrl = function getPublicIdFromUrl(url) {
  // Regular expression to extract the public ID from the URL
  const regex = /\/upload\/(?:v[0-9]+\/)?([^/]+)(?:\.\w+)?$/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// masking email
module.exports.maskEmail = function (email) {
  const [localPart, domain] = email.split("@");
  const obfuscatedLocalPart = `${localPart.slice(0, 3)}......${localPart.slice(
    -2
  )}`;
  const obfuscatedEmail = `${obfuscatedLocalPart}@${domain}`;
  return obfuscatedEmail;
};

module.exports.PasswordResetLink = function (userid, token) {
  const baseURL = require("../config/config").baseURL;
  const passwordResetLink = `${baseURL}/auth/reset-password/?id=${userid}&reset_password_token=${token}`;
  return passwordResetLink;
};

module.exports.formatFile = function (file) {
  const formatted_file = {
    fileId: file._id,
    fileName: file.name,
    fileType: file.contentType,
    fileContent: file.content,
    fileUrl: file.url,
  };
  return formatted_file;
};

module.exports.formatDir = function (dir) {
  const formatted_dir = {
    dirId: dir._id,
    dirName: dir.name,
  };
  return formatted_dir;
};

module.exports.formatCollaborator = function (user) {
  const formatted_coll = {
    id: user._id,
    name: user.UserName,
    profile: user.ProfilePic,
  };
  return formatted_coll;
};

module.exports.formatProject = function (project, id, data) {

  let isOwner = (project.owner == id)? true : false;

  var description = "";
  if (isOwner) {
    description = "You have created this project";
  } else {
    description = "You have joined this project";
  }

  var project_details = {
    projectId: project._id,
    projectName: project.name,
    description: description,
    owner: isOwner,
    rootDirectory: project.rootDirectory,
    collaborators: data.collaborators,
    activityLogs: [],
    runningStatus: project.runningStatus,
    url: `${executionServerURL}/client-project/${project._id}`,
    activeCollaborators: [],
    consoleLogs: data.consoleLogs,
  };

  return project_details;
};

module.exports.formatDirectoryContent = async function (directory, data) {
  const formatted_directory = {
    projectId: directory.project,
    id: directory._id,
    name: directory.name,
    directories: data.directories,
    files: data.files,
  };

  return formatted_directory;
};

module.exports.formatTimeStamp = function (timestamp){
    const date = new Date(timestamp);
    
    // Options for formatting the date
    const options = {
        weekday: 'long', // Full name of the day (e.g., Monday)
        year: 'numeric', // Full year (e.g., 2024)
        month: 'long', // Full name of the month (e.g., June)
        day: 'numeric', // Day of the month (e.g., 7)
        hour: '2-digit', // Hour in 2 digits (e.g., 08 or 20)
        minute: '2-digit', // Minute in 2 digits (e.g., 05 or 45)
        second: '2-digit', // Second in 2 digits (e.g., 09 or 59)
        hour12: false // Use 24-hour format
    };
    
    return date.toLocaleDateString('en-US', options);
}

module.exports.formatProjectLogs = function (logs) {
  const sortedLogs = logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  const formattedlogs = sortedLogs.map((log)=> module.exports.formatProjectLog(log))
  return formattedlogs;
};

module.exports.formatProjectLog = function(log){
    return {
        value: log.details,
        type: log.type,
        id: log._id,
        time: module.exports.formatTimeStamp(log.date)
    }
}
