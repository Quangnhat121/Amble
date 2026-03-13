const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  toggleFavoriteRoute,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect); // All user routes require auth

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/favorite/:routeId', toggleFavoriteRoute);

module.exports = router;