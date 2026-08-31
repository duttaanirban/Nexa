const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { users } = require("./userController");

const JWT_SECRET =
  process.env.JWT_SECRET || "pulse-development-secret";

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
    } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, and confirm password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingUser = users.find(
      (user) =>
        user.email.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const newUser = {
      id: `USR-${String(users.length + 1).padStart(
        3,
        "0"
      )}`,
      name: name.trim(),
      role: "Developer",
      initials: name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      email: normalizedEmail,
      password: hashedPassword,
    };

    users.push(newUser);

    const token = createToken(newUser);

    res.cookie("pulse_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const {
      password: _password,
      ...safeUser
    } = newUser;

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: safeUser,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

/**
 * Login existing user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = users.find(
      (user) =>
        user.email.toLowerCase() === normalizedEmail
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message:
          "This account has not been configured for login yet",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = createToken(user);

    res.cookie("pulse_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const {
      password: _password,
      ...safeUser
    } = user;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
};

/**
 * Get currently authenticated user
 */
const getMe = async (req, res) => {
  try {
    const user = users.find(
      (user) => user.id === req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      password: _password,
      ...safeUser
    } = user;

    return res.status(200).json({
      success: true,
      data: safeUser,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load current user",
    });
  }
};

/**
 * Logout
 */
const logout = (req, res) => {
  res.clearCookie("pulse_token");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};