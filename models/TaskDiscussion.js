const mongoose = require("mongoose");

const taskDiscussionSchema = new mongoose.Schema(
    {
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tasks",
        },
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

const TaskComment = new mongoose.model("TaskComment", taskDiscussionSchema);
module.exports = TaskComment;
