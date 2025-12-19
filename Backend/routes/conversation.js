const router = require("express").Router();
const controller = require("../controllers/conversationControllers");

router.post("/", controller.createConversation);
router.get("/user/:userId", controller.getUserConversations);

module.exports = router;
