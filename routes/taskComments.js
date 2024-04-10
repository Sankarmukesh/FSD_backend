const express = require("express");
const router = express.Router();
const taskCommentController = require('../controllers/taskCommentController')

router.route("/addtaskComment").post(taskCommentController.addtaskComment);
router.route("/gettaskComment").post(taskCommentController.gettaskComment);
router.route("/updatetaskComment").post(taskCommentController.updatetaskComment);



module.exports = router;