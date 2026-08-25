AI-Powered Project & Task Management Platform

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
