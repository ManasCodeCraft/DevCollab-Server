

module.exports.projectInitialTemplate = function (){
    return `
      const express = require('express');
      const app = express();
      app.get('/', async (req, res)=>{
        res.send('Hello World!');
      });

      app.listen(3000);
      `
}

module.exports.packageJsonTemplate = function (){
  return `
  {
  "name": "project",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.19.2"
  }
}
`
}