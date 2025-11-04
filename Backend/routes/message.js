const router = require("express").Router();
const controller = require("../controllers/messageController");

router.post("/", controller.sendMessage);
router.get("/:conversationId", controller.getMessages);

module.exports = router;
