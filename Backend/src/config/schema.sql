CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    initials VARCHAR(10) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT,
    department VARCHAR(100) DEFAULT '',
    phone VARCHAR(30) DEFAULT '',
    bio TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0
        CHECK (progress >= 0 AND progress <= 100),
    status VARCHAR(30) NOT NULL DEFAULT 'On track',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
    project_id VARCHAR(20) NOT NULL,
    user_id VARCHAR(20) NOT NULL,

    PRIMARY KEY (project_id, user_id),

    CONSTRAINT fk_project_members_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_project_members_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,

    project_id VARCHAR(20) NOT NULL,
    assignee_id VARCHAR(20) NOT NULL,

    due VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_tasks_assignee
        FOREIGN KEY (assignee_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_task_priority
        CHECK (priority IN ('High', 'Medium', 'Low')),

    CONSTRAINT chk_task_status
        CHECK (
            status IN (
                'todo',
                'in-progress',
                'review',
                'blocked',
                'done'
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id
    ON tasks(project_id);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id
    ON tasks(assignee_id);

CREATE INDEX IF NOT EXISTS idx_tasks_status
    ON tasks(status);