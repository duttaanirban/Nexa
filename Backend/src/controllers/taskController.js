const { addActivity } = require("../services/activityService");
const tasks = [
  {
    id: "T-421",
    title: "Add retry logic to card charge endpoint",
    project: "Checkout Revamp",
    assignee: "AK",
    due: "Today",
    priority: "High",
    status: "in-progress",
  },
  {
    id: "T-418",
    title: "Write integration tests for webhook handler",
    project: "Realtime Notifications",
    assignee: "JT",
    due: "Tomorrow",
    priority: "Medium",
    status: "todo",
  },
  {
    id: "T-402",
    title: "Migrate color tokens to OKLCH",
    project: "Design Tokens",
    assignee: "SD",
    due: "Overdue",
    priority: "High",
    status: "blocked",
  },
  {
    id: "T-397",
    title: "QA pass on saved-card UI",
    project: "Checkout Revamp",
    assignee: "RS",
    due: "Fri",
    priority: "Low",
    status: "review",
  },
  {
    id: "T-390",
    title: "Set up push notification certificates",
    project: "Realtime Notifications",
    assignee: "PL",
    due: "Mon",
    priority: "Medium",
    status: "done",
  },
];

const getTasks = (req, res) => {
  const { status, priority, project } = req.query;

  let filteredTasks = [...tasks];

  if (status) {
    filteredTasks = filteredTasks.filter(
      (task) => task.status === status
    );
  }

  if (priority) {
    filteredTasks = filteredTasks.filter(
      (task) => task.priority === priority
    );
  }

  if (project) {
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.project.toLowerCase() === project.toLowerCase()
    );
  }

  res.status(200).json({
    success: true,
    count: filteredTasks.length,
    data: filteredTasks,
  });
};

const getTaskById = (req, res) => {
  const task = tasks.find(
    (task) => task.id === req.params.id
  );

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  res.status(200).json({
    success: true,
    data: task,
  });
};

const createTask = (req, res) => {
  const {
    title,
    project,
    assignee,
    due,
    priority,
    status,
  } = req.body;

  if (!title || !project || !assignee || !due || !priority || !status) {
    return res.status(400).json({
      success: false,
      message:
        "Title, project, assignee, due, priority, and status are required",
    });
  }

  const newTask = {
    id: `T-${400 + tasks.length + 1}`,
    title,
    project,
    assignee,
    due,
    priority,
    status,
  };

  tasks.push(newTask);
  addActivity({
  type: "task-created",
  title: "Created new task",
  description: newTask.title,
  project: newTask.project,
  user: newTask.assignee,
});

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: newTask,
  });
};

const updateTask = (req, res) => {
  const taskIndex = tasks.findIndex(
    (task) => task.id === req.params.id
  );

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  const {
    title,
    project,
    assignee,
    due,
    priority,
    status,
  } = req.body;

  if (!title || !project || !assignee || !due || !priority || !status) {
    return res.status(400).json({
      success: false,
      message:
        "Title, project, assignee, due, priority, and status are required",
    });
  }

  tasks[taskIndex] = {
    id: tasks[taskIndex].id,
    title,
    project,
    assignee,
    due,
    priority,
    status,
  };
  addActivity({
  type: "task-updated",
  title: "Updated task",
  description: tasks[taskIndex].title,
  project: tasks[taskIndex].project,
  user: tasks[taskIndex].assignee,
});

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: tasks[taskIndex],
  });
};

const updateTaskStatus = (req, res) => {
  const task = tasks.find(
    (task) => task.id === req.params.id
  );

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  const { status } = req.body;

  const validStatuses = [
    "todo",
    "in-progress",
    "review",
    "blocked",
    "done",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task status",
    });
  }

  task.status = status;
  addActivity({
  type:
    status === "done"
      ? "task-completed"
      : "task-status-changed",
  title:
    status === "done"
      ? "Completed task"
      : "Updated task status",
  description: task.title,
  project: task.project,
  user: task.assignee,
});

  res.status(200).json({
    success: true,
    message: "Task status updated successfully",
    data: task,
  });
};

const deleteTask = (req, res) => {
  const taskIndex = tasks.findIndex(
    (task) => task.id === req.params.id
  );

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  addActivity({
  type: "task-deleted",
  title: "Deleted task",
  description: deletedTask.title,
  project: deletedTask.project,
  user: deletedTask.assignee,
});

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
    data: deletedTask,
  });
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};