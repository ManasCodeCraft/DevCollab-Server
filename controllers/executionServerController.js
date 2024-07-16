const config = require("../config/config")

module.exports.getServerConfig = async function (req, res){
    const serverConfig = { ...config };
    serverConfig.cloudinary = null;
    res.status(200).json(serverConfig);
}
