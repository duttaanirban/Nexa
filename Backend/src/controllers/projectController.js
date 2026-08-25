const projects = [
  {
    id: "PRJ-01",
    name: "Checkout Revamp",
    description:
      "Rebuild the payment flow with saved cards and one-tap retry.",
    progress: 72,
    status: "On track",
    team: ["AK", "RS", "MN"],
  },
  {
    id: "PRJ-02",
    name: "Realtime Notifications",
    description:
      "WebSocket service for in-app and push notification delivery.",
    progress: 41,
    status: "In progress",
    team: ["JT", "PL"],
  },
  {
    id: "PRJ-03",
    name: "Design Tokens",
    description:
      "Shared token library consumed by web, mobile, and documentation.",
    progress: 18,
    status: "Blocked",
    team: ["SD"],
  },
];

const getProjects = (req, res) => {
  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
};

const getProjectById = (req, res) => {
  const project = projects.find(
    (project) => project.id === req.params.id
  );

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  res.status(200).json({
    success: true,
    data: project,
  });
};

const createProject = (req, res) => {
  const {
    name,
    description,
    progress = 0,
    status = "On track",
    team = [],
  } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      success: false,
      message: "Name and description are required",
    });
  }

  const newProject = {
    id: `PRJ-${String(projects.length + 1).padStart(2, "0")}`,
    name,
    description,
    progress,
    status,
    team,
  };

  projects.push(newProject);

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: newProject,
  });
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
};