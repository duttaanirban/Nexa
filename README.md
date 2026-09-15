# Nexa Workspace

Current version: `1.0.0` backend API, `0.0.0` frontend client.

Nexa is a developer productivity and project management platform with a React dashboard and an Express REST API. It provides authenticated workspace views for projects, tasks, team members, activity, notifications, sprints, reports, alerts, and settings.

## Repository Structure

```text
.
|-- Frontend/    # React and Vite client application
|-- Backend/     # Express REST API
`-- README.md    # Project overview
```

## Current Capabilities

- Nexa branding in the sidebar, authentication screens, dashboard, reports, alerts, browser title, and favicon
- Responsive application shell with desktop and mobile sidebar navigation
- Protected routes with login, registration, logout, current-user session checks, forgot-password, and reset-password flows
- Dashboard statistics, date-range selection, activity, project progress, tasks, and team workload
- Project list and project detail views with create, update, and delete operations
- Project details with task summaries, project health analysis, and AI task suggestion workflows
- Task list with search and filters for status, priority, project, and assignee
- Task creation, editing, status updates, and deletion
- Team member management
- Notifications with individual and bulk read actions
- Sprint planning with create/delete flows, sprint detail views, sprint progress metrics, and task assignment/removal
- Reports and productivity analytics
- Alert configuration screens and workspace/profile settings
- Global search across projects and tasks
- REST API integration using cookie credentials and configurable frontend API URL
- AI-powered project analysis, task prioritization, and task generation through Google Gemini

## Technology

- Frontend: React 19, React Router, Vite 8, Tailwind CSS 4, Recharts, Lucide React
- Backend: Node.js, Express 5, JSON Web Tokens, bcryptjs, cookie-parser, CORS, dotenv, node-postgres
- AI and email: Google Gemini via `@google/genai`, password reset email via Brevo
- Data: PostgreSQL persistence for users, projects, project members, tasks, sprints, and sprint-task assignments; activity and notifications remain in memory

## Run Locally

Install dependencies in both applications:

```bash
cd Frontend
npm install
cd ../Backend
npm install
```

Create a PostgreSQL database and apply the backend schema before starting the API:

```bash
cd Backend
psql -d nexa -f src/config/schema.sql
```

Set `DATABASE_URL` in `Backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/nexa
```

Start the backend in one terminal:

```bash
cd Backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd Frontend
npm run dev
```

Open `http://localhost:5173`. By default, the frontend calls the API at `http://localhost:5000/api` and sends cookies with requests. Set `VITE_API_URL` in the frontend environment to use a different API base URL.

## Verification

```bash
cd Frontend
npm run lint
npm run build
```

The frontend scripts call Vite and ESLint through Node directly. This avoids Windows command-shim problems caused by the ampersand in the repository path.

## Application Routes

- `/login` - Public login and registration screen
- `/reset-password/:token` - Public password reset screen
- `/` - Protected dashboard
- `/projects` and `/projects/:id` - Projects and project details
- `/tasks` - Task management
- `/team` - Team management
- `/settings` - Profile, notification, and workspace settings
- `/sprints` and `/sprints/:id` - Sprint views
- `/reports` - Reports and analytics
- `/alerts` - Alert management

## Backend API Endpoints

- `GET /` - API status message
- `GET /api/health` - Health check

### Authentication

- `POST /api/auth/register` - Create an account and set the auth cookie
- `POST /api/auth/login` - Log in and set the auth cookie
- `GET /api/auth/me` - Get the authenticated user
- `POST /api/auth/logout` - Clear the auth cookie
- `POST /api/auth/forgot-password` - Create a reset link and send/log it
- `POST /api/auth/reset-password/:token` - Set a new password from a reset token

### Users

- `GET /api/users` - List team members
- `GET /api/users/:id` - Get a team member
- `POST /api/users` - Create a team member
- `PUT /api/users/:id` - Update a team member
- `DELETE /api/users/:id` - Delete a team member

### Projects

- `GET /api/projects` - List projects with team data
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create a project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Tasks

- `GET /api/tasks` - List tasks
- `GET /api/tasks?status=blocked` - Filter tasks by status
- `GET /api/tasks?priority=High` - Filter tasks by priority
- `GET /api/tasks?project=Project%20Name` - Filter tasks by project name
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create a task
- `PUT /api/tasks/:id` - Update a task
- `PATCH /api/tasks/:id/status` - Update only task status
- `DELETE /api/tasks/:id` - Delete a task

Task statuses are `todo`, `in-progress`, `review`, `blocked`, and `done`. Task priorities are `High`, `Medium`, and `Low`.

### Sprints

- `GET /api/sprints` - List sprints with task counts and completion rates
- `GET /api/sprints/:id` - Get a sprint with assigned tasks
- `POST /api/sprints` - Create a sprint
- `PUT /api/sprints/:id` - Update a sprint
- `DELETE /api/sprints/:id` - Delete a sprint
- `POST /api/sprints/:sprintId/tasks` - Add a task to a sprint
- `DELETE /api/sprints/:sprintId/tasks/:taskId` - Remove a task from a sprint

Sprint statuses are `Active`, `Upcoming`, `Completed`, and `Cancelled`.

### AI

- `POST /api/ai/project-analysis/:projectId` - Generate project health, risks, recommendations, and priority-task insight
- `POST /api/ai/task-prioritization/:projectId` - Prioritize tasks for a project; use `all` as the project ID to analyze all tasks
- `POST /api/ai/generate-tasks/:projectId` - Generate task suggestions from a requirement description

AI endpoints require `GEMINI_API_KEY`.

### Activity and Notifications

- `GET /api/activity` - Get recent activity
- `GET /api/notifications` - Get authenticated notifications
- `PATCH /api/notifications/:id/read` - Mark one notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read

## Configuration

The backend loads environment variables with `dotenv`.

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - API port; defaults to `5000`
- `JWT_SECRET` - JWT signing secret; a development fallback is used when missing
- `FRONTEND_URL` - Comma-separated allowed CORS origins and password-reset client URL; defaults to `http://localhost:5173`
- `GEMINI_API_KEY` - Enables AI project analysis, task prioritization, and task generation
- `BREVO_API_KEY` - Sends password reset email; without it, the reset link is logged to the backend console
- `NODE_ENV=production` - Enables production cookie and SSL-related behavior

The frontend supports:

- `VITE_API_URL` - API base URL; defaults to `http://localhost:5000/api`

The current CORS configuration allows configured frontend origins with credentials enabled.

## Current Limitations

- Activity history are held in memory and reset when the backend restarts.
- Alert configuration data is currently managed in frontend state and local data modules.
- No automated test suite is currently configured.
