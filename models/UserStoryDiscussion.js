const mongoose = require("mongoose");

const userStoryCommentSchema = new mongoose.Schema(
    {
        userStoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserStories", },
        commentBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        comment: {
            type: String,
        }
    },
    {
        timestamps: true, // This adds 'createdAt' and 'updatedAt' fields
    }
);

const UserStoryComment = new mongoose.model("UserStoryComment", userStoryCommentSchema);
module.exports = UserStoryComment;
