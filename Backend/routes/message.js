const router = require("express").Router();
const controller = require("../controllers/messageController");
const middleware = require('../middleware/authMiddleware');

router.post("/send",middleware.auth, controller.sendMessage);
router.get("/get/:conversationId",middleware.auth, controller.getMessages);
router.get("/chat-list/",middleware.auth, controller.getChatList);
router.delete("/deleteOne/:msgId",middleware.auth, controller.deleteMessage);
router.get("/search",controller.searchPplAndGrps);
router.post("/dm/start", middleware.auth, controller.startDirectChat);


module.exports = router;
