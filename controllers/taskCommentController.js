
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
const TaskDiscussion = require("../models/TaskDiscussion");

exports.addtaskComment = async (req, res, next) => {
    try {
        const { taskId, comment, commentBy } = req.body
        const addedComment = await TaskDiscussion.create({ comment: comment, commentBy: commentBy, taskId: taskId })
        const updatedComment = await TaskDiscussion.findOne({ _id: addedComment._id }).populate({
            path: "commentBy",
            select: ["userName", "image", "role"],
        })
        return res.status(200).json(updatedComment);
    } catch (err) {
        return res.status(400).json(err);
    }
};


exports.gettaskComment = async (req, res, next) => {
    try {
        const { taskId } = req.body
        const comments = await TaskDiscussion.find({ taskId: taskId }).populate({
            path: "commentBy",
            select: ["userName", "image", "role"],
        })
        return res.status(200).json(comments);
    } catch (err) {
        return res.status(400).json(err);
    }
};


exports.updatetaskComment = async (req, res, next) => {
    try {
        const { taskId, comment } = req.body
        await TaskDiscussion.updateOne({ _id: taskId }, { $set: { comment: comment } })
        return res.status(200).json('comments updated');
    } catch (err) {
        return res.status(400).json(err);
    }
};


