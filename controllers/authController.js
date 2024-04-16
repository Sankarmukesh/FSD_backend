const { authSchema } = require("../helpers/validations");
const passport = require('passport')
const bcrypt = require("bcrypt");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signEmailOTpToken,
  verifyEmailOtpToken,
  verifyAPiAccessToken,
} = require("../helpers/jwt_helpers");
const User = require("../models/UserModel");
const dotenv = require("dotenv");
const Userverify = require("../models/OtpModel");
dotenv.config({ path: "../config.env" });
const twilio = require("twilio");
const send_mail = require("../helpers/EmailSending");
const { notificationImage, authImage } = require("../helpers/imageDeciders");

const GoogleStrategy = require('passport-google-oauth2').Strategy

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
  scope: ["profile", "email"]
},
  function (request, accessToken, refreshToken, profile, done) {
    console.log(profile);
    callbackPromise(null, profile)
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
  }
));

passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})


exports.register = async (req, res, next) => {
  try {
    const { email, userName, role } = req.body;
    // validating email and password
    const validating_email_password = await authSchema.validateAsync(req.body);

    // hashing password
    const salt = await bcrypt.genSalt(10);
    const passwordHashing = await bcrypt.hash(
      validating_email_password.password,
      salt
    );

    // Checking user already exist or not
    const userDoesExist = await User.findOne({ email: email });
    const userNameDoesExist = await User.findOne({ userName: userName });
    const ErrorMessages = [];
    if (userDoesExist) {
      ErrorMessages.push("Email");
      // return res.status(404).json({message: 'Email Already Exist'})
    }
    if (userNameDoesExist) {
      ErrorMessages.push("User Name ");
      // return res.status(404).json({message: 'User Name Already Exist'})
    }

    if (ErrorMessages.length > 0) {
      return res
        .status(404)
        .json({ message: ErrorMessages.join(",") + "Already exists" });
    }
    await User.create({
      email, role,
      password: passwordHashing,
      userName,
      verification: "initial",
    });
    const userDetails = await User.findOne({ email: email });

    const accessToken = await signAccessToken(
      { email: email, user_id: userDetails._id },
      `${userDetails._id}`
    );
    const refreshToken = await signRefreshToken(
      { email: email, user_id: userDetails._id },
      `${userDetails._id}`
    );
    await send_mail(process.env.ADMIN_EMAIL, 'New User joined!', `A new user <b>${userName}</b> is joined into our app. Please assign him a project.`, notificationImage)

    return res.send({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (err) {
    if (err.isJoi == true) err.status = 422;
    next(err);
  }
};

exports.googleSSORegister = async (req, res, next) => {
  try {
    const { email, userName, role } = req.body;

    // Checking user already exist or not
    const userDoesExist = await User.findOne({ email: email });
    if (!userDoesExist) {
      // hashing password
      const salt = await bcrypt.genSalt(10);
      const passwordHashing = await bcrypt.hash(
        `${userName}@TFE1`,
        salt
      );
      const newUser = await User.create({
        email, role,
        password: passwordHashing,
        phone: '',
        userName,
      });
      const accessToken = await signAccessToken(
        { email: email, user_id: newUser._id },
        `${newUser._id}`
      );
      const refreshToken = await signRefreshToken(
        { email: email, user_id: newUser._id },
        `${newUser._id}`
      );
      await send_mail(email, 'Task Forge System generated password for you', `Your temporary password is <b>${userName}@TFE1</b>. If you want to change password please logout and change that in forgot password page`, authImage)
      await send_mail(process.env.ADMIN_EMAIL, 'New User joined!', `A new user <b>${userName}</b> is joined into our app. Please assign him a project.`, notificationImage)

      return res.send({ accessToken: accessToken, refreshToken: refreshToken });
    }
    
    const accessToken = await signAccessToken(
      { email: email, user_id: userDoesExist._id },
      `${userDoesExist._id}`
    );
    const refreshToken = await signRefreshToken(
      { email: email, user_id: userDoesExist._id },
      `${userDoesExist._id}`
    );

    return res.send({ accessToken: accessToken, refreshToken: refreshToken });
   
  } catch (err) {
    if (err.isJoi == true) err.status = 422;
    next(err);
  }
};



exports.login = async (req, res, next) => {
  try {
    const { email } = req.body;
    // validating email and password
    const validating_email_password = await authSchema.validateAsync(req.body);

    // Checking user already exist or not
    const userDoesExist = await User.findOne({ email: email });
    if (!userDoesExist) {
      return res.status(404).json({ message: "User not found" });
    }

    // comparing password
    if (
      !(await bcrypt.compare(
        validating_email_password.password,
        userDoesExist.password
      ))
    ) {
      return res.status(404).json({ message: "Email/password is wrong" });
    } else {
      const accessToken = await signAccessToken(
        {
          email: userDoesExist.email, role: userDoesExist.role,
          user_id: userDoesExist._id,
          userName: userDoesExist.userName,
          image: userDoesExist.image?.url,
        },
        `${userDoesExist._id}`
      );
      const refreshToken = await signRefreshToken(
        { email: userDoesExist.email, role: userDoesExist.role, _id: userDoesExist._id },
        `${userDoesExist._id}`
      );

      return res.send({ accessToken: accessToken, refreshToken: refreshToken });
    }
  } catch (err) {
    if (err.isJoi == true) err.status = 422;
    next(err);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Bad request" });
    }
    const { user_id, email } = await verifyRefreshToken(refreshToken);
    const userDoesExist = await User.findOne({ email: email });
    const accessToken = await signAccessToken(
      {
        email: userDoesExist.email, role: userDoesExist.role,
       
        user_id: userDoesExist._id,
        userName: userDoesExist.userName,
        image: userDoesExist.image?.url
      },
      `${user_id}`
    );
    const refreshtoken = await signRefreshToken(
      { email: email, user_id: user_id },
      `${user_id}`
    );

    return res.send({ accessToken: accessToken, refreshToken: refreshtoken });
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.verifyMainAccessToken = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: "Bad request" });
    }
    const { email } = await verifyAPiAccessToken(accessToken);
    const userDoesExist = await User.findOne({ email: email });
    const currentaccessToken = await signAccessToken(
      {
        email: userDoesExist.email, role: userDoesExist.role,
       
        user_id: userDoesExist._id,
        
        userName: userDoesExist.userName,
        image: userDoesExist.image?.url
      },
      `${userDoesExist._id}`
    );
    const refreshToken = await signRefreshToken(
      { email: userDoesExist.email, role: userDoesExist.role, _id: userDoesExist._id },
      `${userDoesExist._id}`
    );
    return res.send({
      accessToken: currentaccessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    return res.status(400).json(err);
  }
};


exports.forgot_password = async (req, res, next) => {
  try {
    const { email, password, type, phone } = req.body;

    // validating email and password
    // const validating_email_password = await authSchema.validateAsync(req.body);
    const salt = await bcrypt.genSalt(10);
    const passwordHashing = await bcrypt.hash(password, salt);
    if (type == "email") {
      const userDoesExist = await User.findOne({ email: email });
      if (!userDoesExist) {
        return res.status(404).json({ message: "User not found" });
      }
      await User.updateOne(
        { email: email },
        { $set: { password: passwordHashing } }
      );
      // await User.save()
      return res.status(200).json({ message: "Password changed successfully" });
    }
  } catch (err) {
    next(err);
  }
};

exports.send_otp_mail = async (req, res) => {
  try {
    const { to, subject, type } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    await send_mail(to, subject, `Your one-time password for <b>Frontend ${type}</b> is <b>${otp.toString()}</b> valid for the next 2 minutes. For safety reasons, <b>PLEASE DO NOT SHARE YOUR OTP</b> with anyone.`, authImage, {otp: otp});
    return res.status(200).send("Email sent successfully");
  } catch (err) {
    console.log(err);
  }
};

exports.verify_otp = async (req, res) => {
  try {
    const { email } = req.body;
    const EmailToken = await Userverify.findOne({ email: email });
    if (EmailToken) {
      const { otp } = await verifyEmailOtpToken(EmailToken.verifyToken);
      console.log(otp, req.body.otp);
      if (req.body.otp == otp) {
        return res.status(200).json({ message: "OTP is Success" });
      } else {
        return res.status(404).json({ message: "Entered OTP is wrong" });
      }
    } else {
      return res.status(404).json({ message: "Please request a Otp" });
    }
  } catch (err) {
    return res.status(404).json({ message: err });
  }
};
