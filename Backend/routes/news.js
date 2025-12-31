const router = require('express').Router();
const controller = require('../controllers/newsController');
router.get('/tech',controller.getTechNews);

module.exports = router;