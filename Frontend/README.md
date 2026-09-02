# Nexa Workspace Frontend

React and Vite client for the Nexa developer productivity and project management platform.

## Features

- Responsive application layout with desktop and mobile sidebar navigation
- Nexa SVG logo in the sidebar and browser favicon
- Nexa Workspace browser title and product branding
- Public login and registration flow
- Protected application routes
- Dashboard statistics, date ranges, activity, projects, tasks, and team workload
- Project CRUD and project detail pages
- Task CRUD, status updates, search, and filtering
- Team member CRUD
- Notifications with read and read-all actions
- Sprint planning, reports, analytics, alerts, and settings views
- Loading skeletons, error states, delete confirmations, and toast feedback

## Tech Stack

- React 19
- React Router 7
- Vite 8
- Tailwind CSS 4
- Recharts
- `lucide-react`
- ESLint

## Requirements

- Node.js 22 or newer
- npm
- Backend running at `http://localhost:5000`

## Setup

```bash
npm install
npm run dev
```

Vite normally serves the application at `http://localhost:5173`.

## Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

The scripts invoke installed tools through Node directly. This is intentional for Windows because the repository path contains an ampersand (`&`).

## Routes

| Path | Access | Purpose |
| --- | --- | --- |
| `/login` | Public | Login and registration |
| `/` | Protected | Workspace dashboard |
| `/projects` | Protected | Project list and management |
| `/projects/:id` | Protected | Project details and tasks |
| `/tasks` | Protected | Task management and filters |
| `/team` | Protected | Team member management |
| `/settings` | Protected | Profile, notifications, and workspace settings |
| `/sprints` | Protected | Sprint planning |
| `/sprints/:id` | Protected | Sprint details |
| `/reports` | Protected | Reports and productivity analytics |
| `/alerts` | Protected | Alert management |

## Project Structure

```text
src/
├── api/             # REST API client
├── assets/          # Static frontend assets
├── components/
│   ├── auth/        # Protected route handling
│   ├── brand/       # NexaLogo SVG component
│   ├── dashboard/   # Dashboard sections and visualizations
│   ├── layouts/     # Sidebar, navbar, menus, and app layout
│   └── ui/          # Shared skeleton, error, toast, and modal UI
├── context/         # Authentication and current-user providers
├── data/            # Navigation and frontend-managed data
├── pages/           # Routed application screens
├── App.jsx          # Router and provider composition
├── App.css          # Application styles
├── index.css        # Global styles and Tailwind import
└── main.jsx         # React entry point
```

The browser document title is `Nexa Workspace`, and `public/favicon.svg` is the Nexa mark used by `index.html`.

## API Integration

The API client is in `src/api/api.js` and targets `http://localhost:5000/api`. Requests include `credentials: "include"` so the backend's HTTP-only authentication cookie is sent.

The dashboard, projects, tasks, team, reports, notifications, and current-user flows use backend API calls. Sprint and alert screens currently use frontend state/data modules.

## Limitations

- The API base URL is hard-coded for local development.
- No frontend automated test command is configured.
- Backend data is in memory and resets when the backend restarts.
