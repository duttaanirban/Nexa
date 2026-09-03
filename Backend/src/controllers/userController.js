const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");

/*
 * Remove sensitive database fields from API responses.
 */
const toSafeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    role: user.role,
    initials: user.initials,
    email: user.email,
    department: user.department || "",
    phone: user.phone || "",
    bio: user.bio || "",
    createdAt: user.created_at,
  };
};

/**
 * Get all users
 */
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
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
      ORDER BY id
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(toSafeUser),
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load users",
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
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
      [req.params.id]
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
    console.error("Get user by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load user",
    });
  }
};

/**
 * Create user
 */
const createUser = async (req, res) => {
  try {
    const {
      name,
      role,
      initials,
      email,
      password,
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

    const normalizedName = name.trim();
    const normalizedInitials = initials.trim().toUpperCase();
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
        message: "A user with this email already exists",
      });
    }

    let passwordHash = null;

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }

      passwordHash = await bcrypt.hash(password, 12);
    }

    /*
     * Preserve Nexa's existing public ID format.
     */
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
          password_hash,
          department,
          phone,
          bio
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9
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
        role,
        normalizedInitials,
        normalizedEmail,
        passwordHash,
        department,
        phone,
        bio,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: toSafeUser(result.rows[0]),
    });
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create user",
    });
  }
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const existingUser = await pool.query(
      `
        SELECT *
        FROM users
        WHERE id = $1
      `,
      [userId]
    );

    if (existingUser.rows.length === 0) {
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

    const normalizedName = name.trim();
    const normalizedInitials = initials.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    const duplicateEmail = await pool.query(
      `
        SELECT id
        FROM users
        WHERE email = $1
          AND id <> $2
      `,
      [normalizedEmail, userId]
    );

    if (duplicateEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const result = await pool.query(
      `
        UPDATE users
        SET
          name = $1,
          role = $2,
          initials = $3,
          email = $4,
          department = $5,
          phone = $6,
          bio = $7
        WHERE id = $8
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
        normalizedName,
        role,
        normalizedInitials,
        normalizedEmail,
        department,
        phone,
        bio,
        userId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: toSafeUser(result.rows[0]),
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user",
    });
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res) => {
  try {
    const result = await pool.query(
      `
        DELETE FROM users
        WHERE id = $1
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
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: toSafeUser(result.rows[0]),
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete user",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};