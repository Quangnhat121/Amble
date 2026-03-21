const express = require('express');
const router = express.Router();
const { protectPartner } = require('../middleware/partnerAuth');
const { setupRestaurant } = require('../controllers/partnerRestaurantController');

router.put('/setup', protectPartner, setupRestaurant);

module.exports = router;
