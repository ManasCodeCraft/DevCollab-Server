const mongoose = require("../config/database");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  GoogleId: {
    type: String,
    validate: {
      validator: function () {
        return !(this.Password === undefined && this.GoogleId === undefined);
      },
      message: "Invalid login attempt",
    },
  },
  UserName: {
    type: String,
    required: [true, "Name is required"],
    unique: [true, "Username already in use"],
    min: [1, "Invalid Username"],
    max: [30, "Username is too long"],
    validate: [
      {
        validator: function () {
          return /^[a-zA-Z0-9_\-]+$/.test(this.UserName);
        },
        message:
          "Username can only contain alphanumeric characters, hyphens, or underscores.",
      },
    ],
  },
  ProfilePic: {
    type: String,
    default:
      "https://res.cloudinary.com/dgidrmdqz/image/upload/v1713376923/defaultprofile_kwree3.jpg",
  },
  Email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Email already exist"],
    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      "Please enter a valid email address",
    ],
  },
  Password: {
    type: String,
    validate: {
      validator: function () {
        if (this.GoogleId) {
          return true;
        }
        if (this.Password) {
          return true;
        }
        return false;
      },
      message: "Password is required",
    },
    minlength: [8, "Password must be at least 8 characters"],
  },
  ConfirmPassword: {
    type: String,
    validate: {
      validator: function () {
        if (this.Password != undefined && this.ConfirmPassword === undefined) {
          return false;
        }
        return true;
      },
      message: "Confirm Password is required",
    },
  },
  GeneratedOTP: {
    type: [String],
  },
  OTP_Timestamp: {
    type: Date,
    default: Date.now,
  },
  OTP_Verified:{
     type: Boolean,
     default: false,
  },
  PasswordResetToken: {
    type: String,
  },
  PasswordResetExpire: {
    type: Date,
    default: () => new Date(Date.now() + 3600000),
  },
});

userSchema.pre("save", async function (next) {
  try {
    if(this.isModified("GeneratedOTP") && this.GeneratedOTP){
       this.OTP_Timestamp = Date.now();
    }
    if (this.isModified("Password")) {
      if (this.Password !== this.ConfirmPassword) {
        throw new Error("Passwords do not match");
      }
      this.ConfirmPassword = undefined;
      const salt = await bcrypt.genSalt(10);
      this.Password = await bcrypt.hash(this.Password, salt);
    }
    if (this.GoogleId) {
      this.OTP_Verified = true;
    }
    next();
  } catch (error) {
    console.log(error);
    throw new Error("Internal Server Error in hashing password");
  }
});

userSchema.methods.verifyPassword = async function (Password) {
  try {
    return await bcrypt.compare(Password, this.Password);
  } catch (error) {
    console.log(error);
    return false;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
