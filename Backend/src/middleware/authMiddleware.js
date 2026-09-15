const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "pulse-development-secret";

const protect = (req, res, next) => {
  try {
    const token = req.cookies?.pulse_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

const optionalAuthenticate = (req, _res, next) => {
  try {
    const token = req.cookies?.pulse_token;

    if (token) {
      req.user = jwt.verify(token, JWT_SECRET);
    }
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = {
  protect,
  optionalAuthenticate,
};
