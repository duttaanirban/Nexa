# AI-Powered Project & Task Management Platform

A developer productivity dashboard consisting of a React/Vite frontend and an
Express-based REST API backend. The platform provides project and task
management features, with a UI layer built on mock data designed to be
swapped for live API responses, and a backend that already implements the
corresponding endpoints.

---

## 📦 Repository Structure

```
.
├── Frontend/     # React + Vite dashboard UI
└── Backend/      # Express REST API
```

---

# Frontend

The frontend for a developer productivity dashboard built with React and Vite.
It currently provides a responsive dashboard shell and presentation-ready mock
data for projects, tasks, navigation, and user information.

## Current Features

- Responsive application layout with a collapsible mobile sidebar
- Sidebar navigation for Dashboard, Projects, Tasks, Team, and Settings
- Top navigation bar with user context
- Dashboard statistics for projects and task progress
- Project cards with progress, status, descriptions, and team members
- Centralized mock data designed to be replaced by REST API responses later
- Tailwind CSS styling and Lucide icons

The application currently renders the Dashboard page. The other navigation
items are represented in the UI but do not yet have separate page routes.

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- `lucide-react`
- ESLint

## Getting Started

### Prerequisites

- Node.js 22 or newer
- npm

### Install dependencies

From the `Frontend` directory:

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Then open the local URL shown by Vite, normally `http://localhost:5173/`.

### Create a production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Run linting

```bash
npm run lint
```

## Project Structure

```text
src/
├── components/
│   ├── dashboard/       # Stats and project presentation components
│   └── layouts/         # Application shell, sidebar, and navbar
├── data/
│   └── mockData.js      # Navigation, dashboard, project, and task data
├── pages/
│   └── Dashboard.jsx    # Current dashboard page
├── App.jsx              # Application composition
├── App.css              # App-level styles
├── index.css            # Global styles and Tailwind import
└── main.jsx             # React entry point
```

## Data Layer

Dashboard content is currently sourced from `src/data/mockData.js`. The data
module keeps the UI components independent of the source, so API responses can
replace the mock exports without changing the component structure.

## Development Notes

The npm scripts invoke Vite through Node directly instead of the generated
Windows command shim. This is intentional because the project path contains
an ampersand (`&`), which can cause the shim to resolve the Vite path
incorrectly on Windows.

## Planned Work

- Add routing for Projects, Tasks, Team, and Settings
- Connect dashboard data to a backend API
- Add task creation, filtering, assignment, and status updates
- Add authentication and persistent user/project data
- Add AI-assisted project and task management workflows

---

# Backend

REST API backend for the Developer Productivity Dashboard.

This backend provides APIs for managing users, projects, and tasks and is
designed to support the frontend dashboard.

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git

### Clone the repository

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The server will run at:

```
http://localhost:5000
```

### Start normally

```bash
npm start
```

---

## ❤️ Health Check

Check whether the API server is running.

**Endpoint**

```
GET /api/health
```

**Example**

```
http://localhost:5000/api/health
```

**Response**

```json
{
  "success": true,
  "message": "API is running"
}
```

---

## 👥 Users API

The Users API allows users to be retrieved and created.

### Get All Users

```
GET /api/users
```

**Example**

```
http://localhost:5000/api/users
```

**Response**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "USR-001",
      "name": "Mira Kapoor",
      "role": "Frontend Lead",
      "initials": "MK",
      "email": "mira.kapoor@example.com"
    }
  ]
}
```

### Get User By ID

```
GET /api/users/:id
```

Example:

```
GET /api/users/USR-001
```

### Create User

```
POST /api/users
```

**Request Body**

```json
{
  "name": "John Doe",
  "role": "Backend Developer",
  "initials": "JD",
  "email": "john.doe@example.com"
}
```

**Response**

```
201 Created
```

---

## 📁 Projects API

The Projects API allows projects to be retrieved and created.

### Get All Projects

```
GET /api/projects
```

**Example**

```
http://localhost:5000/api/projects
```

### Get Project By ID

```
GET /api/projects/:id
```

Example:

```
GET /api/projects/PRJ-01
```

### Create Project

```
POST /api/projects
```

**Request Body**

```json
{
  "name": "API Integration",
  "description": "Integrate the backend APIs with the dashboard.",
  "progress": 0,
  "status": "On track",
  "team": [
    "TU",
    "AK"
  ]
}
```

**Response**

```
201 Created
```

---

## ✅ Tasks API

The Tasks API provides CRUD operations for managing tasks.

### Get All Tasks

```
GET /api/tasks
```

**Example**

```
http://localhost:5000/api/tasks
```

**Response**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "T-421",
      "title": "Add retry logic to card charge endpoint",
      "project": "Checkout Revamp",
      "assignee": "AK",
      "due": "Today",
      "priority": "High",
      "status": "in-progress"
    }
  ]
}
```

### Get Task By ID

```
GET /api/tasks/:id
```

Example:

```
GET /api/tasks/T-421
```

### 🔎 Filter Tasks

Tasks can be filtered using query parameters.

**Filter By Status**

```
GET /api/tasks?status=blocked
```

**Filter By Priority**

```
GET /api/tasks?priority=High
```

**Filter By Project**

```
GET /api/tasks?project=Checkout%20Revamp
```

**Combine Filters**

```
GET /api/tasks?status=in-progress&priority=High
```

### ➕ Create Task

```
POST /api/tasks
```

**Request Body**

```json
{
  "title": "Implement task API integration",
  "project": "Checkout Revamp",
  "assignee": "MK",
  "due": "Friday",
  "priority": "High",
  "status": "todo"
}
```

**Response**

```
201 Created
```

Example:

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "T-406",
    "title": "Implement task API integration",
    "project": "Checkout Revamp",
    "assignee": "MK",
    "due": "Friday",
    "priority": "High",
    "status": "todo"
  }
}
```

### ✏️ Update Task

Updates a complete task.

```
PUT /api/tasks/:id
```

Example:

```
PUT /api/tasks/T-406
```

**Request Body**

```json
{
  "title": "Implement task API integration v2",
  "project": "Checkout Revamp",
  "assignee": "MK",
  "due": "Monday",
  "priority": "Medium",
  "status": "in-progress"
}
```

**Response**

```
200 OK
```

### 🔄 Update Task Status

Updates only the status of a task.

```
PATCH /api/tasks/:id/status
```

Example:

```
PATCH /api/tasks/T-406/status
```

**Request Body**

```json
{
  "status": "done"
}
```

**Valid Statuses**

- todo
- in-progress
- review
- blocked
- done

### 🗑️ Delete Task

```
DELETE /api/tasks/:id
```

Example:

```
DELETE /api/tasks/T-406
```

**Response**

```
200 OK
```

Example:

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 🛡️ Validation

The API uses validation middleware to validate incoming requests before they
reach the controllers.

### User Validation

Required fields:

- name
- role
- initials
- email

### Project Validation

Required fields:

- name
- description

### Task Validation

Required fields:

- title
- project
- assignee
- due
- priority
- status

### Task Status Validation

Valid statuses:

- todo
- in-progress
- review
- blocked
- done

### Task Priority Validation

Valid priorities:

- High
- Medium
- Low

### Missing Fields Example

```json
{
  "name": "Test User"
}
```

Response:

```
400 Bad Request
```

```json
{
  "success": false,
  "message": "Missing required fields: role, initials, email"
}
```

### Invalid Status Example

```json
{
  "status": "invalid"
}
```

Response:

```
400 Bad Request
```

```json
{
  "success": false,
  "message": "Invalid task status"
}
```

---

## ❌ Error Handling

The backend uses centralized error-handling middleware.

### Resource Not Found

Example:

```
GET /api/tasks/T-999
```

Response:

```
404 Not Found
```

```json
{
  "success": false,
  "message": "Task not found"
}
```

### Unknown Route

Example:

```
GET /api/example
```

Response:

```
404 Not Found
```

```json
{
  "success": false,
  "message": "Route not found: GET /api/example"
}
```

Unexpected server errors are also handled through the centralized error
handler.

---

## 📦 Response Format

### Successful Response

```json
{
  "success": true,
  "data": {}
}
```

### Collection Response

```json
{
  "success": true,
  "count": 5,
  "data": []
}
```

### Successful Mutation

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🧪 API Testing

The API was tested using HTTP requests against the local Express server.

The following functionality was tested:

- Health check
- Get all users
- Get user by ID
- Create user
- Get all projects
- Get project by ID
- Create project
- Get all tasks
- Get task by ID
- Filter tasks by status
- Filter tasks by priority
- Filter tasks by project
- Create task
- Update task
- Update task status
- Delete task
- Missing required fields
- Invalid task status
- Invalid task priority
- Invalid resource IDs
- Unknown routes
- Centralized error handling

### Validation Tests

- `POST /api/users` → Missing fields → 400
- `POST /api/users` → Valid request → 201
- `POST /api/projects` → Missing fields → 400
- `POST /api/projects` → Valid request → 201
- `POST /api/tasks` → Missing fields → 400
- `POST /api/tasks` → Invalid status → 400
- `POST /api/tasks` → Invalid priority → 400
- `POST /api/tasks` → Valid request → 201

---

## 📋 API Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Check API status |
| GET | /api/users | Get all users |
| GET | /api/users/:id | Get user by ID |
| POST | /api/users | Create user |
| GET | /api/projects | Get all projects |
| GET | /api/projects/:id | Get project by ID |
| POST | /api/projects | Create project |
| GET | /api/tasks | Get all tasks |
| GET | /api/tasks/:id | Get task by ID |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| PATCH | /api/tasks/:id/status | Update task status |
| DELETE | /api/tasks/:id | Delete task |

### Task Query Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| status | blocked | Filter by task status |
| priority | High | Filter by priority |
| project | Checkout Revamp | Filter by project |

---

## 🏗️ Architecture

The backend follows a simple layered architecture.

```
Client
  │
  ▼
Routes
  │
  ▼
Validation Middleware
  │
  ▼
Controllers
  │
  ▼
Response
```

Error handling is centralized:

```
Request
   │
   ▼
Route
   │
   ▼
Controller
   │
   ├── Success ──────► JSON Response
   │
   └── Error ────────► Error Handler
```

### Project Structure

```
src/
├── controllers/
│   ├── userController.js
│   ├── projectController.js
│   └── taskController.js
│
├── middleware/
│   ├── validation.js
│   ├── notFound.js
│   └── errorHandler.js
│
├── routes/
│   ├── userRoutes.js
│   ├── projectRoutes.js
│   └── taskRoutes.js
│
├── app.js
└── server.js
```

### Responsibilities

**Routes**
Define API endpoints and connect them to middleware/controllers.

**Validation Middleware**
Validates incoming request data before it reaches the controllers.

**Controllers**
Contain the application's request-handling and business logic.

**Not Found Middleware**
Handles requests to unknown routes.

**Error Handler**
Provides centralized handling of unexpected errors.

---

## 💾 Current Data Storage

The current implementation uses in-memory data for development and API
demonstration.

Data will reset whenever the server restarts.

A persistent database can be introduced in a future iteration.

---

## 🔮 Future Improvements

The following improvements can be added in future versions:

- Database integration
- Persistent data storage
- Authentication and authorization
- User roles and permissions
- Pagination
- Sorting
- Automated unit tests
- Integration tests
- Swagger/OpenAPI documentation
- Advanced filtering
- Frontend API integration
- Production deployment
- Logging and monitoring
- Rate limiting

---

# 🔗 Connecting Frontend and Backend

The frontend currently renders from `src/data/mockData.js`, and the backend
already exposes matching endpoints for users, projects, and tasks. Wiring the
two together consists of replacing the mock data exports with API calls to
the backend (default `http://localhost:5000`), while keeping the existing
component structure unchanged. This is listed as planned work on the
frontend side.