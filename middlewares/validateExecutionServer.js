const config = require('../config/config');

module.exports.validateExecutionServerRequest = async function (req, res, next) {
    const interServerRequestKey = req.body.interServerRequestKey;
    if(config.devcollabInterServerRequestKey === interServerRequestKey) {
        return next();
    }
    return res.status(403).send();
}