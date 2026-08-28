const { addActivity } = require("../services/activityService");

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

  addActivity({
    type: "project-created",
    title: "Created new project",
    description: newProject.name,
    project: newProject.name,
  });

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: newProject,
  });
};

const updateProject = (req, res) => {
  const projectIndex = projects.findIndex(
    (project) => project.id === req.params.id
  );

  if (projectIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

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

  projects[projectIndex] = {
    id: projects[projectIndex].id,
    name,
    description,
    progress,
    status,
    team,
  };

  const updatedProject = projects[projectIndex];

  addActivity({
    type: "project-updated",
    title: "Updated project",
    description: updatedProject.name,
    project: updatedProject.name,
  });

  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: updatedProject,
  });
};

const deleteProject = (req, res) => {
  const projectIndex = projects.findIndex(
    (project) => project.id === req.params.id
  );

  if (projectIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  const deletedProject = projects.splice(
    projectIndex,
    1
  )[0];

  addActivity({
    type: "project-deleted",
    title: "Deleted project",
    description: deletedProject.name,
    project: deletedProject.name,
  });

  res.status(200).json({
    success: true,
    message: "Project deleted successfully",
    data: deletedProject,
  });
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};