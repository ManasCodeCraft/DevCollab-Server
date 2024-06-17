const express = require('express');
const app = express();
app.get('/', (req, res) => {
    console.log('Hello world this app is working.');
    return res.status(200).send('Hello world i am here');
});
module.exports = app;