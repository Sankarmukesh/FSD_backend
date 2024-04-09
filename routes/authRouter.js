const express = require("express");
const authController = require("../controllers/authController");
const passport = require("passport");
const router = express.Router();

const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });

router.route("/register").post(authController.register);
router.route("/ssoRegister").post(authController.googleSSORegister);
router.route("/login").post(authController.login);
router.route("/refresh-token").post(authController.refreshToken);
router.route("/forgotPassword").post(authController.forgot_password);
router.route("/sendEmailOtp").post(authController.send_otp_mail);
router.route("/verifyOtp").post(authController.verify_otp);
router.route("/verifyApiAccessToken").post(authController.verifyMainAccessToken);


router.get('/login/success', (req, res) => {
    if (req.user) {
        res.status(401).json({ error: false, message: 'Success login', user:req.user })

    } else {
        res.status(401).json({ error: true, message: 'Not Authorized' })
    }
})

router.get('/login/failed', (req, res) => {
    res.status(401).json({error: true, message: 'Login failed'})
})

router.get("/google/callback", passport.authenticate("google", {
    successRedirect: process.env.GOOGLE_CALLBACK_URL,
    failureRedirect: '/login/failed'
}))

router.get("/google", passport.authenticate("google", ['profile', 'email']))

router.get("/logout", (req, res) => {
    req.logout()
    req.redirect(process.env.GOOGLE_CALLBACK_URL)
})





module.exports = router;