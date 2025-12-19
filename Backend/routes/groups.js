const router = require('express').Router();
const controller = require('../controllers/groupController');
const middleware = require('../middleware/authMiddleware');
router.post('/create',middleware.auth, controller.createGrp);
router.get("/messages/:conversationId",middleware.auth, controller.getGroupMessages);
router.post('/send',middleware.auth, controller.sendGroupMessage);


module.exports = router;