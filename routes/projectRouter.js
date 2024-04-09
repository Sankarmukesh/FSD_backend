const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.route('/getAllProjects').get(projectController.getAllProjects)
router.route('/getsingleProject').get(projectController.getsingleProject)

router.route('/addProject').post(projectController.addProject)
router.route('/updateProject').post(projectController.updateProject)
router.route('/deleteProject').post(projectController.deleteProject)





module.exports = router;