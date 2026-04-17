const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { getNotifications, markAllRead, markOneRead } = require('../controllers/notifications.controller');

router.use(verifyToken);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id', markOneRead);

module.exports = router;
