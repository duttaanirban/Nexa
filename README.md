# Nexa Workspace

Nexa is a developer productivity and project management platform with a React dashboard and an Express REST API. It provides authenticated workspace views for projects, tasks, team members, activity, notifications, sprints, reports, alerts, and settings.

## Repository Structure

```text
.
├── Frontend/    # React and Vite client application
├── Backend/     # Express REST API
└── README.md    # Project overview
```

## Current Capabilities

- Nexa branding in the sidebar, authentication screens, dashboard, reports, alerts, browser title, and favicon
- Responsive application shell with desktop and mobile sidebar navigation
- Protected routes with login and registration flows
- Dashboard statistics, date-range selection, activity, project progress, tasks, and team workload
- Project list and project detail views with create, update, and delete operations
- Task list with search and filters for status, priority, project, and assignee
- Task creation, editing, status updates, and deletion
- Team member management
- Notifications with individual and bulk read actions
- Sprint planning and sprint detail views
- Reports and productivity analytics
- Alert configuration screens and workspace/profile settings
- REST API integration using cookie credentials

## Technology

- Frontend: React 19, React Router, Vite 8, Tailwind CSS 4, Recharts, Lucide React
- Backend: Node.js, Express 5, JSON Web Tokens, bcryptjs, cookie-parser, CORS, dotenv
- Data: In-memory controller data; restarting the backend resets runtime changes

## Run Locally

Install dependencies in both applications:

```bash
cd Frontend
npm install
cd ../Backend
npm install
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

Open `http://localhost:5173`. The frontend calls the API at `http://localhost:5000/api` and sends cookies with requests.

## Verification

```bash
cd Frontend
npm run lint
npm run build
```

The frontend scripts call Vite and ESLint through Node directly. This avoids Windows command-shim problems caused by the ampersand in the repository path.

## Application Routes

- `/login` - Public login and registration screen
- `/` - Protected dashboard
- `/projects` and `/projects/:id` - Projects and project details
- `/tasks` - Task management
- `/team` - Team management
- `/settings` - Profile, notification, and workspace settings
- `/sprints` and `/sprints/:id` - Sprint views
- `/reports` - Reports and analytics
- `/alerts` - Alert management

## Backend API Groups

- `/api/health` - Health check
- `/api/auth` - Register, login, current user, and logout
- `/api/users` - User CRUD
- `/api/projects` - Project CRUD
- `/api/tasks` - Task CRUD, filtering, and status updates
- `/api/activity` - Recent activity
- `/api/notifications` - Authenticated notification reads

## Configuration

The backend loads environment variables with `dotenv`. Set `PORT` to change the API port and `JWT_SECRET` to provide the signing secret. Without these values, the backend uses port `5000` and a development fallback secret.

The current CORS configuration allows the frontend origin `http://localhost:5173` with credentials enabled.

## Current Limitations

- Application data is held in memory and is not persisted to a database.
- Sprint and alert data are currently managed in frontend state and local data modules.
- The API base URL is currently hard-coded to `http://localhost:5000/api` in the frontend.
- No automated test suite is currently configured.
