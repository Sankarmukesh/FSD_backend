const mongoose = require("mongoose");

const tasksSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Projects",
        },
        userStoryId: {
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
        description: {
            type: String,
        }, due: {
            type: String,
        }, owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }, status: {
            type: String
        }
    },
    {
        timestamps: true, // This adds 'createdAt' and 'updatedAt' fields
    }
);

const Tasks = new mongoose.model("Tasks", tasksSchema);
module.exports = Tasks;
