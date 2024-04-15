const UserStories = require("../models/UserStories")
const Tasks = require("../models/Tasks")
const Project = require("../models/Projects")

const send_mail = require("../helpers/EmailSending");


exports.getUserStoryBasedOnProject = async (req, res, next) => {
    try {
        const {projectId} = req.body
        const userStories = await UserStories.find({ projectId: projectId }).populate({ path: 'lastUpdatedBy', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'owner', select: ["userName", "_id", 'email', 'image'] }).populate({
            path: 'taskIds', select: ["name", "projectId", "type", "createdBy", 'description', 'due', 'owner', 'status', 'updatedAt', 'lastUpdatedBy'], populate: {
                path: 'owner', // Path to populate within each task object
                select: ["userName", "_id", 'email', 'image'] // Fields to select from the owner object
            }, 
        }).sort({ createdAt: -1 });
        return res.status(200).send(userStories)
    } catch (err) {
        return res.status(400).send(err)

    }
}

exports.getSingleUserStory = async (req, res, next) => {
    try {
        const { userStoryId } = req.body
        const userStories = await UserStories.findOne({ _id: userStoryId }).populate({ path: 'lastUpdatedBy', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'owner', select: ["userName", "_id", 'email', 'image'] }).populate({
            path: 'taskIds', select: ["name", "projectId", "type", "createdBy", 'description', 'due', 'owner', 'status', 'updatedAt', 'lastUpdatedBy'], populate: {
                path: 'owner', // Path to populate within each task object
                select: ["userName", "_id", 'email', 'image'] // Fields to select from the owner object
            },  })
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
        const result = await UserStories.findOne({ _id: addedData._id }).populate({ path: 'lastUpdatedBy', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'owner', select: ["userName", "_id", 'email', 'image'] }).populate({
            path: 'taskIds', select: ["name", "projectId", "type", "createdBy", 'description', 'due', 'owner', 'status', 'updatedAt', 'lastUpdatedBy'], populate: {
                path: 'owner', // Path to populate within each task object
                select: ["userName", "_id", 'email', 'image'] // Fields to select from the owner object
            },
        })
        const projectDetails = await Project.findOne({ _id: projectId})
        await send_mail(result.owner.email, 'Assigned a user story!', `A user story <b>${result.name}</b> has been assigned to you from project <b>${projectDetails.name}</b>`)
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
        const beforeUpdateUserStory = await UserStories.findOne({ _id: userStoryid }).populate({ path: 'lastUpdatedBy', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'owner', select: ["userName", "_id", 'email', 'image'] }).populate({
            path: 'taskIds', select: ["name", "projectId", "type", "createdBy", 'description', 'due', 'owner', 'status', 'updatedAt', 'lastUpdatedBy'], populate: {
                path: 'owner', // Path to populate within each task object
                select: ["userName", "_id", 'email', 'image'] // Fields to select from the owner object
            },
        })

        await UserStories.updateOne({ _id: userStoryid }, { $set: { owner: owner, name: name, description: description, status: status, lastUpdatedBy: updatedBy } })
        const result = await UserStories.findOne({ _id: userStoryid }).populate({ path: 'lastUpdatedBy', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'owner', select: ["userName", "_id", 'email', 'image'] }).populate({
            path: 'taskIds', select: ["name", "projectId", "type", "createdBy", 'description', 'due', 'owner', 'status', 'updatedAt', 'lastUpdatedBy'], populate: {
                path: 'owner', // Path to populate within each task object
                select: ["userName", "_id", 'email', 'image'] // Fields to select from the owner object
            },
        })
        
        const projectDetails = await Project.findOne({ _id: result.projectId })
        if (beforeUpdateUserStory?.owner?._id.toString() !== result?.owner?._id.toString()) {
            await send_mail(result.owner.email, 'Assigned a user story!', `A user story <b>${result.name}</b> has been assigned to you from project <b>${projectDetails.name}</b>`)
        } else {
            await send_mail(result.owner.email, 'Updates on your user Story!', `A user story <b>${result.name}</b> has been updated in project <b>${projectDetails.name}</b>`)
        }

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