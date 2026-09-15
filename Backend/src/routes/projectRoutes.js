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
const {
  optionalAuthenticate,
} = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/projects
router.get("/", getProjects);

// GET /api/projects/:id
router.get("/:id", getProjectById);

// POST /api/projects
router.post(
  "/",
  optionalAuthenticate,
  validateRequiredFields([
    "name",
    "description",
  ]),
  createProject
);

// PUT /api/projects/:id
router.put(
  "/:id",
  optionalAuthenticate,
  validateRequiredFields([
    "name",
    "description",
  ]),
  updateProject
);

// DELETE /api/projects/:id
router.delete(
  "/:id",
  optionalAuthenticate,
  deleteProject
);

module.exports = router;
