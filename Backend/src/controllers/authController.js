const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { pool } = require("../config/database");

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

const toSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  role: user.role,
  initials: user.initials,
  email: user.email,
  department: user.department || "",
  phone: user.phone || "",
  bio: user.bio || "",
  createdAt: user.created_at,
});

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
        message: "Password must be at least 8 characters",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      `
        SELECT id
        FROM users
        WHERE email = $1
      `,
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const initials = normalizedName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const idResult = await pool.query(`
      SELECT
        'USR-' ||
        LPAD(
          (
            COALESCE(
              MAX(
                NULLIF(
                  SUBSTRING(id FROM 5),
                  ''
                )::INTEGER
              ),
              0
            ) + 1
          )::TEXT,
          3,
          '0'
        ) AS id
      FROM users
      WHERE id LIKE 'USR-%'
    `);

    const newUserId = idResult.rows[0].id;

    const result = await pool.query(
      `
        INSERT INTO users (
          id,
          name,
          role,
          initials,
          email,
          password_hash
        )
        VALUES (
          $1,
          $2,
          'Developer',
          $3,
          $4,
          $5
        )
        RETURNING
          id,
          name,
          role,
          initials,
          email,
          department,
          phone,
          bio,
          created_at
      `,
      [
        newUserId,
        normalizedName,
        initials,
        normalizedEmail,
        hashedPassword,
      ]
    );

    const newUser = result.rows[0];

    const token = createToken(newUser);

    res.cookie("pulse_token", token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: toSafeUser(newUser),
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

    const result = await pool.query(
      `
        SELECT *
        FROM users
        WHERE email = $1
      `,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message:
          "This account has not been configured for login yet",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
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
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: toSafeUser(user),
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
    const result = await pool.query(
      `
        SELECT
          id,
          name,
          role,
          initials,
          email,
          department,
          phone,
          bio,
          created_at
        FROM users
        WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: toSafeUser(result.rows[0]),
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

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