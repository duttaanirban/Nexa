const notifications = [
  {
    id: "NOT-001",
    userId: "USR-004",
    type: "blocked",
    title: "Task overdue",
    description:
      '"Migrate color tokens to OKLCH" is blocked and past its due date.',
    read: false,
    createdAt: "2026-08-31T08:00:00.000Z",
  },
  {
    id: "NOT-002",
    userId: "USR-004",
    type: "update",
    title: "Project update",
    description:
      "Realtime Notifications moved to 41% complete.",
    read: false,
    createdAt: "2026-08-31T05:00:00.000Z",
  },
  {
    id: "NOT-003",
    userId: "USR-004",
    type: "success",
    title: "Task completed",
    description:
      'AK marked "QA pass on saved-card UI" as done.',
    read: true,
    createdAt: "2026-08-30T12:00:00.000Z",
  },
];

module.exports = {
  notifications,
};