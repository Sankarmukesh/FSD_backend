const Projects = require("../models/Projects")
const UserStories = require("../models/UserStories")
const Tasks = require("../models/Tasks")

exports.getAllProjects = async (req, res, next) => {
    try {
        const projects = await Projects.find()
        return res.status(200).send(projects)
    } catch (err) {
        return res.status(400).send(err)

    }
}



exports.getsingleProject = async (req, res, next) => {
    try {
        const projects = await Projects.findOne({_id: req.body.projectId})
        return res.status(200).send(projects)
    } catch (err) {
        return res.status(400).send(err)

    }
}
exports.addProject = async (req, res, next) => {
    try {
        const { name } = req.body
        const projectExist = await Projects.findOne({ name: name })
        if (projectExist) {
            return res.status(400).json({message: 'Project Name already exists'})
        }
        const result = await Projects.create({ name: name })
        return res.status(200).json(result)
    } catch (err) {
        return res.status(400).send(err)

    }
}

exports.updateProject = async (req, res, next) => {
    try {
        const { projectId, name } = req.body
        const projectExist = await Projects.findOne({ _id: projectId })
        if (!projectExist) {
            return res.status(400).json({ message: 'Project not exists' })
        }
        await Projects.updateOne({ _id: projectId }, {$set: {name: name}})
        return res.status(200).send('Project updated')
    } catch (err) {
        return res.status(400).send(err)

    }
}

exports.deleteProject = async (req, res, next) => {
    try {
        const { projectId } = req.body
        await UserStories.deleteMany({ projectId: projectId })
        await Tasks.deleteMany({ projectId: projectId })
        await Projects.deleteOne({ _id: projectId })
        return res.status(200).send('Project deleted')
    } catch (err) {
        return res.status(400).send(err)

    }
}