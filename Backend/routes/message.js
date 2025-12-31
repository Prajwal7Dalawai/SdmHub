const router = require("express").Router();
const controller = require("../controllers/messageController");
const middleware = require('../middleware/authMiddleware');

router.post("/send", controller.sendMessage);
router.get("/get/:conversationId", controller.getMessages);
router.get("/chat-list", controller.getChatList);
router.delete("/deleteOne/:msgId", controller.deleteMessage);
router.get("/search", controller.searchUsers);

module.exports = router;
