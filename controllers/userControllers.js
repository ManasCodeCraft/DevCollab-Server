const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { sendOTP, sendPasswordResetLink } = require("../utils/otpAndEmailUtils");
const { registerUser, verifyOTP, changeUserProfile, getUserDetails, removeUserAccount, resetUserAccountPassword, findUsers, ifUserRegisteredWithGoogle, isUserNameUnique } = require("../services/authServices");
const { maskEmail } = require("../utils/formatUtils");

const { jwtSecret, googleClientId, googleCallbackUrl, googleClientSecret, nodeEnv, frontendURL, authCookie } = require('../config/config')
const jwt_key = jwtSecret;

var cookieOptions = (nodeEnv === 'production') ? {
  httpOnly: true,
  secure: true,
  expires: new Date(Date.now() + 7*24*3600*1000),
  sameSite: 'None',
} : {
  httpOnly: true,
  expires: new Date(Date.now() + 7*24*3600*1000),
  domain: "localhost",
  port: 3000,
}

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        let existingUser = await ifUserRegisteredWithGoogle(profile.id);
        if (existingUser) {
          return cb(null, existingUser);
        } else {
          var uniqueUsername = profile.emails[0].value.split("@")[0];
          let count = 1;
          while (!isUserNameUnique(uniqueUsername)){
            uniqueUsername = `${uniqueUsername}-${count}`;
            count++;
            console.log(count);
          }
          const newUser = {
            UserName: uniqueUsername,
            Email: profile.emails[0].value,
            GoogleId: profile.id,
            ProfilePic: profile.photos[0].value,
          }
          let user = await registerUser(newUser);
          return cb(null, user);
        }
      } catch (err) {
        if (err.name === "ValidationError") {
          if (err.errors["Email"]) {
            err.message = err.errors["Email"].message;
          }
        }
        return cb(err);
      }
    }
  )
);

module.exports.googleSignInCallback = function (req, res, next) {
  passport.authenticate("google", function (err, user, info) {
    if (err) {
      console.log(err);
      return res.redirect(
        `${frontendURL}/?error=` + encodeURIComponent(err.message)
      );
    }
    if (!user) {
      return res.redirect(
        `${frontendURL}/?error=Unexpected%20Error:%20User%20login%20failed`
      );
    }
    const token = jwt.sign({ id: user._id }, jwt_key);
    res.cookie(authCookie, token, cookieOptions); 
    req.userid = user._id;
    res.redirect(frontendURL);
  })(req, res, next);
};

module.exports.googlesignIn = passport.authenticate("google", {
  scope: ["profile", "email"],
});


// SignUp function 
module.exports.postSignUp = async function postSignUp(req, res) {
  try {
    
    const user = await registerUser(req.body);

    sendOTP(user.GeneratedOTP, user.Email, user.UserName);

    // sending the login cookie 
    const token = jwt.sign({ id: user._id }, jwt_key);
    const authCookie = require('../config/config').authCookie;

    res.cookie(authCookie, token, cookieOptions);

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
};

// end point for otp verification in signup process
module.exports.OTP_Verification = async function OTP_Verification(req, res) {
  const OTP = req.body.OTP;
  const id = req.userid;

  try {
    const check = await verifyOTP(id, OTP);
    if (check) {
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// end point for resending otp
module.exports.resendOTP = async function resendOTP(req, res) {
  try {
    let user = req.user;
    sendOTP(user.GeneratedOTP, user.Email, user.UserName);
    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// end point for user login
module.exports.postLogin = async function postLogin(req, res) {
  try {
      const token = jwt.sign({ id: req.userid }, jwt_key);
      const authCookie = require('../config/config').authCookie;
      res.cookie(authCookie, token, cookieOptions);
      res.status(200).json({ message: "User logged in successfully" });
  } catch (er) {
    console.log(er);
    res.status(500).json({ message: "Unexpected error" });
  }
};

// end point for user profile change
module.exports.changeProfile = async function changeProfile(req, res) {
  try {
    const userid = req.userid;
    if(!req.file){
      return res.status(400).send();
    }
    const url = await changeUserProfile(userid, req.file);
    if (url) {
      return res.status(200).json(url);
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// end point for user authenication
module.exports.userAuthenication = async function (req, res) {
  try {
    const userid = req.userid;
    const data = await getUserDetails(userid);
    if (data) {
      res
        .status(200)
        .json({ message: "User logged in successfully", user: data });
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// end point for user logout
module.exports.LogOut = async function LogOut(req, res) {
  try {
      const authCookie = require('../config/config').authCookie;
      res.clearCookie(authCookie, cookieOptions);
      res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Unexpected error" });
  }
};


// end point for deleting user account
module.exports.DeleteAccount = async function DeleteAccount(req, res) {
  try {
      const userid = req.userid;
      const user = await removeUserAccount(userid);

      if (user) {
          const authCookie = require('../config/config').authCookie;
          res.clearCookie(authCookie, cookieOptions);
          res.status(204).send();

        } else {
          res.status(400).json({ message: "User not found" });
        }
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Unexpected error" });
  }
};


module.exports.AccountRecovery = async function AccountRecovery(req, res) {
  try {
    const user = req.user;
    if (user) {
      sendPasswordResetLink(user);
      const maskedEmail = maskEmail(user.Email);

      return res.status(200).json({
          message: `Password Reset Link has been sent to ${maskedEmail}`,
      });
    } else {
      return res.status(400).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unexpected error" });
  }
};


// end point to reset user account password
module.exports.ResetPassword = async function ResetPassword(req, res) {
  try {
      const userid = req.userid;
      const password = req.password;
      const user = await resetUserAccountPassword(userid, password);
      if(user){
         return res.status(200).json({ message: "Password changed successfully" });
      }
      else{
        return res.status(400).json({ message: "User not found" });
      }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports.searchUserName = async function searchUserName(req, res) {
  const { username } = req.body;
  const currentUserId = req.userid; 

  try {
    if (!username || username.length === 0) {
      return res.status(400).json({ message: "Please provide a username" });
    }

    const results = await findUsers(username, currentUserId, 5);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};


