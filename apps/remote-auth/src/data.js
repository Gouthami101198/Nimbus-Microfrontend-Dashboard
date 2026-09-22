// remote-auth owns identity. In a real org this checks a database or an
// SSO provider — this is the mock directory that stands in for it here.
export const DIRECTORY = [
  { email: "gouthami@nimbus.io", password: "nimbus123", name: "Gouthami C.", initials: "GC", role: "Workspace owner" },
  { email: "sarah.jenkins@nimbus.io", password: "nimbus123", name: "Sarah Jenkins", initials: "SJ", role: "Admin" },
  { email: "marcus.vance@nimbus.io", password: "nimbus123", name: "Marcus Vance", initials: "MV", role: "Analyst" },
];
