# Nexa Workspace Backend

Express REST API for the Nexa developer productivity and project management platform.

## Requirements

- Node.js
- npm

## Setup and Run

```bash
npm install
npm run dev
```

The development server starts at `http://localhost:5000` by default.

```bash
npm start
```

`npm run dev` uses Nodemon to restart the server when source files change.

## Environment Variables

Create a `.env` file when needed:

```env
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
```

The server defaults to port `5000` and a development JWT fallback when values are not provided. CORS allows `http://localhost:5173` and credentials are enabled for the frontend.

## API Base URL

```text
http://localhost:5000/api
```

All responses use the following general shapes:

```json
{
  "success": true,
  "data": {}
}
```

Collection responses also include `count`; mutations include a `message`. Errors use `success: false` and a `message`.

## Endpoints

### Health

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Check that the API is running |

### Authentication

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account and set an HTTP-only JWT cookie |
| POST | `/api/auth/login` | Authenticate and set an HTTP-only JWT cookie |
| GET | `/api/auth/me` | Return the current authenticated user |
| POST | `/api/auth/logout` | Clear the authentication cookie |

Registration requires `name`, `email`, `password`, and `confirmPassword`. Passwords must contain at least eight characters and match.

### Users

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Get one user |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |

User create and update requests require `name`, `role`, `initials`, and `email`.

### Projects

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | Get one project |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |

Project create and update requests require `name` and `description`.

### Tasks

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| PATCH | `/api/tasks/:id/status` | Update only task status |
| DELETE | `/api/tasks/:id` | Delete a task |

Tasks can be filtered with query parameters:

```text
GET /api/tasks?status=blocked
GET /api/tasks?priority=High
GET /api/tasks?project=Checkout%20Revamp
GET /api/tasks?status=in-progress&priority=High
```

Task create and update requests require `title`, `project`, `assignee`, `due`, `priority`, and `status`.

Valid statuses are `todo`, `in-progress`, `review`, `blocked`, and `done`. Valid priorities are `High`, `Medium`, and `Low`.

### Activity

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/activity` | Return recent activity |

### Notifications

Notification routes require a valid authentication cookie.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/notifications` | List notifications for the authenticated user |
| PATCH | `/api/notifications/:id/read` | Mark one notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |

## Validation and Errors

Validation middleware returns `400 Bad Request` for missing fields or invalid task status/priority. Protected routes return `401 Unauthorized` when the authentication cookie is missing, invalid, or expired. Missing resources and unknown routes return `404`; unexpected failures are handled by centralized error middleware.

Example error:

```json
{
  "success": false,
  "message": "Task not found"
}
```

## Project Structure

```text
src/
├── controllers/     # Request handlers and in-memory data operations
├── data/            # Notification data
├── middleware/      # Auth, validation, not-found, and error handling
├── routes/          # Auth, user, project, task, activity, and notification routes
├── services/        # Activity service
├── app.js           # Express middleware and route registration
└── server.js        # Environment loading and HTTP server startup
```

## Current Limitations

- Data is stored in memory and resets when the process restarts.
- There is no database or migration layer yet.
- There is no automated backend test script configured.
- The authentication cookie is currently named `pulse_token` for compatibility with the existing implementation, although the product is branded Nexa.
