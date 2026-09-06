# Backend Database Integration

This folder contains the PostgreSQL connection module and the SQL schema used by the Nexa backend.

- `database.js` creates and exports the shared PostgreSQL connection pool.
- `schema.sql` creates the application tables and indexes.
- `README.md` documents setup, configuration, relationships, runtime behavior, and troubleshooting.

## Architecture

The backend uses PostgreSQL through the [`pg`](https://node-postgres.com/) package.
Controllers and services import the shared pool:

```js
const { pool } = require("../config/database");
```

The application does not create a new database connection for every request. `pg.Pool` maintains reusable connections and queues work when all connections are busy.

At startup, `src/server.js` calls `testDatabaseConnection()`. That function obtains a pooled client and executes `SELECT 1`. The HTTP server starts only after this check succeeds. If PostgreSQL is unavailable, the backend logs the connection error and exits instead of accepting requests that cannot be fulfilled.

## Requirements

- Node.js 22 or newer
- npm
- PostgreSQL 14 or newer recommended
- A PostgreSQL database created for this application
- The backend dependencies installed with `npm install`

From the `Backend` directory:

```powershell
npm install
```

## Environment Configuration

Create `Backend/.env` and provide a PostgreSQL connection string:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/nexa
NODE_ENV=development
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
```

### `DATABASE_URL`

The value follows this format:

```text
postgresql://<username>:<password>@<host>:<port>/<database>
```

Example for a local PostgreSQL installation:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nexa
```

For hosted PostgreSQL providers, copy the provider's connection string. If the password contains reserved URL characters such as `@`, `:`, `/`, or `#`, URL-encode those characters.

`database.js` reads only `DATABASE_URL` for connection settings. It does not currently read separate `DB_HOST`, `DB_PORT`, `DB_USER`, or `DB_PASSWORD` variables.

### `NODE_ENV` and TLS

The connection pool uses the following SSL behavior:

- `development` and other non-production environments: SSL is disabled.
- `production`: SSL is enabled with `rejectUnauthorized: false`.

The production setting supports hosted providers that require TLS but do not expose a local CA certificate. For stricter certificate verification, update `database.js` to provide the provider's CA certificate and set `rejectUnauthorized: true`.

Never commit `.env` files or database credentials. Use the platform's secret manager or environment configuration in deployed environments.

## Create the Database

Create an empty PostgreSQL database before applying the schema.

Using `psql`:

```powershell
createdb -U postgres nexa
```

Or from a PostgreSQL prompt:

```sql
CREATE DATABASE nexa;
```

Connect to the database:

```powershell
psql -U postgres -d nexa
```

## Apply the Schema

From the `Backend` directory, apply the checked-in schema:

```powershell
psql "$env:DATABASE_URL" -f .\src\config\schema.sql
```

If PowerShell or `psql` does not expand the connection string as expected, use the explicit connection details:

```powershell
psql -U postgres -d nexa -f .\src\config\schema.sql
```

The schema uses `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`, so rerunning it is safe for objects that already exist. It is an initialization script, not a complete migration system: changing an existing table requires an explicit `ALTER TABLE` migration and a backup strategy.

Verify the created tables:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected application tables:

```text
project_members
projects
 tasks
users
```

The output may also include PostgreSQL-managed or provider-managed tables.

## Start the Backend

After creating the database, applying the schema, and configuring `.env`:

```powershell
npm run dev
```

For a normal process:

```powershell
npm start
```

A successful startup logs messages similar to:

```text
PostgreSQL connected successfully
Server running on http://localhost:5000
```

The health endpoint can then be checked without authentication:

```powershell
Invoke-WebRequest http://localhost:5000/api/health
```

## Connection Pool Behavior

`database.js` exports:

```js
const { pool, testDatabaseConnection } = require("./config/database");
```

### Shared queries

Use `pool.query(text, values)` for a single query or a group of independent queries:

```js
const result = await pool.query(
  "SELECT id, name FROM users WHERE email = $1",
  [email]
);
```

Always use parameter placeholders such as `$1`, `$2`, and pass values separately. This prevents SQL injection and lets PostgreSQL parse values correctly.

### Dedicated clients and transactions

Use `pool.connect()` when multiple statements must succeed or fail together:

```js
const client = await pool.connect();

try {
  await client.query("BEGIN");
  await client.query("...");
  await client.query("...");
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
}
```

The project and task controllers use this pattern for writes that also update related records. Always release a client in `finally`; failing to release it can exhaust the pool and make later requests hang.

## Database Model

### `users`

Stores application users and team members.

| Column | Type | Rules | Purpose |
| --- | --- | --- | --- |
| `id` | `VARCHAR(20)` | Primary key | Application user ID, such as `USR-001` |
| `name` | `VARCHAR(100)` | Required | Display name |
| `role` | `VARCHAR(100)` | Required | User role |
| `initials` | `VARCHAR(10)` | Required | Short identifier returned to the frontend |
| `email` | `VARCHAR(255)` | Required, unique | Login and contact email |
| `password_hash` | `TEXT` | Optional | bcrypt hash for authenticated accounts |
| `department` | `VARCHAR(100)` | Defaults to empty string | Department or team |
| `phone` | `VARCHAR(30)` | Defaults to empty string | Phone number |
| `bio` | `TEXT` | Defaults to empty string | Profile biography |
| `created_at` | `TIMESTAMPTZ` | Required, defaults to `NOW()` | Creation timestamp |

Passwords must never be stored in plaintext. The authentication controller hashes registration passwords with `bcryptjs` and excludes `password_hash` from user responses.

### `projects`

Stores project records.

| Column | Type | Rules | Purpose |
| --- | --- | --- | --- |
| `id` | `VARCHAR(20)` | Primary key | Application project ID, such as `PRJ-01` |
| `name` | `VARCHAR(150)` | Required | Project name |
| `description` | `TEXT` | Required | Project description |
| `progress` | `INTEGER` | Defaults to `0`, must be `0` to `100` | Completion percentage |
| `status` | `VARCHAR(30)` | Defaults to `On track` | Current project status |
| `created_at` | `TIMESTAMPTZ` | Required, defaults to `NOW()` | Creation timestamp |

### `project_members`

Joins users to projects in a many-to-many relationship.

| Column | Type | Rules | Purpose |
| --- | --- | --- | --- |
| `project_id` | `VARCHAR(20)` | Foreign key to `projects.id` | Project membership target |
| `user_id` | `VARCHAR(20)` | Foreign key to `users.id` | Member user |
| `(project_id, user_id)` | Composite key | Primary key | Prevents duplicate membership rows |

Both foreign keys use `ON DELETE CASCADE`. Deleting a project removes its membership rows, and deleting a user removes that user's membership rows.

### `tasks`

Stores tasks assigned to users and associated with projects.

| Column | Type | Rules | Purpose |
| --- | --- | --- | --- |
| `id` | `VARCHAR(20)` | Primary key | Application task ID, such as `T-1` |
| `title` | `VARCHAR(255)` | Required | Task title |
| `project_id` | `VARCHAR(20)` | Required, foreign key | Related project |
| `assignee_id` | `VARCHAR(20)` | Required, foreign key | Assigned user |
| `due` | `VARCHAR(50)` | Required | Due-date display value used by the current API |
| `priority` | `VARCHAR(20)` | Required, `High`, `Medium`, or `Low` | Task priority |
| `status` | `VARCHAR(30)` | Required, enum check | `todo`, `in-progress`, `review`, `blocked`, or `done` |
| `created_at` | `TIMESTAMPTZ` | Required, defaults to `NOW()` | Creation timestamp |
| `completed_at` | `TIMESTAMPTZ` | Optional | Set when a task is completed |

Task-to-project deletion uses `ON DELETE CASCADE`. Task-to-assignee deletion uses `ON DELETE RESTRICT`, preventing deletion of a user who still owns tasks.

Indexes currently exist on `project_id`, `assignee_id`, and `status` to support common task lookups and filters.

## Relationships

```text
users 1 ───────< tasks >─────── 1 projects
  │                              │
  └──────< project_members >─────┘
```

Referential rules:

- A project can have many tasks.
- A user can be assigned many tasks.
- A project can have many members.
- A user can belong to many projects.
- Deleting a project deletes its tasks and membership rows.
- Deleting a user removes membership rows but is blocked while tasks remain assigned to that user.

## API-to-Database Mapping

The REST API keeps the frontend payload simple and human-readable, while PostgreSQL stores normalized relationships.

### Reading tasks

Task queries join `tasks` to `projects` and `users` so the response can return:

- `project`: project name instead of `project_id`
- `assignee`: user initials instead of `assignee_id`
- `createdAt`: `created_at`
- `completedAt`: `completed_at` when present

### Creating or updating tasks

The task controller:

1. Resolves the supplied project name to `projects.id`.
2. Resolves the supplied assignee initials to `users.id`.
3. Validates priority and status values.
4. Writes the normalized foreign keys to `tasks`.
5. Sets or clears `completed_at` based on whether the status is `done`.

Project writes similarly resolve team members and update `project_members` inside a transaction.

## Current Compatibility Note

The current `taskController.js` selects and writes a `tasks.assignee_initials` column as a fallback for legacy task data, but the checked-in `schema.sql` currently creates `tasks` without that column. On a fresh database, task queries or writes can therefore fail with an error similar to:

```text
column t.assignee_initials does not exist
```

Before using task endpoints against a fresh database, align the schema and controller. The compatibility column can be added with:

```sql
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assignee_initials VARCHAR(10);
```

Then rerun the task endpoint checks. A future migration should decide whether this legacy column remains necessary or is removed after all task rows rely on `assignee_id`.

## Verification Queries

Run these queries after initialization:

```sql
-- Confirm the connection and server version.
SELECT current_database(), current_user, version();

-- Confirm the tables exist.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'projects', 'project_members', 'tasks')
ORDER BY table_name;

-- Confirm task foreign keys and indexes.
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name = 'tasks';

SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'tasks'
ORDER BY indexname;

-- Confirm the compatibility column used by the current task controller.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tasks'
  AND column_name = 'assignee_initials';
```

Functional smoke test:

1. Start PostgreSQL.
2. Apply `schema.sql` and the compatibility `ALTER TABLE` if needed.
3. Start the backend.
4. Register or create a user.
5. Create a project.
6. Add the user to the project team.
7. Create a task using the project name and user initials.
8. Fetch the task and confirm that the response contains the project name and assignee initials.
9. Move the task to `done` and confirm `completedAt` is returned.
10. Delete the project and confirm its tasks and membership rows are removed.

## Troubleshooting

### `ECONNREFUSED` or connection timeout

- Confirm PostgreSQL is running.
- Confirm the host and port in `DATABASE_URL`.
- Confirm the database name exists.
- Confirm the PostgreSQL server accepts connections from the backend host.
- Check firewall or hosted-provider network rules.

### `password authentication failed`

- Verify the username and password.
- URL-encode special characters in the password.
- Try connecting with the same credentials using `psql`.

### `database "nexa" does not exist`

Create the database first, then apply `schema.sql`:

```powershell
createdb -U postgres nexa
psql "$env:DATABASE_URL" -f .\src\config\schema.sql
```

### `relation does not exist`

The schema has not been applied to the database referenced by `DATABASE_URL`, or the backend is connected to a different database than expected. Check:

```sql
SELECT current_database(), current_user;
```

Then apply the schema to that exact database.

### `column ... does not exist`

The database schema and application code are out of sync. Compare `schema.sql` with the query named in the error. For the known task compatibility issue, apply the `assignee_initials` `ALTER TABLE` shown above.

### SSL or certificate errors in production

Confirm that the provider requires SSL and that the connection string is correct. The current production configuration enables SSL but disables certificate verification. For environments with a trusted CA, configure certificate verification in `database.js` rather than weakening TLS validation.

### Pool exhaustion or requests hanging

Look for code that calls `pool.connect()` without `client.release()` in a `finally` block. Transactions must always end with `COMMIT` or `ROLLBACK`, and dedicated clients must always be released.

## Operational Guidance

- Use parameterized SQL for every user-controlled value.
- Keep schema changes in versioned migration files once the application is shared or deployed.
- Back up production data before changing tables or constraints.
- Do not use `DROP TABLE` as a deployment strategy.
- Keep database credentials out of source control and logs.
- Use a strong `JWT_SECRET` in every non-local environment.
- Monitor connection count and query latency in hosted PostgreSQL.
- Consider a connection pool size and statement timeouts appropriate for the deployment platform as traffic grows.
- Persist activity and notification data separately before relying on them for audit or long-term history; those areas are currently in memory according to the backend README.
