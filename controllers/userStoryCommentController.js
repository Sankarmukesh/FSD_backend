
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
const UserStory = require("../models/UserStoryDiscussion");

exports.addUserStoryComment = async (req, res, next) => {
    try {
        const { userStoryId, comment, commentBy } = req.body
        const addedComment = await UserStory.create({ comment: comment, commentBy: commentBy, userStoryId: userStoryId })
        const updatedComment = await UserStory.findOne({ _id: addedComment._id }).populate({
            path: "commentBy",
            select: ["userName", "image", "role"],
        })
        return res.status(200).json(updatedComment);
    } catch (err) {
        return res.status(400).json(err);
    }
};


exports.getUserStoryComment = async (req, res, next) => {
    try {
        const { userStoryId } = req.body
        const comments = await UserStory.find({ userStoryId: userStoryId }).populate({
            path: "commentBy",
            select: ["userName", "image", "role"],
        })
        return res.status(200).json(comments);
    } catch (err) {
        return res.status(400).json(err);
    }
};


exports.updateUserStoryComment = async (req, res, next) => {
    try {
        const { userStoryCommentId, comment } = req.body
        await UserStory.updateOne({ _id: userStoryCommentId }, { $set: { comment: comment }})
        return res.status(200).json('comments updated');
    } catch (err) {
        return res.status(400).json(err);
    }
};


