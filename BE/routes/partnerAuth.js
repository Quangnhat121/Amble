const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/partnerAuthController');
const { protectPartner } = require('../middleware/partnerAuth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protectPartner, getMe);

module.exports = router;