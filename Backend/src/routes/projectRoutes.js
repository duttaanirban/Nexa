const express = require("express");

const {
  getProjects,
  getProjectById,
  createProject,
} = require("../controllers/projectController");

const router = express.Router();

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);

module.exports = router;