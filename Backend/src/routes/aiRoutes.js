const express = require("express");
const { analyzeProject, prioritizeTasks } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/project-analysis/:projectId", protect, analyzeProject);
router.post("/task-prioritization/:projectId", protect, prioritizeTasks);

module.exports = router;