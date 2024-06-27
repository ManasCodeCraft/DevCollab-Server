const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ActivityLog = require("../models/ActivityLog");
app.use(express.json());

ActivityLog.createIndexes();

mongoose.set('strictQuery', true)

var connection_string = require('../config/config').dbURL;
mongoose.connect(connection_string, {
    dbName: 'DevCollabDB'
});

var db = mongoose.connection;   
db.on('error', console.error.bind(console, "connection error: "));
db.once('open', function () {
    console.log("mongoose has been connected to mongodb");
})

mongoose.connect = mongoose.createConnection;
module.exports = mongoose
