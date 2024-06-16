const User = require('../models/User');
const Project = require('../models/Project')
const { uploadImageCloudinary, DeleteOldImageFromCloudinary } = require('./cloudinaryServices');
const { formatValidationError, formatCollaborator } = require('../utils/formatUtils');

// function to check if username already exist in user model
module.exports.usernameExist = async function usernameExist(username){
   try{
       const user = await User.findOne({UserName: username})
       if(user){
         return true;
       }
       else{
         return false;
       }
   }
   catch(error){
    console.error(error)
   }
}

// function to check if email already exist in user model
 module.exports.emailExist = async function emailExist(email){
   try{
       const user = await User.findOne({Email: email})
       if(user){
         return true;
       }
       else{
         return false;
       }
   }
   catch(error){
    console.error(error)
   }
}

// function to register user in user model
module.exports.registerUser = async function registerUser(user){
    try{
        const new_user =  await User(user);
        return new_user.save();
    }
    catch(error){

        // if error thrown by mongoose in validation process, throw error with formatted errors to catch in parent function
        if(error.name === 'ValidationError'){
            var errors = formatValidationError(error);
            throw {
                name: 'ValidationError',
                errors: errors,
                error: new Error('Mongoose validation failed')
            }
        }

        else{
        console.error('An error occurred in creating otp for user')
        console.error(error);
        }
    }
}


// function to check if user is otp verified
module.exports.userOTPVerified = async function (userid){
     try{
        const user = await User.findById(userid);
        if(!user){
            return null;
        }
        if(user.OTP_Verified){
            return true;
        }
        else{
            return false;
        }
     }
     catch(error){
        console.error(error);
        return null;
     }
}

// function to verify otp 
module.exports.verifyOTP = async function verifyOTP(userid, otp){
   try{
      const user = await User.findById(userid);
      if(JSON.stringify(user.GeneratedOTP) == JSON.stringify(otp)){
        user.OTP_Verified = true;
        await user.save();
        return true;
      }
      return false;
   }
   catch(error){
    console.error(error);
   }
}

// function to check if otp sending frequence is too fast
module.exports.userOTPResendValidate = async function (id, otp){
    try{
        const user = await User.findById(id);
        if(Date.now() - user.OTP_Timestamp > 30*1000){
            user.GeneratedOTP = otp;
            return await user.save();
        }
        return null;
    }
    catch(error){
        console.error(error);
        return null;
    }
}

// function to check if user already exist
module.exports.ifUserExist = async function (userName_or_email){
    try{
        const user = await User.findOne({$or: [{UserName: userName_or_email}, {Email: userName_or_email}]});
        if(user){
            return user;
        }
        else{
            return null;
        }
    }
    catch(error){
        console.error(error);
        return null;
    }
}

// function to change user profile
module.exports.changeUserProfile = async function (userid, file){
    try{
       const user = await User.findById(userid);
       if(user){
          const url = await uploadImageCloudinary(file.buffer);
          const oldURL = user.ProfilePic;
          user.ProfilePic = url;
          DeleteOldImageFromCloudinary(oldURL);
          await user.save();
          return url;
       }
       else{
           return null;
       }
    }
    catch(error){
        console.error(error);
        return null;
    }
}


// function to get user account details by id
module.exports.getUserDetails = async function(id){
    try{
        const user = await User.findById(id);
        if(user){
            const data = {
                id: user._id,
                UserName: user.UserName,
                Email: user.Email,
                ProfilePic: user.ProfilePic,
            };
            return data;
        }
        else{
            return null;
        }
    }
    catch(error){
        console.error(error);
    }
}


// function to remove user account
module.exports.removeUserAccount = async function (userid){
    try{
        const user = await User.findById(userid);
        if(user){
            await User.findByIdAndDelete(userid);
            module.exports.cleanUpUserAccount(user);
            return user;
        }
        else{
            return null;
        }
    }
    catch(error){
        console.error(error);
        return null;
    }
}

// function to perform clean up operation for user account removal
 module.exports.cleanUpUserAccount = async function (user){
    try{
        const { projectCleanUp } = require('./projectServices');
        var projects = user.Projects;
        for(let project of projects){
             const project_document = await Project.findById(project)
             await Project.findByIdAndDelete(project);
             await projectCleanUp(project_document);
        }
    }
    catch(error){
        console.error(error);
    }
}

module.exports.setPasswordResetToken = async function(userid){
    try{
        const user = await User.findById(userid);
        const randomHexToken = crypto.randomBytes(32).toString("hex");
        user.PasswordResetToken = randomHexToken;
        return await user.save();
    }
    catch(error){
        console.error(error);
    }
}

module.exports.validateResetPassword = async function (userid, resetToken){
    try{
        const user = await User.findById(userid);
        if(!user || !user.PasswordResetToken || !user.PasswordResetExpire){
            return false;
        }
        if(Date.now() > user.PasswordResetExpire){
            return false;
        }
        if(user.PasswordResetToken === resetToken){
            return true;
        }
    }
    catch(error){
        console.error(error);
        return false;
    }
}

module.exports.resetUserAccountPassword = async function(userid, password){
    try{
        const user = await User.findById(userid);
        user.PasswordResetExpire = undefined;
        user.PasswordResetToken = undefined;
        user.Password = password;
        return await user.save();
    }
    catch(error){
        console.error(error);
        return null;
    }
}

module.exports.findUsers = async function(username, currentUserId ,limit){
    try{
    // Perform case-insensitive search for usernames starting with the provided string
    // and ensure the found user's ID is not the same as the current user
        const regex = new RegExp(`^${username}`, "i");
        const results = await User.find({
          UserName: { $regex: regex },
          _id: { $ne: currentUserId }, 
        }).limit(limit);

        return results;
    }
    catch(error){
        console.error(error);
        return null;
    }
}

module.exports.ifUserRegisteredWithGoogle = async function (userid, googleId = null){
    try{
        const user = await User.findById(userid);
        if(user){
            if(user.GoogleId){
                if(googleId){
                    if(user.GoogleId === googleId){
                        return true;
                    }
                    else{
                        // This will happen on change in google client id and secret
                        user.GoogleId = googleId;
                        await user.save();
                        return true;
                    }
                }
                return true;
            }
            else{
                return false;
            }
        }
        else{
            return false;
        }
    }
    catch(error){
        console.error(error);
        return false;
    }
}

module.exports.isUserNameUnique = async function (username){
    try{
        const user = await User.findOne({username: username})
        if(user){
            return false;
        }
        return true;
    }
    catch(error){
        console.error(error);
        return false;
    }
}


module.exports.getCollaboratorsDetails = async function getCollaboratorsDetails(collaborators) {
    var members = [];
    for (let user of collaborators) {
        let user_ = await User.findById(user);
        members.push(formatCollaborator(user_));
    }
    return members;
}
