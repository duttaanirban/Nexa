const API_BASE_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  },
  ...options,
});

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
}

export const api = {
  // Users
  getUsers: () =>
    request("/users"),

  getUserById: (id) =>
    request(`/users/${id}`),

  // Projects
  getProjects: () =>
    request("/projects"),

  getProjectById: (id) =>
    request(`/projects/${id}`),

  createProject: (project) =>
    request("/projects", {
      method: "POST",
      body: JSON.stringify(project),
    }),

  updateProject: (id, project) =>
    request(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(project),
    }),

  deleteProject: (id) =>
    request(`/projects/${id}`, {
      method: "DELETE",
    }),

  // Tasks
  getTasks: (params = "") =>
    request(`/tasks${params}`),

  getTaskById: (id) =>
    request(`/tasks/${id}`),

  createTask: (task) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }),

  updateTask: (id, task) =>
    request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(task),
    }),

  updateTaskStatus: (id, status) =>
    request(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteTask: (id) =>
    request(`/tasks/${id}`, {
      method: "DELETE",
    }),

  // Activity
  getActivity: () =>
    request("/activity"),

  // Team
  createUser: (user) =>
  request("/users", {
    method: "POST",
    body: JSON.stringify(user),
  }),

updateUser: (id, user) =>
  request(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(user),
  }),

deleteUser: (id) =>
  request(`/users/${id}`, {
    method: "DELETE",
  }),

  // Authentication
  register: (user) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(user),
    }),

  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getCurrentUser: () =>
    request("/auth/me"),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),
};

