const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TaskController");

router.route('/getAllTasks').post(TaskController.getAllTasks)
router.route('/getSingleTask').post(TaskController.getSingleTask)

router.route('/addTask').post(TaskController.addTask)
router.route('/updateTask').post(TaskController.updateTask)
router.route('/deleteTask').post(TaskController.deleteTask)





module.exports = router;