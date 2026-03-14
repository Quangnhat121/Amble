const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/partnerAuthController');
const { protectPartner } = require('../middleware/partnerAuth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protectPartner, getMe);
router.post('/logout', protectPartner, logout);

module.exports = router;