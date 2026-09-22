export const INITIAL_NOTIFS = [
  { id: 1, sev: "crit", who: "Auth (:5001)", verb: "token refresh queue backed up past threshold — 4,200 pending", time: "3m ago", unread: true },
  { id: 2, sev: "warn", who: "Analytics (:5004)", verb: "remote bundle grew 18% after last deploy (340ms load)", time: "38m ago", unread: true },
  { id: 3, sev: "info", who: "System Bot", verb: "scheduled maintenance window confirmed for Sat 02:00 UTC", time: "1h ago", unread: false },
  { id: 4, sev: "warn", who: "Notifications (:5005)", verb: "PubSub delivery latency crossed 300ms for 5 minutes", time: "3h ago", unread: false },
  { id: 5, sev: "good", who: "System Bot", verb: "all 5 remotes passed the nightly health check", time: "6h ago", unread: false },
  { id: 6, sev: "warn", who: "Users (:5003)", verb: "replica auto-scaled to 4 instances under load", time: "9h ago", unread: false },
  { id: 7, sev: "info", who: "Sarah Jenkins", verb: "updated the RBAC policy on Shell Gateway", time: "1d ago", unread: false },
];
