const express = require("express");

const {
  getRecentActivity,
} = require("../controllers/activityController");

const router = express.Router();

// GET /api/activity
router.get("/", getRecentActivity);

module.exports = router;