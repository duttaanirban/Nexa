const express = require("express");

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require("../controllers/taskController");

const {
  validateRequiredFields,
  validateTaskStatus,
  validateTaskPriority,
} = require("../middleware/validation");

const router = express.Router();

/*
  GET /api/tasks
  GET /api/tasks?status=blocked
  GET /api/tasks?priority=High
  GET /api/tasks?project=Checkout%20Revamp
*/
router.get("/", getTasks);

/*
  GET /api/tasks/:id
*/
router.get("/:id", getTaskById);

/*
  POST /api/tasks
*/
router.post(
  "/",
  validateRequiredFields([
    "title",
    "project",
    "assignee",
    "due",
    "priority",
    "status",
  ]),
  validateTaskStatus,
  validateTaskPriority,
  createTask
);

/*
  PUT /api/tasks/:id
*/
router.put(
  "/:id",
  validateRequiredFields([
    "title",
    "project",
    "assignee",
    "due",
    "priority",
    "status",
  ]),
  validateTaskStatus,
  validateTaskPriority,
  updateTask
);

/*
  PATCH /api/tasks/:id/status
*/
router.patch(
  "/:id/status",
  validateTaskStatus,
  updateTaskStatus
);

/*
  DELETE /api/tasks/:id
*/
router.delete("/:id", deleteTask);

module.exports = router;