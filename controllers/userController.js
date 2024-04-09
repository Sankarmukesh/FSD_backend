const { authSchema } = require("../helpers/validations");
const bcrypt = require("bcrypt");
const {
  signAccessToken,
  signRefreshToken,
} = require("../helpers/jwt_helpers");
const User = require("../models/UserModel");
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
const cloudinary = require("../helpers/UploadImage");

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.body;
    const userDoesExist = await User.findOne(
      { _id: id },
      { password: 0 }
    );

    if (userDoesExist) {
      return res.status(200).json(userDoesExist);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.updateUserRole = async(req, res) => {
  try {
    const { id, role  } = req.body;
    const userDoesExist = await User.findOne(
      { _id: id }
    );

    if (userDoesExist) {
      await User.updateOne({ _id: id }, { $set: { role: role } })
      return res.status(200).json(userDoesExist);
    }
  } catch (error) {
    console.log(error);
  }
};


exports.verifyUserPassword = async (req, res, next) => {
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
      return res.status(404).json({ message: "Entered password is wrong" });
    } else {
      return res.send({ message: "Password verification" });
    }
  } catch (err) {
    if (err.isJoi == true) err.status = 422;
    next(err);
  }
};

exports.updateProfileImage = async (req, res) => {
  try {
    const { image, userId, email } = req.body;
    const userDoesExist = await User.findOne({ _id: userId });
    if (!userDoesExist) {
      return res.status(400).send("User not found");
    }
    if (userDoesExist.image.public_id !== undefined) {
      await cloudinary.uploader.destroy(
        userDoesExist.image.public_id,
        (error, result) => {
          if (error) {
            console.error("Error deleting image:", error);
          } else {
            console.log("Image deleted successfully:", result);
          }
        }
      );
    }
    const result = await cloudinary.uploader.upload(image, {
      folder: `${email}`,
    });
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          image: {
            public_id: result.public_id,
            url: result.secure_url,
          },
        },
      }
    );
    const accessToken = await signAccessToken(
      {
        email: userDoesExist.email, role: userDoesExist.role,
        user_id: userDoesExist._id,
        userName: userDoesExist.userName,
        image: result.secure_url,
      },
      `${userDoesExist._id}`
    );
    const refreshToken = await signRefreshToken(
      { email: userDoesExist.email, role: userDoesExist.role, _id: userDoesExist._id },
      `${userDoesExist._id}`
    );

    return res.send({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Error while updating profile");
  }
};

exports.deleteProfileImage = async (req, res) => {
  try {
    const { userId } = req.body;
    const userDoesExist = await User.findOne({ _id: userId });
    if (!userDoesExist) {
      return res.status(400).send("User not found");
    }
    if (userDoesExist.image.public_id !== undefined) {
      await cloudinary.uploader.destroy(
        userDoesExist.image.public_id,
        (error, result) => {
          if (error) {
            console.error("Error deleting image:", error);
          } else {
            console.log("Image deleted successfully:", result);
          }
        }
      );
    }
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          image: "",
        },
      }
    );
    const accessToken = await signAccessToken(
      {
        email: userDoesExist.email, role: userDoesExist.role,
        user_id: userDoesExist._id,
        userName: userDoesExist.userName,
        image: "",
      },
      `${userDoesExist._id}`
    );
    const refreshToken = await signRefreshToken(
      { email: userDoesExist.email, role: userDoesExist.role, _id: userDoesExist._id },
      `${userDoesExist._id}`
    );

    return res.send({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Error while updating profile");
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { type } = req.body;
    if (type !== "") {
      let result = await User.find(
        { role: type },
        { projection: { password: 0 } }
      );
      return res.status(200).json(result);
    } else {
      let result = await User.find({ role: { $ne: 'Admin' } }, { password: 0 });
      return res.status(200).json(result);
    }
  } catch (err) {
    return res.status(400).json("Error while fetching");
  }
};


