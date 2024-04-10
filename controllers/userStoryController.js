const UserStories = require("../models/UserStories")
const Tasks = require("../models/Tasks")


exports.getUserStoryBasedOnProject = async (req, res, next) => {
    try {
        const {projectId} = req.body
        const userStories = await UserStories.find({ projectId: projectId }).populate({ path: 'lastUpdatedBy', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'owner', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'taskIds', select: ["name", "projectId", "createdBy", 'description', 'due', 'owner', 'status'] })
        return res.status(200).send(userStories)
    } catch (err) {
        return res.status(400).send(err)

    }
}

exports.getSingleUserStory = async (req, res, next) => {
    try {
        const { userStoryId } = req.body
        const userStories = await UserStories.findOne({ _id: userStoryId }).populate({ path: 'lastUpdatedBy', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'owner', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'taskIds', select: ["name", "projectId", "createdBy", 'description', 'due', 'owner', 'status'] })
        return res.status(200).send(userStories)
    } catch (err) {
        return res.status(400).send(err)

    }
}

exports.addUserStory = async (req, res, next) => {
    try {
        const { projectId, name,  description, user_id, owner,  } = req.body
        const userStoryExists = await UserStories.findOne({ projectId: projectId, name: name })
        if (userStoryExists) {
            return res.status(400).json({ message: 'UserStories Name already exists' })
        }
        const addedData = await UserStories.create({ projectId: projectId, name: name, description, owner, createdBy: user_id, status: 'New', lastUpdatedBy: user_id })
        const result = await UserStories.findOne({ _id: addedData._id }).populate({ path: 'lastUpdatedBy', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'owner', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'taskIds', select: ["name", "projectId", "createdBy", 'description', 'due', 'owner', 'status'] })
        return res.status(200).json(result)
    } catch (err) {
        return res.status(400).send(err)

    }
}


exports.updateOwnerForUserStory = async (req, res, next) => {
    try {
        const { userStoryid, owner, name, description, status, updatedBy} = req.body
        const userStoryExists = await UserStories.findOne({ _id: userStoryid })
        if (!userStoryExists) {
            return res.status(400).json({ message: 'UserStories not exists' })
        }
        await UserStories.updateOne({ _id: userStoryid }, { $set: { owner: owner, name: name, description: description, status: status, lastUpdatedBy: updatedBy } })
        const result = await UserStories.findOne({ _id: userStoryid }).populate({ path: 'lastUpdatedBy', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'owner', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'taskIds', select: ["name", "projectId", "createdBy", 'description', 'due', 'owner', 'status'] })
        return res.status(200).json(result)
    } catch (err) {
        return res.status(400).send(err)

    }
}

exports.deleteUserStory = async (req, res, next) => {
    try {
        const { userStoryid } = req.body
        await Tasks.deleteMany({ userStoryId: userStoryid })
        await UserStories.deleteOne({ _id: userStoryid })
        return res.status(200).send('UserStory deleted')
    } catch (err) {
        return res.status(400).send(err)

    }
}