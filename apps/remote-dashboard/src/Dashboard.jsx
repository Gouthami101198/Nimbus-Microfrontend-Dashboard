import { useMemo, useState } from "react";
import { Icon, StatCard } from "@nimbus/shared-ui";
import { EVENTS, EVENT_TAG_META } from "./data.js";

const FILTERS = [
  { key: "all", label: "All events" },
  { key: "team", label: "Team" },
  { key: "system", label: "System" },
  { key: "analytics", label: "Analytics" },
  { key: "security", label: "Security" },
];

// The Host Shell imports this as `dashboard/Dashboard` at runtime — this file
// never ships in the shell's own bundle, it's fetched from :5002.
const DEMO_NAMES = ["Priya Nair", "Jordan Ruiz", "Casey Whitfield", "Noah Feldman", "Amara Osei"];

export default function Dashboard() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState(EVENTS);
  const [userCount, setUserCount] = useState(26300);
  const [refreshing, setRefreshing] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const rows = useMemo(() => {
    return events.filter((e) => filter === "all" || e.tag === filter).filter((e) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return e.who.toLowerCase().includes(q) || e.verb.toLowerCase().includes(q);
    });
  }, [events, filter, query]);

  function simulateNewUser() {
    const name = DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
    setEvents((prev) => [
      { who: "System Bot", verb: `provisioned a new workspace account for ${name}`, tag: "team", time: "just now" },
      ...prev,
    ]);
    setUserCount((n) => n + 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  }

  function refreshTelemetry() {
    setRefreshing(true);
    setEvents((prev) => [
      { who: "System Bot", verb: "refreshed telemetry snapshot across all federated remotes", tag: "system", time: "just now" },
      ...prev,
    ]);
    setTimeout(() => setRefreshing(false), 700);
  }

  return (
    <section>
      <div className="page-head">
        <div className="title-row">
          <h1>Executive Overview</h1>
          <span className="env-chip">
            <span className="d" />
            MFE REMOTE: DASHBOARD (:5002)
          </span>
        </div>
        <p>
          Welcome back, <b>Gouthami</b>. Real-time metrics aggregated across federated modules.
        </p>
      </div>

      <div className="actions">
        <button className="btn" onClick={refreshTelemetry} disabled={refreshing}>
          <Icon.refresh width={14} height={14} style={refreshing ? { animation: "auth-spin-anim 0.7s linear infinite" } : undefined} />
          {refreshing ? "Refreshing…" : "Refresh telemetry"}
        </button>
        <button className="btn primary" onClick={simulateNewUser}>
          <Icon.plus width={14} height={14} />
          Simulate new user
        </button>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Total Platform Revenue"
          icon={<Icon.bolt width={16} height={16} />}
          iconClass="accent"
          value={<>$<span className="num">434,250</span></>}
          delta={{ dir: "up", text: "14.2%" }}
          foot="vs. $380,200 last month"
        />
        <StatCard
          label="Active Platform Users"
          icon={<Icon.user width={16} height={16} />}
          iconClass="good"
          value={<span className="num">{userCount.toLocaleString()}</span>}
          delta={{ dir: "up", text: justAdded ? "+1 just now" : "8.6%" }}
          foot="Synchronized across remotes"
        />
        <StatCard
          label="Platform Uptime"
          icon={<Icon.shield width={16} height={16} />}
          iconClass="info"
          value={<span className="num">99.98</span>}
          unit="%"
          delta={{ dir: "up", text: "0.03%" }}
          foot="Operational across 5 regions"
        />
        <StatCard
          label="System Conversion Rate"
          icon={<Icon.trend width={16} height={16} />}
          iconClass="warn"
          value={<span className="num">4.18</span>}
          unit="%"
          delta={{ dir: "up", text: "1.1%" }}
          foot="Consistent across funnels"
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-icon">
            <Icon.bolt width={17} height={17} />
          </div>
          <div>
            <h2>Federated Audit &amp; Activity Stream</h2>
            <p>Live decoupled events received across independent micro-frontends</p>
          </div>
          <span className="pill">
            <span className="d" />
            LIVE PUBSUB ACTIVE
          </span>
        </div>

        <div className="filter-row">
          <div className="filter-search">
            <Icon.search width={13} height={13} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events or user names…"
              style={{ border: "none", background: "transparent", outline: "none", font: "inherit", color: "inherit", width: "100%" }}
            />
          </div>
          <div className="chip-row">
            {FILTERS.map((f) => (
              <button key={f.key} className={`chip${filter === f.key ? " active" : ""}`} onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="feed">
          {rows.map((e, i) => {
            const meta = EVENT_TAG_META[e.tag];
            const IconCmp = Icon[meta.icon];
            return (
              <div className="feed-row" key={i}>
                <div className="feed-dot" style={{ background: `var(--${meta.bg}-soft)`, color: `var(--${meta.bg})` }}>
                  <IconCmp width={13} height={13} />
                </div>
                <div className="feed-body">
                  <div className="line">
                    <b>{e.who}</b> {e.verb}
                  </div>
                  <div className="time">
                    <Icon.clock width={10} height={10} />
                    {e.time}
                  </div>
                </div>
                <span className={`tag ${e.tag}`}>{e.tag}</span>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div style={{ padding: "24px 12px", color: "var(--ink-faint)", fontSize: 13.5 }}>
              No events match this filter.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
