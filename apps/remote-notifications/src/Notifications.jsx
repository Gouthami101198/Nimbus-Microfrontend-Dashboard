import { useEffect, useMemo, useState } from "react";
import { Icon, StatCard } from "@nimbus/shared-ui";
import { INITIAL_NOTIFS } from "./data.js";

const SEV_ICON = { crit: "alert", warn: "shield", info: "clock", good: "check" };
const FILTERS = [
  { key: "all", label: "All" },
  { key: "crit", label: "Critical" },
  { key: "warn", label: "Warning" },
  { key: "info", label: "Info" },
];

// The unread count is only known inside this remote (this is *its* state,
// no one else owns it). To let the Host Shell's sidebar badge and topbar
// bell reflect it without a shared store or prop-drilling across a
// federation boundary, this component broadcasts a plain window
// CustomEvent whenever the count changes. Any host — this one, a future
// one, a test harness — can listen for "nimbus:unread-count" without
// knowing anything about how this remote is built.
export default function Notifications() {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [filter, setFilter] = useState("all");

  const unreadCount = useMemo(() => notifs.filter((n) => n.unread).length, [notifs]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("nimbus:unread-count", { detail: { count: unreadCount } }));
  }, [unreadCount]);

  const rows = useMemo(() => notifs.filter((n) => filter === "all" || n.sev === filter), [notifs, filter]);
  const critCount = notifs.filter((n) => n.sev === "crit").length;
  const warnCount = notifs.filter((n) => n.sev === "warn").length;

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <section>
      <div className="page-head">
        <div className="title-row">
          <h1>Notifications</h1>
          <span className="env-chip">
            <span className="d" />
            MFE REMOTE: NOTIFICATIONS (:5005)
          </span>
        </div>
        <p>Alerts raised by any federated module, delivered through the shared window event bus.</p>
      </div>

      <div className="actions">
        <button className="btn" onClick={markAllRead}>
          <Icon.check width={14} height={14} />
          Mark all as read
        </button>
      </div>

      <div className="stat-grid">
        <StatCard label="Unread" icon={<Icon.shield width={16} height={16} />} iconClass="accent" value={<span className="num">{unreadCount}</span>} foot="Since your last visit" />
        <StatCard
          label="Critical"
          icon={<Icon.alert width={16} height={16} />}
          iconStyle={{ background: "var(--danger-soft)", color: "var(--danger)" }}
          value={<span className="num">{critCount}</span>}
          foot="Requires action"
        />
        <StatCard label="Warnings" icon={<Icon.shield width={16} height={16} />} iconClass="warn" value={<span className="num">{warnCount}</span>} foot="Auto-resolve if unchanged" />
        <StatCard label="Delivery Latency" icon={<Icon.clock width={16} height={16} />} iconClass="info" value={<span className="num">312</span>} unit="ms" foot="PubSub → toast render" />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-icon">
            <Icon.shield width={17} height={17} />
          </div>
          <div>
            <h2>Alert Stream</h2>
            <p>Newest first, grouped by severity</p>
          </div>
          <span className="pill">
            <span className="d" />
            LIVE
          </span>
        </div>
        <div className="filter-row" style={{ paddingBottom: 14 }}>
          <div className="chip-row">
            {FILTERS.map((f) => (
              <button key={f.key} className={`chip${filter === f.key ? " active" : ""}`} onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="notif-list">
          {rows.map((n) => {
            const IconCmp = Icon[SEV_ICON[n.sev]];
            return (
              <div className={`notif-row${n.unread ? " unread" : ""}`} key={n.id}>
                <div className={`notif-icon ${n.sev}`}>
                  <IconCmp width={14} height={14} />
                </div>
                <div className="notif-body">
                  <div className="line">
                    <b>{n.who}</b> {n.verb}
                  </div>
                  <div className="time">{n.time}</div>
                </div>
                {n.unread && <div className="unread-dot" />}
              </div>
            );
          })}
          {rows.length === 0 && (
            <div style={{ padding: "24px 12px", color: "var(--ink-faint)", fontSize: 13.5 }}>
              No notifications in this category.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
