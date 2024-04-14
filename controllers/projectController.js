const Projects = require("../models/Projects")
const UserStories = require("../models/UserStories")
const Tasks = require("../models/Tasks")
const send_mail = require("../helpers/EmailSending")

exports.getAllProjects = async (req, res, next) => {
    try {
        if (req.payload.role !== 'Admin') {
            const projects = await Projects.find({ teamMembers: { $in: [req.payload.user_id] } }).populate({
                path: "teamMembers",
                select: ["userName", "image", "role", "email", "_id"],
            })
            return res.status(200).send(projects)
        } else {
            const projects = await Projects.find().populate({
                path: "teamMembers",
                select: ["userName", "image", "role", "email", "_id"],
            })
            return res.status(200).send(projects)
        }
        
    } catch (err) {
        return res.status(400).send(err)

    }
}



exports.getsingleProject = async (req, res, next) => {
    try {
        const projects = await Projects.findOne({ _id: req.body.projectId }).populate({
            path: "teamMembers",
            select: ["userName", "image", "role", "email", "_id"],
        })
        return res.status(200).send(projects)
    } catch (err) {
        return res.status(400).send(err)

    }
}

const sendProjectEmail = async (email, userName, name) => {
    await send_mail(email, 'Assigning a new project !', `Hey Hi ${userName} a new project ${name} has been assigned to you`)
}

const deletingProjectEmail = async (email, userName, name) => {
    await send_mail(email, 'Reemoving from project !', `Hey Hi ${userName} you are removed from a project ${name}.`)
}

exports.addProject = async (req, res, next) => {
    try {
        const { name, teamMembers, sendingEmail } = req.body
        const projectExist = await Projects.findOne({ name: name })
        if (projectExist) {
            return res.status(400).json({message: 'Project Name already exists'})
        }
        if (sendingEmail.length > 0) {
            for (let i = 0; i < sendingEmail.length; i++){
                sendProjectEmail(sendingEmail[i].email, sendingEmail[i].userName, name)
            }
        }
        const result = await Projects.create({ name: name, teamMembers: teamMembers.map(t => t._id) })
        return res.status(200).json(result)
    } catch (err) {
        console.log(err);
        return res.status(400).send(err)

    }
}

exports.updateProject = async (req, res, next) => {
    try {
        const { projectId, name, teamMembers, sendingEmail, deletingEmail } = req.body
        const projectExist = await Projects.findOne({ _id: projectId })
        if (!projectExist) {
            return res.status(400).json({ message: 'Project not exists' })
        }
        if (sendingEmail.length > 0) {
            for (let i = 0; i < sendingEmail.length; i++) {
                sendProjectEmail(sendingEmail[i].email, sendingEmail[i].userName, name)
            }
        }
        if (deletingEmail.length > 0) {
            for (let i = 0; i < deletingEmail.length; i++) {
                deletingProjectEmail(deletingEmail[i].email, deletingEmail[i].userName, name)
            }
        }
        await Projects.updateOne({ _id: projectId }, { $set: { name: name, teamMembers: teamMembers.map(t => t._id) }})
        return res.status(200).send('Project updated')
    } catch (err) {
        console.log(err);
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