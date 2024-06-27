const { nodeEnv } = require('../config/config');

module.exports.devLog = (...args) => {
    if (nodeEnv === 'development') {
        console.log(...args);
    }
}