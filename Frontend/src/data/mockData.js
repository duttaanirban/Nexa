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
