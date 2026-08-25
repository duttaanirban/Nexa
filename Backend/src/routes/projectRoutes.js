const express = require("express");

const {
  getProjects,
  getProjectById,
  createProject,
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

module.exports = router;