export const ALERT_TYPES = {
  overdue: {
    label: "Overdue tasks",
    description: "Get alerted when tasks pass their due date.",
  },
  workload: {
    label: "High workload",
    description: "Get alerted when a team member's workload exceeds a threshold.",
  },
  blocked: {
    label: "Blocked projects",
    description: "Get alerted when a project becomes blocked.",
  },
  sprint: {
    label: "Sprint deadline",
    description: "Get alerted when a sprint is approaching its deadline.",
  },
};

export const INITIAL_ALERTS = [
  {
    id: "ALT-001",
    type: "overdue",
    name: "Overdue task alert",
    description: "Notify me when a task becomes overdue.",
    enabled: true,
    threshold: 1,
    unit: "day",
  },
  {
    id: "ALT-002",
    type: "workload",
    name: "High workload alert",
    description: "Notify me when team workload exceeds 80%.",
    enabled: true,
    threshold: 80,
    unit: "%",
  },
  {
    id: "ALT-003",
    type: "blocked",
    name: "Blocked project alert",
    description: "Notify me when a project becomes blocked.",
    enabled: true,
    threshold: null,
    unit: null,
  },
  {
    id: "ALT-004",
    type: "sprint",
    name: "Sprint deadline alert",
    description: "Notify me when a sprint has 2 days remaining.",
    enabled: false,
    threshold: 2,
    unit: "days",
  },
];