const router = require('express').Router();
const controller = require('../controllers/groupController');

router.post('/create', controller.createGrp);
router.get("/messages/:conversationId", controller.getGroupMessages);
router.post('/send', controller.sendGroupMessage);


module.exports = router;