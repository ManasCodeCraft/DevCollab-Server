const express = require('express');
const multer = require('multer')
const { postSignUp, OTP_Verification, resendOTP, postLogin, LogOut, DeleteAccount, changeProfile, AccountRecovery, userAuthenication, searchUserName, googlesignIn, googleSignInCallback, ResetPassword } = require('../controllers/userControllers');
const { signUpMiddleWare, otpVerifySignUpMiddleWare, resendOtpProtect, loginMiddleWare, profileUploadMiddleware, accountRecoveryMiddleware, resetPasswordMiddleware, ProtectRoute } = require('../middlewares/authMiddlewares');

const authRouter = express.Router()

authRouter.route('/google').get(googlesignIn);
authRouter.route('/google/callback').get(googleSignInCallback); 
authRouter.route('/create-account').post(signUpMiddleWare ,postSignUp)
authRouter.route('/verify-otp').post(otpVerifySignUpMiddleWare, OTP_Verification)
authRouter.route('/resend-otp').post(otpVerifySignUpMiddleWare, resendOtpProtect ,resendOTP) 
authRouter.route('/user-login').post(loginMiddleWare ,postLogin)
authRouter.route('/user-logout').post(LogOut)
authRouter.route('/user-deleteAccount').post(ProtectRoute ,DeleteAccount)
authRouter.route('/change-profile-pic').post(ProtectRoute, multer().single('profile'), changeProfile)
authRouter.route('/account-recovery').post(accountRecoveryMiddleware ,AccountRecovery)
authRouter.route('/reset-password').post(resetPasswordMiddleware ,ResetPassword)
authRouter.route('/user-authenication').post(ProtectRoute ,userAuthenication)
authRouter.route('/search-username').post(ProtectRoute ,searchUserName)


module.exports = authRouter;