const express = require("express");
const router = express.Router();
const userStoryController = require("../controllers/userStoryController");

router.route('/getAllUserStories').post(userStoryController.getUserStoryBasedOnProject)
router.route('/getSingleUserStory').post(userStoryController.getSingleUserStory)

router.route('/addUserStory').post(userStoryController.addUserStory)
router.route('/updateUserStory').post(userStoryController.updateOwnerForUserStory)
router.route('/deleteUserStory').post(userStoryController.deleteUserStory)





module.exports = router;