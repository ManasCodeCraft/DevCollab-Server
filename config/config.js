require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const process = require('process');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

var baseURL = 'https://devcollab-server.onrender.com'
var frontendURL = 'https://devcollab-t811.onrender.com'
var executionServerURL = 'https://devcollab-execution-server.onrender.com'

if(process.env.NODE_ENV !== 'production'){
   baseURL = `http://localhost:${process.env.PORT}`
   frontendURL = `http://localhost:3000`
   executionServerURL = `http://localhost:7500`
}

module.exports = { 

    // Database 
    dbURL: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_NAME}/${process.env.DB_NAME}?retryWrites=true&w=majority`,

    // Server
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    baseURL: baseURL,
    frontendURL: frontendURL,
    executionServerURL:executionServerURL,

    maxAllowedProjects: 20,

    // auth and keys
    jwtSecret: process.env.JWT_SECRET_KEY,
    authCookie: 'Dev_Cl',
    devcollabKey: process.env.DEVCOLLAB_SECRET_KEY,
    devcollabInterServerRequestKey: process.env.DEVCOLLAB_INTER_SERVER_REQUEST_KEY,
    devcollabConfigKey: process.env.DEVCOLLAB_CONFIG_KEY,

    // nodemailer email
    mailId: process.env.MAIL_ID,
    mailPassword:  process.env.MAIL_APP_PASSWORD,
    mailHost: process.env.MAIL_HOST,
    mailPort: process.env.MAIL_PORT,

    // cloudinary 
    cloudinary: cloudinary,
    cloudinaryConfig: {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    },

    // google api
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleCallbackUrl: `${baseURL}/auth/google/callback`

}

