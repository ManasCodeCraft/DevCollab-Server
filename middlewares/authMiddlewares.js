const jwt = require('jsonwebtoken');
const { usernameExist, emailExist, userOTPVerified, otpResendValid, userOTPResendValidate, ifUserExist, setPasswordResetToken, validateResetPassword } = require("../services/authServices");
const { generateOTP } = require("../utils/otpAndEmailUtils");

const jwt_key = require('../config/config').jwtSecret;

// checking if username or email already exist
module.exports.signUpMiddleWare = async function signUpMiddleWare(req, res, next){
   try{
    let username = req.body.UserName;
    let email = req.body.Email;
    if(await usernameExist(username)){
        return res.status(400).json({message: 'Username already exists'})
    }

    if(await emailExist(email)){
        return res.status(400).json({message: 'Email already exists'})
    }

    req.body.GeneratedOTP = generateOTP();

    next();
   }
   catch(error){
    console.error('An Error occurred in signup middleware')
    console.error(error);
    res.status(500).json({message: 'Internal Server Error'});
   }
}

// to validate if user has performed necessary signup operations before otp verification
module.exports.otpVerifySignUpMiddleWare = async function (req, res, next){
     try{
        // validating auth Cookie
        const authCookie = require('../config/config').authCookie;
        const logincookie = req.cookies[authCookie];

        jwt.verify(logincookie, jwt_key, async (err, decoded) => {
          if (err) {
            return res.status(401).json({ message: "Invalid token" });
          } else {
            const id = decoded.id;
            const check = await userOTPVerified(id);

            // if user's otp is already verified no need to do it again
            if (!check) {
                req.userid = id;
                return next();
            } 
            else{
              return res.status(400).json({message: "OTP is already verified."})
            }
          }
        });
     }
     catch(error){
        console.error(error);
     }
}


module.exports.resendOtpProtect = async function (req, res, next){
    try{
        let id = req.userid;
        const otp = generateOTP();
        let user = await userOTPResendValidate(id, otp);
        if(user){
            req.user = user;
            return next();
        }
        else{
            return res.status(400).json({message: 'OTP resend request is invalid'})
        }
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

module.exports.loginMiddleWare = async function (req, res, next){
    try{
        const userName_or_email = req.body.Identity;
        const password = req.body.Password;

        const user = await ifUserExist(userName_or_email);
        var errors = {};
        if(!user){
            errors.Identity = 'User not found';
            return res.status(400).json({errors: errors})
        }
        
        else{
            const check = await user.verifyPassword(password);
            if(!check){
                errors.Password = 'Invalid  Password';
                return res.status(400).json({errors: errors})
            }
            req.userid = user._id;
            return next();
        }
    }
    catch(error){
        console.error(error);
    }
}

// check if user logged in and otp verified
module.exports.ProtectRoute = async function ProtectRoute(req, res, next) {
    try {
      const authCookie = require('../config/config').authCookie;
      const logincookie = req.cookies[authCookie];
      jwt.verify(logincookie, jwt_key, async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token" });
        } else {
          const id = decoded.id;
          const user = await userOTPVerified(id)
          if (user) {
              req.userid = id;
              return next();
          } else {
            return res.status(401).json({ message: "user not logged in" });
          }
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };


// account recovery middleware
module.exports.accountRecoveryMiddleware = async function (req, res, next){
    try{
        const identity = req.body.identity || req.body.Identity;
        if(identity){
            const user = await ifUserExist(identity);
            if(user){
                if(user.GoogleId){
                    return res.status(400).json({message: "Don't need to reset password, sign in using google account"})
                }
                const user_ = await setPasswordResetToken(user._id)
                req.user = user_;
                return next();
            }
            else{
                return res.status(400).json({message: 'User not found'})
            }
        }
        else{
            return res.status(400).json({message: 'Identity is required'})
        }
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
}


// reset password middleware
module.exports.resetPasswordMiddleware = async function (req, res, next){
    try{
        const user_id = req.body.id;
        const resetToken = req.body.resetToken;
    
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
    
        if (password != confirmPassword) {
          return res.status(400).json({ message: "Passwords do not match" });
        }

        const check = await validateResetPassword(user_id, resetToken);
        if(!check){
            return res.status(400).json({message: 'Token is invalid'})
        }

        req.userid = user_id;
        req.password = password;
        next();
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message: 'Internal Server Error'})
    }
}