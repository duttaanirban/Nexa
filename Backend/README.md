# Nexa Workspace Backend

Express REST API for the Nexa developer productivity and project management platform.

## Overview

- Runtime: Node.js with Express 5
- Authentication: JSON Web Token stored in an HTTP-only cookie
- Data store: In-memory arrays and service state
- Default URL: `http://localhost:5000`
- API prefix: `http://localhost:5000/api`
- Request format: JSON
- CORS: `http://localhost:5173` with credentials enabled

Data is reset whenever the server restarts. This backend is intended for local development and demonstration until a persistent database is connected.

## Requirements

- Node.js 22 or newer
- npm

## Setup and Run

```bash
npm install
npm run dev
```

The development server uses Nodemon. To run without file watching:

```bash
npm start
```

The server listens on `PORT` when provided, or port `5000` by default.

### Environment Variables

Create a `.env` file in `Backend/` when overriding the defaults:

```env
PORT=5000
JWT_SECRET=replace-with-a-development-secret
NODE_ENV=development
```

`JWT_SECRET` defaults to a development fallback when it is not set. Use a strong secret outside local development.

## API Base URL

```text
http://localhost:5000/api
```

## Request and Response Conventions

Successful responses use a common envelope:

```json
{
  "success": true,
  "data": {},
  "message": "Optional operation message"
}
```

Collection responses may also include `count`. Notifications include `unreadCount`.

Failed requests generally return:

```json
{
  "success": false,
  "message": "Reason for the failure"
}
```

Common status codes are `200` for successful reads/updates/deletes, `201` for creation, `400` for invalid input, `401` for missing or invalid authentication, `404` for missing resources, and `409` for duplicate registration email addresses.

## API Reference

All paths below are relative to `/api`.

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Returns `{ success: true, message: "API is running" }`. |

### Authentication

Authentication endpoints use the `pulse_token` cookie. The cookie is HTTP-only, lasts seven days, and is sent by the frontend through `credentials: "include"`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Creates an account and sets the authentication cookie. |
| `POST` | `/auth/login` | No | Verifies credentials and sets the authentication cookie. |
| `GET` | `/auth/me` | Yes | Returns the currently authenticated user without the password. |
| `POST` | `/auth/logout` | No | Clears the authentication cookie. |

Register request:

```json
{
  "name": "Sam Lee",
  "email": "sam.lee@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

Registration requires all four fields, a password of at least eight characters, matching passwords, and a unique email address. Emails are trimmed and normalized to lowercase. New accounts receive the `Developer` role.

Login request:

```json
{
  "email": "sam.lee@example.com",
  "password": "Password123"
}
```

Passwords are hashed with `bcryptjs`; password values are excluded from successful user responses.

### Users

| Method | Path | Auth | Required request fields | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/users` | No | None | Lists users and returns `count`. |
| `GET` | `/users/:id` | No | None | Returns one user. |
| `POST` | `/users` | No | `name`, `role`, `initials`, `email` | Creates a team member. |
| `PUT` | `/users/:id` | No | `name`, `role`, `initials`, `email` | Replaces editable profile fields. Optional fields: `department`, `phone`, `bio`. |
| `DELETE` | `/users/:id` | No | None | Deletes a team member. |

User IDs are generated in the form `USR-001`.

### Projects

| Method | Path | Auth | Required request fields | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/projects` | No | None | Lists projects and returns `count`. |
| `GET` | `/projects/:id` | No | None | Returns one project. |
| `POST` | `/projects` | No | `name`, `description` | Creates a project. Optional fields: `progress`, `status`, `team`. |
| `PUT` | `/projects/:id` | No | `name`, `description` | Updates a project. Optional fields: `progress`, `status`, `team`. |
| `DELETE` | `/projects/:id` | No | None | Deletes a project. |

Project IDs are generated in the form `PRJ-01`. `team` is an array of member initials, and `progress` defaults to `0`.

### Tasks

| Method | Path | Auth | Required request fields | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/tasks` | No | None | Lists tasks, optionally filtered by query parameters. |
| `GET` | `/tasks/:id` | No | None | Returns one task. |
| `POST` | `/tasks` | No | `title`, `project`, `assignee`, `due`, `priority`, `status` | Creates a task. |
| `PUT` | `/tasks/:id` | No | `title`, `project`, `assignee`, `due`, `priority`, `status` | Updates all editable task fields. |
| `PATCH` | `/tasks/:id/status` | No | `status` | Updates only the task status. |
| `DELETE` | `/tasks/:id` | No | None | Deletes a task. |

Supported task status values are `todo`, `in-progress`, `review`, `blocked`, and `done`. Supported priorities are `High`, `Medium`, and `Low`.

Task list filters can be combined:

```text
GET /api/tasks?status=blocked&priority=High&project=Checkout%20Revamp
```

The `project` filter is case-insensitive. Moving a task to `done` adds `completedAt`; moving it to another status removes that field.

### Activity

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/activity` | No | Returns recent activity and `count`. |

Activity is generated when projects or tasks are created, updated, or deleted, and when a task status changes. The service keeps the latest 50 entries in memory.

### Notifications

All notification endpoints require a valid `pulse_token` cookie.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/notifications` | Yes | Lists notifications for the authenticated user, newest first, with `count` and `unreadCount`. |
| `PATCH` | `/notifications/:id/read` | Yes | Marks one notification as read if it belongs to the current user. |
| `PATCH` | `/notifications/read-all` | Yes | Marks all notifications for the current user as read. |

## Backend Workflows

### Authentication workflow

1. The client sends registration or login credentials as JSON.
2. The auth controller validates the request and checks the in-memory users array.
3. Registration hashes the password with bcrypt; login compares the supplied password with the stored hash.
4. The server signs a seven-day JWT containing the user ID and email.
5. The token is written to the HTTP-only `pulse_token` cookie.
6. Protected requests read and verify that cookie before the controller runs.
7. Logout clears the cookie.

### Project and task workflow

1. The client loads projects, tasks, users, activity, and the current user.
2. Create or update requests pass through required-field validation before reaching the controller.
3. Task create/update/status requests also validate status and priority values.
4. The controller mutates the in-memory collection and returns the changed resource.
5. Project and task mutations append an activity record with a timestamp.
6. The client refreshes the relevant list or detail view from the API.

### Notification workflow

1. The client requests `/notifications` with credentials included.
2. Authentication middleware verifies the JWT and sets `req.user`.
3. The controller returns only notifications whose `userId` matches `req.user.id`.
4. Read actions update the matching in-memory notification.
5. The client can refresh the list to receive the updated read and unread counts.

## Middleware and Error Handling

- `express.json()` parses JSON request bodies.
- `cookie-parser` exposes cookies through `req.cookies`.
- CORS allows the local frontend origin with credentials.
- `validateRequiredFields` returns `400` when configured body fields are missing or empty.
- `validateTaskStatus` and `validateTaskPriority` enforce task enum values.
- `protect` returns `401` when the cookie is missing, expired, or invalid.
- Unknown routes return the not-found response.
- The final error handler returns a JSON error envelope and logs the stack on the server.

## Source Layout

```text
src/
├── app.js                 # Express app, middleware, and route registration
├── server.js              # Environment loading and HTTP server startup
├── controllers/           # Request handlers and in-memory domain data
├── data/                  # Seeded notification data
├── middleware/            # Auth, validation, not-found, and error handling
├── routes/                # API route definitions
├── services/              # Shared activity service
└── utils/                 # Backend utility space
```

## Current Limitations

- Data is not persisted and resets on restart.
- Most user, project, and task endpoints are currently public; only `/auth/me` and notification routes use `protect`.
- Seeded users are demonstration records and are not all configured with a login password.
- The CORS origin is hard-coded to `http://localhost:5173`.
- There is no automated backend test script yet.
- The frontend currently uses a hard-coded API base URL.