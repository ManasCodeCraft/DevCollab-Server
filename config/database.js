const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());

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

module.exports = mongoose
