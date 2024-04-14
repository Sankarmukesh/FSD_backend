const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { signEmailOTpToken } = require("./jwt_helpers");
const Userverify = require("../models/OtpModel");
dotenv.config({ path: "../config.env" });
const send_mail = async (to, subject, body, ...args) => {
  // console.log(args);
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL, // Replace with your Gmail email address
        pass: process.env.EMAIL_PASSWORD, // Replace with your Gmail password (or use an app password)
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL, // Replace with your Gmail email address
      to: to,
      subject: subject,
      html: `
            <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1); border: 8px solid rgba(4, 170, 109, 0.25);">
            <img src=${process.env.MAIL_LOGO} alt="Email Banner" style="display: block; width: 300px; height: 70px; object-fit: cover;">
            <p>Hi <b>${to.split('@')[0]}</b></p>
            <p>${body}</p>
              <a href = ${process.env.FRONTEND_SITE} style="display: inline-block; padding: 10px 20px; background-color: #04aa6d; color: #fff; text-decoration: none; border-radius: 5px;">Go to Task Forge</a>       
              <p style="margin-top: 20px;">Best Regards,<br><b>Task Forge By Sankar</b></p>
              <div style="margin-top: 20px; background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center;">
                  <p style="margin: 0;">&copy; Copyright Task Forge By Sankar</p>
                </div>
            </div>
              </div>
       `,
    };

    // Send email
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.log(error, "Internal Server Error");
      } else {
        if (args.length>0 && args[0]['otp']!==undefined) {
          const userFind = await Userverify.findOne({ email: to });
          const otpToken = await signEmailOTpToken({ otp: args[0]['otp']?.toString() });
          if (userFind) {
            await Userverify.updateOne(
              { email: to },
              { $set: { verifyToken: otpToken } }
            );
          } else {
            await Userverify.create({ email: to, verifyToken: otpToken });
          }
        }
       
        console.log("Email sent successfully");
      }
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = send_mail;
