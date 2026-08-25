const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(
      (field) =>
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    next();
  };
};

const validateTaskStatus = (req, res, next) => {
  const validStatuses = [
    "todo",
    "in-progress",
    "review",
    "blocked",
    "done",
  ];

  if (!validStatuses.includes(req.body.status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task status",
    });
  }

  next();
};

const validateTaskPriority = (req, res, next) => {
  const validPriorities = ["High", "Medium", "Low"];

  if (!validPriorities.includes(req.body.priority)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task priority",
    });
  }

  next();
};

module.exports = {
  validateRequiredFields,
  validateTaskStatus,
  validateTaskPriority,
};