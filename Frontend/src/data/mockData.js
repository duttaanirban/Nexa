import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Users,
  Settings,
  GitBranch,
  BarChart3,
  Puzzle,
  Zap,
} from "lucide-react";

/**
 * Mock data for the Developer Productivity Dashboard.
 *
 * This file contains presentation-independent data only.
 * UI components should consume this data without knowing
 * whether it comes from mock data or a future API.
 *
 * Task 2/3:
 * These exports can later be replaced with REST API responses
 * without requiring major changes to the UI components.
 */

/* ---------------------------------------------------------------
   NAVIGATION
--------------------------------------------------------------- */

export const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    end: true,
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderKanban,
    href: "/projects",
    badge: 4,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: ListChecks,
    href: "/tasks",
    badge: 5,
  },
  {
    id: "team",
    label: "Team",
    icon: Users,
    href: "/team",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

/* ---------------------------------------------------------------
   QUICK ACTIONS
--------------------------------------------------------------- */

export const QUICK_ACTIONS = [
  {
    id: "backlog",
    label: "Backlog",
    icon: ListChecks,
    section: "shortcut",
  },
  {
    id: "sprints",
    label: "Sprints",
    icon: GitBranch,
    section: "shortcut",
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    section: "shortcut",
  },
  {
    id: "plugins",
    label: "Plugins",
    icon: Puzzle,
    section: "shortcut",
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: Zap,
  },
];

/* ---------------------------------------------------------------
   CURRENT USER
--------------------------------------------------------------- */

export const CURRENT_USER = {
  id: "USR-001",
  name: "Dummy User",
  role: "Frontend Lead",
  initials: "DU",
  email: "dummyuser@example.com",
};



/* ---------------------------------------------------------------
   TOP-LEVEL DASHBOARD STATS
--------------------------------------------------------------- */

export const STATS = [
  {
    id: "active-projects",
    label: "Active projects",
    value: "07",
    delta: "+2 this month",
    trend: "up",
  },
  {
    id: "completed",
    label: "Tasks completed",
    value: "148",
    delta: "+23 this week",
    trend: "up",
  },
  {
    id: "in-progress",
    label: "In progress",
    value: "19",
    delta: "6 due soon",
    trend: "neutral",
  },
  {
    id: "overdue",
    label: "Overdue",
    value: "03",
    delta: "needs attention",
    trend: "down",
  },
];

/* ---------------------------------------------------------------
   PROJECTS
--------------------------------------------------------------- */

export const PROJECTS = [
  {
    id: "PRJ-01",
    name: "Checkout Revamp",
    description:
      "Rebuild the payment flow with saved cards and one-tap retry.",
    progress: 72,
    status: "On track",
    variant: "success",
    team: ["AK", "RS", "MN"],
  },
  {
    id: "PRJ-02",
    name: "Realtime Notifications",
    description:
      "WebSocket service for in-app and push notification delivery.",
    progress: 41,
    status: "In progress",
    variant: "warning",
    team: ["JT", "PL"],
  },
  {
    id: "PRJ-03",
    name: "Design Tokens",
    description:
      "Shared token library consumed by web, mobile, and documentation.",
    progress: 18,
    status: "Blocked",
    variant: "danger",
    team: ["SD"],
  },
];

/* ---------------------------------------------------------------
   TASK STATUS
--------------------------------------------------------------- */

export const TASK_STATUS = {
  todo: {
    label: "To do",
    variant: "neutral",
  },
  "in-progress": {
    label: "In progress",
    variant: "warning",
  },
  review: {
    label: "In review",
    variant: "info",
  },
  blocked: {
    label: "Blocked",
    variant: "danger",
  },
  done: {
    label: "Done",
    variant: "success",
  },
};

/* ---------------------------------------------------------------
   TASK FILTERS
--------------------------------------------------------------- */

export const TASK_FILTERS = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "todo",
    label: "To do",
  },
  {
    value: "in-progress",
    label: "In progress",
  },
  {
    value: "review",
    label: "In review",
  },
  {
    value: "blocked",
    label: "Blocked",
  },
  {
    value: "done",
    label: "Done",
  },
];

/* ---------------------------------------------------------------
   TASKS
--------------------------------------------------------------- */

export const TASKS = [
  {
    id: "T-421",
    title: "Add retry logic to card charge endpoint",
    project: "Checkout Revamp",
    assignee: "AK",
    due: "Today",
    priority: "High",
    status: "in-progress",
  },
  {
    id: "T-418",
    title: "Write integration tests for webhook handler",
    project: "Realtime Notifications",
    assignee: "JT",
    due: "Tomorrow",
    priority: "Medium",
    status: "todo",
  },
  {
    id: "T-402",
    title: "Migrate color tokens to OKLCH",
    project: "Design Tokens",
    assignee: "SD",
    due: "Overdue",
    priority: "High",
    status: "blocked",
  },
  {
    id: "T-397",
    title: "QA pass on saved-card UI",
    project: "Checkout Revamp",
    assignee: "RS",
    due: "Fri",
    priority: "Low",
    status: "review",
  },
  {
    id: "T-390",
    title: "Set up push notification certificates",
    project: "Realtime Notifications",
    assignee: "PL",
    due: "Mon",
    priority: "Medium",
    status: "done",
  },
];

/* ---------------------------------------------------------------
   TASK PRIORITIES
--------------------------------------------------------------- */

export const TASK_PRIORITIES = {
  High: {
    variant: "danger",
  },
  Medium: {
    variant: "warning",
  },
  Low: {
    variant: "neutral",
  },
};

/* ---------------------------------------------------------------
   RECENT ACTIVITY
--------------------------------------------------------------- */

export const RECENT_ACTIVITY = [
  {
    id: "ACT-001",
    type: "task-completed",
    title: "Completed task",
    description: "QA pass on saved-card UI",
    project: "Checkout Revamp",
    user: "RS",
    time: "12 min ago",
  },
  {
    id: "ACT-002",
    type: "project-updated",
    title: "Updated project",
    description: "Realtime Notifications",
    project: "Realtime Notifications",
    user: "JT",
    time: "34 min ago",
  },
  {
    id: "ACT-003",
    type: "task-created",
    title: "Created new task",
    description: "Write integration tests for webhook handler",
    project: "Realtime Notifications",
    user: "JT",
    time: "1 hr ago",
  },
  {
    id: "ACT-004",
    type: "task-blocked",
    title: "Task blocked",
    description: "Migrate color tokens to OKLCH",
    project: "Design Tokens",
    user: "SD",
    time: "2 hrs ago",
  },
  {
    id: "ACT-005",
    type: "project-progress",
    title: "Project progress updated",
    description: "Checkout Revamp reached 72%",
    project: "Checkout Revamp",
    user: "AK",
    time: "3 hrs ago",
  },
];

/* ---------------------------------------------------------------
   PRODUCTIVITY / VELOCITY DATA
--------------------------------------------------------------- */

export const VELOCITY_SPARKLINE = [
  12,
  18,
  14,
  22,
  19,
  26,
  24,
  30,
  27,
  34,
  31,
  38,
];

export const VELOCITY_CHART_DATA = [
  {
    day: "02 Sun",
    opened: 18,
    closed: 12,
  },
  {
    day: "03 Mon",
    opened: 22,
    closed: 16,
  },
  {
    day: "04 Tue",
    opened: 16,
    closed: 24,
  },
  {
    day: "05 Wed",
    opened: 24,
    closed: 20,
  },
  {
    day: "06 Thu",
    opened: 20,
    closed: 28,
  },
  {
    day: "07 Fri",
    opened: 26,
    closed: 19,
  },
  {
    day: "08 Sat",
    opened: 19,
    closed: 30,
  },
  {
    day: "09 Sun",
    opened: 23,
    closed: 25,
  },
  {
    day: "10 Mon",
    opened: 21,
    closed: 22,
  },
  {
    day: "11 Tue",
    opened: 27,
    closed: 33,
  },
];

export const TEAM_MEMBERS = [
  {
    id: "USR-001",
    name: "Mira Kapoor",
    role: "Frontend Lead",
    initials: "MK",
    workload: 80,
    email: "mira.kapoor@example.com",
  },
  {
    id: "USR-002",
    name: "Arjun Khanna",
    role: "Backend Engineer",
    initials: "AK",
    workload: 70,
    email: "arjun.khanna@example.com",
  },
  {
    id: "USR-003",
    name: "Riya Sen",
    role: "QA Engineer",
    initials: "RS",
    workload: 60,
    email: "riya.sen@example.com",
  },
  {
    id: "USR-004",
    name: "Jay Thomas",
    role: "DevOps Engineer",
    initials: "JT",
    workload: 50,
    email: "jay.thomas@example.com",
  },
  {
    id: "USR-005",
    name: "Priya Lal",
    role: "Product Manager",
    initials: "PL",
    workload: 40,
    email: "priya.lal@example.com",
  },
];