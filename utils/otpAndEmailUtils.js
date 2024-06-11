const nodemailer = require("nodemailer");
const { PasswordResetLink } = require("./formatUtils");

const {
  mailHost,
  mailId,
  mailPassword,
  mailPort,
} = require("../config/config");

// function to generate 6 digit random OTP
module.exports.generateOTP = function (){
  const otpArray = [];
  for (let i = 0; i < 6; i++) {
    const digit = Math.floor(Math.random() * 10);
    otpArray.push(digit);
  }
  return otpArray;
};


// function to send OTP to the user's email
module.exports.sendOTP = async function sendOTP(otp, email, username) {
  try{
  const mailOptions = {
    to: email,
    subject: "One Time Password",
    text: `
            Hi ${username}, 
            Your One Time Password is ${otp.join("")} 
            Please do not share this OTP with anyone else. 
            If you have any questions, please contact us at ${mailId} 
            Thank you.
          `,
  };
   
  await sendMail(mailOptions);

}
catch(error){
  console.error('An error occurred in sending otp')
  console.error(error);
}

};


// function to send password reset link to the user's email
module.exports.sendPasswordResetLink = async function sendPasswordResetLink(user){
  try{
  const email = user.Email;
  const resetlink = PasswordResetLink(user._id ,user.PasswordResetToken);

  const mailOptions = {
    to: email,
    subject: "Password Reset Link",
    html: `
            <h1>Your Password Reset Link</h1>
            <a href="${resetlink}">Click here to reset your password</a>
          `,
   };

   await sendMail(mailOptions)
  }
  catch(error){
    console.error('An error occurred in sending password reset link')
    console.error(error);
  }
};


// function to send mail via nodemailer
async function sendMail(mailOptions) {
  try {

    // creating transport object 
    const transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: true,
      auth: {
        user: mailId,
        pass: mailPassword,
      },
    });
    
    // checking if mail options already contain the from property or not
    if(!mailOptions.hasOwnProperty('from') || !mailOptions.from){
       mailOptions.from = mailId;
    }

    // sending mail
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
      } else {
        console.log("Email sent:" + info.response);
      }
    });

  } catch (error) {
    console.error("An error occurred in sending mail");
    console.error(error);
  }
}
