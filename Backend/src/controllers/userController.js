const bcrypt = require("bcryptjs");

const users = [
  {
    id: "USR-001",
    name: "Mira Kapoor",
    role: "Frontend Lead",
    initials: "MK",
    email: "mira.kapoor@example.com",
    Password: "Pulse1234",
  },
  {
    id: "USR-002",
    name: "Arjun Kumar",
    role: "Backend Developer",
    initials: "AK",
    email: "arjun.kumar@example.com",
  },
  {
    id: "USR-003",
    name: "Riya Sharma",
    role: "UI/UX Designer",
    initials: "RS",
    email: "riya.sharma@example.com",
  },
];

const getUsers = (req, res) => {
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
};

const getUserById = (req, res) => {
  const user = users.find(
    (user) => user.id === req.params.id
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};

const createUser = (req, res) => {
  const {
    name,
    role,
    initials,
    email,
  } = req.body;

  if (!name || !role || !initials || !email) {
    return res.status(400).json({
      success: false,
      message:
        "Name, role, initials, and email are required",
    });
  }

  const newUser = {
    id: `USR-${String(users.length + 1).padStart(3, "0")}`,
    name,
    role,
    initials,
    email,
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: newUser,
  });
};

const updateUser = (req, res) => {
  const userIndex = users.findIndex(
    (user) => user.id === req.params.id
  );

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const {
    name,
    role,
    initials,
    email,
    department = "",
    phone = "",
    bio = "",
  } = req.body;

  if (!name || !role || !initials || !email) {
    return res.status(400).json({
      success: false,
      message:
        "Name, role, initials, and email are required",
    });
  }

  users[userIndex] = {
    ...users[userIndex],
    name,
    role,
    initials,
    email,
    department,
    phone,
    bio,
  };

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: users[userIndex],
  });
};

const deleteUser = (req, res) => {
  const userIndex = users.findIndex(
    (user) => user.id === req.params.id
  );

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const deletedUser = users.splice(
    userIndex,
    1
  )[0];

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: deletedUser,
  });
};

module.exports = {
  users,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};