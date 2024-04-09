const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true, // This adds 'createdAt' and 'updatedAt' fields
    }
);

const Projects = new mongoose.model("Projects", projectSchema);
module.exports = Projects;
