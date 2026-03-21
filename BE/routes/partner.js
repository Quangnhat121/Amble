const express = require("express");
const router = express.Router();
const { protectPartner } = require("../middleware/partnerAuth");
const {
  getOverview,
  getOrders,
  getTables,
  getNotifications,
  createTable,
  updateTable,
  deleteTable,
  getRestaurantProfile,
  updateRestaurantProfile,
} = require("../controllers/partnerDashboardController");

router.get("/dashboard/overview", protectPartner, getOverview);
router.get("/orders", protectPartner, getOrders);
router.get("/tables", protectPartner, getTables);
router.post("/tables", protectPartner, createTable);
router.put("/tables/:tableId", protectPartner, updateTable);
router.delete("/tables/:tableId", protectPartner, deleteTable);
router.get("/notifications", protectPartner, getNotifications);
router.get("/restaurant-profile", protectPartner, getRestaurantProfile);
router.put("/restaurant-profile", protectPartner, updateRestaurantProfile);

module.exports = router;
