const router = require("express").Router();
const controller = require("../controllers/messageController");

router.post("/send", controller.sendMessage);
router.get("/get/:recieverId", controller.getMessages);
router.get("/chat-list/:userId", controller.getChatList);
router.delete("/deleteOne/:msgId", controller.deleteMessage);


module.exports = router;
