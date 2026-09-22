import { useMemo, useState } from "react";
import { Icon, StatCard } from "@nimbus/shared-ui";
import { USERS } from "./data.js";

const ROLE_FILTERS = ["all", "Admin", "Engineer", "Analyst"];
const STATUS_LABEL = { on: ["on", "Online"], off: ["off", "Offline"], pending: ["pending", "Pending"] };
const INVITE_NAMES = ["Jamie Cole", "Taylor Brooks", "Morgan Lee", "Devon Park", "Riley Chen"];
const INVITE_COLORS = ["#4A5FF0", "#2FBF8F", "#F0B04E", "#B98BE0", "#5B8CFF", "#D14343"];

export default function Users() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState(USERS);
  const [totalUsers, setTotalUsers] = useState(26300);
  const [activeNow, setActiveNow] = useState(1842);
  const [pendingCount, setPendingCount] = useState(7);
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState("");

  const rows = useMemo(() => {
    return users.filter((u) => filter === "all" || u.role === filter).filter((u) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [users, filter, query]);

  function syncDirectory() {
    setSyncing(true);
    setSyncNote("");
    setTimeout(() => {
      let changed = 0;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.status === "off" && Math.random() < 0.5) {
            changed++;
            return { ...u, status: "on", last: "Active now" };
          }
          return u;
        })
      );
      setActiveNow((n) => n + changed);
      setSyncing(false);
      setSyncNote(changed > 0 ? `Synced — ${changed} member${changed === 1 ? "" : "s"} came online` : "Synced — no changes");
      setTimeout(() => setSyncNote(""), 3000);
    }, 700);
  }

  function inviteUser() {
    const name = INVITE_NAMES[Math.floor(Math.random() * INVITE_NAMES.length)];
    const email = `${name.toLowerCase().replace(" ", ".")}.${Date.now().toString(36).slice(-4)}@nimbus.io`;
    const initials = name.split(" ").map((w) => w[0]).join("");
    const color = INVITE_COLORS[Math.floor(Math.random() * INVITE_COLORS.length)];
    setUsers((prev) => [
      { name, email, role: "Engineer", access: "Dashboard", status: "pending", last: "Invited just now", initials, color },
      ...prev,
    ]);
    setTotalUsers((n) => n + 1);
    setPendingCount((n) => n + 1);
  }

  return (
    <section>
      <div className="page-head">
        <div className="title-row">
          <h1>User Management</h1>
          <span className="env-chip">
            <span className="d" />
            MFE REMOTE: USERS (:5003)
          </span>
        </div>
        <p>Identity and access across every federated module, synced from the shared auth singleton.</p>
      </div>

      <div className="actions">
        <button className="btn" onClick={syncDirectory} disabled={syncing}>
          <Icon.refresh width={14} height={14} style={syncing ? { animation: "auth-spin-anim 0.7s linear infinite" } : undefined} />
          {syncing ? "Syncing…" : "Sync directory"}
        </button>
        <button className="btn primary" onClick={inviteUser}>
          <Icon.plus width={14} height={14} />
          Invite user
        </button>
        {syncNote && (
          <span style={{ display: "inline-flex", alignItems: "center", fontSize: 12.5, color: "var(--good)", fontWeight: 600 }}>
            <Icon.check width={13} height={13} style={{ marginRight: 5 }} />
            {syncNote}
          </span>
        )}
      </div>

      <div className="stat-grid">
        <StatCard label="Total Users" icon={<Icon.user width={16} height={16} />} iconClass="accent" value={<span className="num">{totalUsers.toLocaleString()}</span>} delta={{ dir: "up", text: "8.6%" }} foot="Across 5 federated remotes" />
        <StatCard label="Active Now" icon={<Icon.check width={16} height={16} />} iconClass="good" value={<span className="num">{activeNow.toLocaleString()}</span>} foot="Live session heartbeat" />
        <StatCard label="Pending Invites" icon={<Icon.shield width={16} height={16} />} iconClass="warn" value={<span className="num">{pendingCount}</span>} foot="Awaiting SSO handshake" />
        <StatCard label="Admins" icon={<Icon.clock width={16} height={16} />} iconClass="info" value={<span className="num">6</span>} foot="RBAC role: Shell Admin" />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-icon">
            <Icon.user width={17} height={17} />
          </div>
          <div>
            <h2>Team Directory</h2>
            <p>Roles are resolved once by the Host Shell and shared across every remote</p>
          </div>
          <span className="pill">
            <span className="d" />
            LIVE
          </span>
        </div>

        <div className="filter-row">
          <div className="filter-search">
            <Icon.search width={13} height={13} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              style={{ border: "none", background: "transparent", outline: "none", font: "inherit", color: "inherit", width: "100%" }}
            />
          </div>
          <div className="chip-row">
            {ROLE_FILTERS.map((r) => (
              <button key={r} className={`chip${filter === r ? " active" : ""}`} onClick={() => setFilter(r)}>
                {r === "all" ? "All roles" : r}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Module Access</th>
                <th>Status</th>
                <th>Last Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const [flagClass, flagLabel] = STATUS_LABEL[u.status];
                return (
                  <tr key={u.email}>
                    <td>
                      <div className="u-person">
                        <div className="u-avatar" style={{ background: u.color }}>
                          {u.initials}
                        </div>
                        <div className="name-col">
                          <b>{u.name}</b>
                          <span>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-chip">{u.role}</span>
                    </td>
                    <td style={{ color: "var(--ink-soft)" }}>{u.access}</td>
                    <td>
                      <span className={`status-flag ${flagClass}`}>
                        <span className="d" />
                        {flagLabel}
                      </span>
                    </td>
                    <td style={{ color: "var(--ink-soft)" }}>{u.last}</td>
                    <td className="row-menu">⋯</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div style={{ padding: "24px 12px", color: "var(--ink-faint)", fontSize: 13.5 }}>
              No users match this search.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
