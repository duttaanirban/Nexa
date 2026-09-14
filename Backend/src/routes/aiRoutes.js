const express = require("express");
const { analyzeProject, prioritizeTasks, generateTasks } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/project-analysis/:projectId", protect, analyzeProject);
router.post("/task-prioritization/:projectId", protect, prioritizeTasks);
router.post("/generate-tasks/:projectId", protect, generateTasks);

module.exports = router;