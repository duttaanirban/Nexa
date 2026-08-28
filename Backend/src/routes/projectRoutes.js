const express = require("express");

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const {
  validateRequiredFields,
} = require("../middleware/validation");

const router = express.Router();

// GET /api/projects
router.get("/", getProjects);

// GET /api/projects/:id
router.get("/:id", getProjectById);

// POST /api/projects
router.post(
  "/",
  validateRequiredFields([
    "name",
    "description",
  ]),
  createProject
);

// PUT /api/projects/:id
router.put(
  "/:id",
  validateRequiredFields([
    "name",
    "description",
  ]),
  updateProject
);

// DELETE /api/projects/:id
router.delete("/:id", deleteProject);

module.exports = router;