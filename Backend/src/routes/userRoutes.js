const express = require("express");

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
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

// PUT /api/users/:id
router.put(
  "/:id",
  validateRequiredFields([
    "name",
    "role",
    "initials",
    "email",
  ]),
  updateUser
);

// DELETE /api/users/:id
router.delete("/:id", deleteUser);

module.exports = router;