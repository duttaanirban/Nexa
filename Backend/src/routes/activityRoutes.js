const express = require("express");

const {
  getRecentActivity,
} = require("../controllers/activityController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getRecentActivity);

module.exports = router;