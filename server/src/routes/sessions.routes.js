const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { getSessions, createSession, deleteSession } = require('../controllers/sessions.controller');

router.use(verifyToken);

router.get('/', getSessions);
router.post('/', createSession);
router.delete('/:id', deleteSession);

module.exports = router;
