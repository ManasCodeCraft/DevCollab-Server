const mongoose = require('mongoose');

module.exports.isMongooseObjectId= function isMongooseObjectId(id){
    return mongoose.Types.ObjectId.isValid(id);
}

module.exports.isMongooseDocument = function isMongooseDocument(arg){
    return (arg instanceof mongoose.Model || (arg.constructor && arg.constructor.base && arg.constructor.base.Model && arg instanceof arg.constructor.base.Model))
}