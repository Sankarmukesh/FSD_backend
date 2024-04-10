const express = require("express");
const router = express.Router();
const userStoryCommentController = require('../controllers/userStoryCommentController')

router.route("/addUserStoryComment").post(userStoryCommentController.addUserStoryComment);
router.route("/getUserStoryComment").post(userStoryCommentController.getUserStoryComment);
router.route("/updateUserStoryComment").post(userStoryCommentController.updateUserStoryComment);



module.exports = router;