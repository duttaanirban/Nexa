const express = require("express");

const {
  getSprints,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  addTaskToSprint,
  removeTaskFromSprint,
} = require("../controllers/sprintController");

const {
  validateRequiredFields,
} = require("../middleware/validation");

const router = express.Router();

// GET /api/sprints
router.get("/", getSprints);

// GET /api/sprints/:id
router.get("/:id", getSprintById);

// POST /api/sprints
router.post(
  "/",
  validateRequiredFields([
    "name",
    "startDate",
    "endDate",
  ]),
  createSprint
);

// PUT /api/sprints/:id
router.put(
  "/:id",
  validateRequiredFields([
    "name",
    "startDate",
    "endDate",
    "status",
  ]),
  updateSprint
);

// DELETE /api/sprints/:id
router.delete("/:id", deleteSprint);

// POST /api/sprints/:id/tasks
router.post("/:sprintId/tasks", addTaskToSprint);

// DELETE /api/sprints/:id/tasks/:taskId
router.delete(
  "/:sprintId/tasks/:taskId",
  removeTaskFromSprint
);

module.exports = router;