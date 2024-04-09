const mongoose = require("mongoose");

const userStoriesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Projects",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }, lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        taskIds:[ {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tasks",
        }],
        description: {
            type: String,
        }, owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }, status: {
            type: String,
        }
    },
    {
        timestamps: true, // This adds 'createdAt' and 'updatedAt' fields
    }
);

const UserStories = new mongoose.model("UserStories", userStoriesSchema);
module.exports = UserStories;
