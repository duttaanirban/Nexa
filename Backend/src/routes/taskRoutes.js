const express = require("express");

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

router.get("/", getTasks);
router.get("/:id", getTaskById);

router.post("/", createTask);

router.put("/:id", updateTask);
router.patch("/:id/status", updateTaskStatus);

router.delete("/:id", deleteTask);

module.exports = router;