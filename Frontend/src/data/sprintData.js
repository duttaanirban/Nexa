export const SPRINTS = [
  {
    id: "SPR-12",
    name: "Sprint 12",
    startDate: "2026-09-01",
    endDate: "2026-09-14",
    status: "Active",
    goal: "Complete checkout improvements and stabilize notifications.",
    tasks: [
      { id: "T-101", title: "Checkout UI improvements", status: "done" },
      { id: "T-102", title: "Payment API integration", status: "done" },
      { id: "T-103", title: "Order confirmation flow", status: "done" },
      { id: "T-104", title: "Notification preferences", status: "done" },
      { id: "T-105", title: "Realtime notification service", status: "done" },
      { id: "T-106", title: "Notification retry handling", status: "done" },
      { id: "T-107", title: "Mobile checkout testing", status: "done" },
      { id: "T-108", title: "Payment error states", status: "done" },
      { id: "T-109", title: "Checkout analytics events", status: "done" },
      { id: "T-110", title: "Notification performance testing", status: "done" },
      { id: "T-111", title: "Cross-browser testing", status: "done" },
      { id: "T-112", title: "Release documentation", status: "done" },
      { id: "T-113", title: "Accessibility review", status: "in-progress" },
      { id: "T-114", title: "API integration tests", status: "in-progress" },
      { id: "T-115", title: "Production monitoring setup", status: "in-progress" },
      { id: "T-116", title: "UI regression testing", status: "todo" },
      { id: "T-117", title: "Performance optimization", status: "todo" },
      { id: "T-118", title: "Final QA review", status: "todo" },
    ],
  },
  {
    id: "SPR-11",
    name: "Sprint 11",
    startDate: "2026-08-18",
    endDate: "2026-08-31",
    status: "Completed",
    goal: "Deliver realtime notification infrastructure.",
    tasks: [
      { id: "T-91", title: "Notification service", status: "done" },
      { id: "T-92", title: "WebSocket integration", status: "done" },
      { id: "T-93", title: "Notification UI", status: "done" },
      { id: "T-94", title: "Notification API", status: "done" },
      { id: "T-95", title: "Read/unread handling", status: "done" },
      { id: "T-96", title: "Notification testing", status: "done" },
      { id: "T-97", title: "Error handling", status: "done" },
      { id: "T-98", title: "Performance testing", status: "done" },
      { id: "T-99", title: "Documentation", status: "done" },
      { id: "T-100", title: "Final QA", status: "done" },
      { id: "T-1011", title: "Deployment preparation", status: "done" },
      { id: "T-1012", title: "Monitoring", status: "done" },
      { id: "T-1013", title: "Browser compatibility", status: "done" },
      { id: "T-1014", title: "Accessibility fixes", status: "done" },
      { id: "T-1015", title: "Security review", status: "done" },
      { id: "T-1016", title: "Code cleanup", status: "done" },
      { id: "T-1017", title: "Release notes", status: "done" },
      { id: "T-1018", title: "Team handoff", status: "done" },
      { id: "T-1019", title: "Post-release monitoring", status: "done" },
      { id: "T-1020", title: "Sprint retrospective", status: "done" },
      { id: "T-1021", title: "Backlog refinement", status: "done" },
    ],
  },
  {
    id: "SPR-10",
    name: "Sprint 10",
    startDate: "2026-08-04",
    endDate: "2026-08-17",
    status: "Completed",
    goal: "Establish the new design system foundation.",
    tasks: [
      { id: "T-81", title: "Design token architecture", status: "done" },
      { id: "T-82", title: "Color system", status: "done" },
      { id: "T-83", title: "Typography system", status: "done" },
      { id: "T-84", title: "Spacing tokens", status: "done" },
      { id: "T-85", title: "Component guidelines", status: "done" },
      { id: "T-86", title: "Button components", status: "done" },
      { id: "T-87", title: "Form components", status: "done" },
      { id: "T-88", title: "Documentation", status: "done" },
      { id: "T-89", title: "Design review", status: "done" },
      { id: "T-90", title: "Implementation review", status: "done" },
      { id: "T-901", title: "Developer handoff", status: "done" },
      { id: "T-902", title: "Accessibility audit", status: "done" },
      { id: "T-903", title: "Component testing", status: "done" },
      { id: "T-904", title: "Visual regression tests", status: "done" },
      { id: "T-905", title: "Final cleanup", status: "done" },
      { id: "T-906", title: "Release preparation", status: "done" },
    ],
  },
];

export const VELOCITY_CHART_DATA = [
  { day: "S8", opened: 14, closed: 11 },
  { day: "S9", opened: 18, closed: 15 },
  { day: "S10", opened: 16, closed: 14 },
  { day: "S11", opened: 21, closed: 19 },
  { day: "S12", opened: 18, closed: 12 },
];

export function getSprintStats(sprint) {
  const tasks = sprint?.tasks ?? [];

  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "done").length;
  const inProgress = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;
  const remaining = total - completed;

  return {
    total,
    completed,
    inProgress,
    remaining,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
  };
}