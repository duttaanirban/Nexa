const express = require("express");

const {
  getUsers,
  getUserById,
  createUser,
} = require("../controllers/userController");

const {
  validateRequiredFields,
} = require("../middleware/validation");

const router = express.Router();

// GET /api/users
router.get("/", getUsers);

// GET /api/users/:id
router.get("/:id", getUserById);

// POST /api/users
router.post(
  "/",
  validateRequiredFields([
    "name",
    "role",
    "initials",
    "email",
  ]),
  createUser
);

module.exports = router;