export const EVENTS = [
  { who: "Sarah Jenkins", verb: "promoted Liam Neeson to DevOps Lead", tag: "team", time: "12m ago" },
  { who: "System Bot", verb: "backed up micro-frontend state store", tag: "system", time: "45m ago" },
  { who: "Marcus Vance", verb: "exported Q3 Revenue & Traffic Report (CSV)", tag: "analytics", time: "2h ago" },
  { who: "Elena Rostova", verb: "updated notification alert preferences", tag: "settings", time: "4h ago" },
  { who: "David Chen", verb: "compiled and hot-reloaded Analytics Remote v2.4.0", tag: "system", time: "5h ago" },
  { who: "Sarah Jenkins", verb: "enforced Zero-Trust RBAC access policy on Shell Gateway", tag: "security", time: "7h ago" },
  { who: "System Bot", verb: "auto-scaled User Management MFE replica to 4 instances", tag: "system", time: "9h ago" },
  { who: "Marcus Vance", verb: "synchronized Cross-App PubSub Event Bus cache", tag: "analytics", time: "12h ago" },
  { who: "Elena Rostova", verb: "configured Prometheus latency alert on Port :5004", tag: "analytics", time: "14h ago" },
  { who: "System Bot", verb: "rotated mutual TLS certificates across federated domain mesh", tag: "security", time: "16h ago" },
  { who: "Sarah Jenkins", verb: "dispatched global PubSub schema v2.4 handshake payload", tag: "team", time: "18h ago" },
  { who: "Alex Mercer", verb: "registered GraphQL Federation query gateway endpoint", tag: "system", time: "1d ago" },
  { who: "System Bot", verb: "automated memory garbage collection on Host shell runtime", tag: "system", time: "1d ago" },
  { who: "Marcus Vance", verb: "validated SOC-2 Type II audit trail compliance log", tag: "security", time: "2d ago" },
];

export const EVENT_TAG_META = {
  analytics: { icon: "bolt", bg: "warn" },
  team: { icon: "user", bg: "accent" },
  security: { icon: "shield", bg: "danger" },
  settings: { icon: "mesh", bg: "good" },
  system: { icon: "refresh", bg: "info" },
};
