require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const process = require('process');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = { 

    // Database 
    dbURL: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_NAME}/${process.env.DB_NAME}?retryWrites=true&w=majority`,

    // Server
    port: process.env.PORT,
    baseURL: `http://localhost:${process.env.PORT}`,
    frontendURL: 'http://localhost:3000',
    devcollabKey: process.env.DEVCOLLAB_SECRET_KEY,

    maxAllowedProjects: 20,

    // auth
    jwtSecret: process.env.JWT_SECRET_KEY,
    authCookie: 'Dev_Cl',

    // nodemailer email
    mailId: process.env.MAIL_ID,
    mailPassword:  process.env.MAIL_APP_PASSWORD,
    mailHost: process.env.MAIL_HOST,
    mailPort: process.env.MAIL_PORT,

    // cloudinary 
    cloudinary: cloudinary,

    // google api
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK

}

