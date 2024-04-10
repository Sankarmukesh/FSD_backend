
const Tasks = require("../models/Tasks")
const UserStories = require("../models/UserStories")


exports.getAllTasks = async (req, res, next) => {
    try {
        const tasks = await Tasks.find({}).populate({ path: 'lastUpdatedBy', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'owner', select: ["userName", "_id", 'email', 'image'] })
        return res.status(200).send(tasks)

    } catch (err) {
        return res.status(400).send(err)

    }
}

exports.getSingleTask = async (req, res, next) => {
    try {
        const tasks = await Tasks.findOne({ _id: req.body.taskId }).populate({ path: 'lastUpdatedBy', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'owner', select: ["userName", "_id", 'email', 'image'] })
        return res.status(200).send(tasks)

    } catch (err) {
        return res.status(400).send(err)

    }
}


exports.addTask = async (req, res, next) => {
    try {
        const { projectId, userStoryId, name, description, user_id, owner, due } = req.body
        const tasksExists = await Tasks.findOne({ userStoryId: userStoryId, name: name })
        if (tasksExists) {
            return res.status(400).json({ message: 'Tasks Name already exists' })
        }
        const addedTask = await Tasks.create({ projectId: projectId, userStoryId: userStoryId, name: name, description, owner, createdBy: user_id, status: 'New', due, lastUpdatedBy: user_id })
        const userStory = await UserStories.findOne({ _id: userStoryId })
        userStory.taskIds.unshift(addedTask._id.toString())
        userStory.save()
        const fetchingNewTask = await Tasks.findOne({ _id: addedTask._id }).populate({ path: 'lastUpdatedBy', select: ["userName", "_id", 'email', 'image'] }).populate({ path: 'owner', select: ["userName", "_id", 'email', 'image'] })
        return res.status(200).json(fetchingNewTask)
    } catch (err) {
        return res.status(400).send(err)

    }
}


exports.updateTask = async (req, res, next) => {
    try {
        const { taskId, owner, due, name, description, status, updatedBy } = req.body
        const taskExist = await Tasks.findOne({ _id: taskId })
        if (!taskExist) {
            return res.status(400).json({ message: 'Task not exists' })
        }
        await Tasks.updateOne({ _id: taskId }, { $set: { owner: owner, name: name, description: description, status: status, lastUpdatedBy: updatedBy, due: due } })
        return res.status(200).send('userstory updated')
    } catch (err) {
        return res.status(400).send(err)

    }
}

exports.deleteTask = async (req, res, next) => {
    try {
        const { taskId } = req.body
        await Tasks.deleteOne({ _id: taskId })
        return res.status(200).send('Task deleted')
    } catch (err) {
        return res.status(400).send(err)

    }
}