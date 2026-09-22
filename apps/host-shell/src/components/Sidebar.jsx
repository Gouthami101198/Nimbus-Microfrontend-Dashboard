import { Icon, getSession, onSessionChange } from "@nimbus/shared-ui";
import { useEffect, useState } from "react";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "grid" },
  { key: "users", label: "User Management", icon: "user", badge: "LIVE" },
  { key: "analytics", label: "Analytics", icon: "bolt" },
  { key: "notifications", label: "Notifications", icon: "shield", dot: true },
  { key: "mesh", label: "Mesh Topology", icon: "mesh" },
];

export default function Sidebar({ page, onNavigate, unreadCount }) {
  // The sidebar footer mirrors whoever remote-auth says is signed in —
  // it doesn't own that state, it just also listens for it.
  const [session, setSession] = useState(() => getSession());
  useEffect(() => onSessionChange(setSession), []);
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="brand">
        <div className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M6.5 17.5a4.5 4.5 0 0 1-.5-8.97A5.5 5.5 0 0 1 16.3 7.06 4.75 4.75 0 0 1 17.5 17.5h-11Z"
              stroke="#fff"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="brand-text">
          <b>Nimbus</b>
          <span>MFE Platform</span>
        </div>
      </div>

      <div>
        <div className="nav-label">Federated Modules</div>
        <div className="nav" role="tablist">
          {NAV.map((item) => {
            const IconCmp = Icon[item.icon];
            const active = page === item.key;
            return (
              <button
                key={item.key}
                className={`nav-item${active ? " active" : ""}`}
                role="tab"
                aria-selected={active}
                onClick={() => onNavigate(item.key)}
              >
                <IconCmp width={17} height={17} />
                {item.label}
                {item.badge && <span className="badge">{item.badge}</span>}
                {item.dot && unreadCount > 0 && <span className="dot" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sidebar-foot">
        <div className="avatar">{session?.initials || "?"}</div>
        <div className="who">
          <b>{session?.name || "Signed out"}</b>
          <span>{session?.role || ""}</span>
        </div>
      </div>
    </nav>
  );
}
