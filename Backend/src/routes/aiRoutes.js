const express = require("express");
const { analyzeProject } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/project-analysis/:projectId", protect, analyzeProject);

module.exports = router;