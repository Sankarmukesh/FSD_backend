const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { signEmailOTpToken } = require("./jwt_helpers");
const Userverify = require("../models/OtpModel");
dotenv.config({ path: "../config.env" });
const send_mail = async (to, subject, body, mailImage, ...args) => {
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
       <body
        style="font-family: sans-serif; margin: 0; padding: 0; background-color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
        <div style="width: 100vw;">
            <div style="background-color: #F6F7F8;text-align:center;">
                <div><img src=${process.env.MAIL_LOGO} alt="Company Logo" style="width: 200px; height: 60px; object-fit: cover "></div>
                <div><img src=${mailImage} alt="Company Logo" style="width: auto; height: 300px; object-fit: cover"></div>
            </div>
            <div style="padding: 10px; background-color: #F6F7F8; text-align: center;">
                <p
                    style="margin-bottom: 10px; font-size: 24px; line-height: 1.6;text-align: center;font-weight: 600;color: #099F4E;">
                    Hello, ${to.split('@')[0]}</p>
                <p style="font-size: 14px; line-height: 1.5;">${body}</p>
            </div>
            <footer style="text-align: center; padding: 10px; background-color: #E6F7E9; color: #333;">
                <p
                    style="margin-bottom: 5px; font-size: 18px; line-height: 1.6;text-align: center;font-weight: 600;color: #099F4E;">
                    Happy Task Managing !</p>
                <p style="margin: 20px 0 5px 0;font-size: 14px;">Lots of Love from</p>
                <div><img src=${process.env.MAIL_LOGO}  alt="Company Logo"
                        style="width: 200px; height: 60px; object-fit: cover "></div>
                <p style="font-size: 14px;">You are receiving this mail since you have become a part <br /> of our Task
                    Forge Family.</p>
            </footer>
        </div>
        </body>
          
       `,
    };

    // Send email
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.log(error, "Internal Server Error");
      } else {
        if (args.length > 0 && args[0]['otp'] !== undefined) {
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
