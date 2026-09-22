import { lazy, Suspense, useEffect, useState } from "react";
import { getSession, onSessionChange } from "@nimbus/shared-ui";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import RemoteBoundary from "./components/RemoteBoundary.jsx";
import Mesh from "./pages/Mesh.jsx";

// Each of these is fetched at runtime from the remote's own dev server —
// there is no build-time dependency between host-shell and these apps.
// Comment out any remote's line in webpack.config.js's `remotes` map (or
// just stop its dev server) and only *that* page goes dark.
const Dashboard = lazy(() => import("dashboard/Dashboard"));
const Users = lazy(() => import("users/Users"));
const Analytics = lazy(() => import("analytics/Analytics"));
const Notifications = lazy(() => import("notifications/Notifications"));
// The Host Shell has zero login UI of its own — the entire authentication
// surface is fetched from remote-auth (:5001), same as any other page. This
// is page-level federation; AuthStatus below is widget-level federation
// from that same remote.
const Login = lazy(() => import("auth/Login"));

function AuthGateFallback() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ alignItems: "center", textAlign: "center", gap: 10 }}>
        <p style={{ color: "var(--ink-faint)", fontSize: 13.5 }}>Loading remote-auth (:5001)…</p>
      </div>
    </div>
  );
}

const REMOTE_LABELS = {
  dashboard: "Dashboard (:5002)",
  users: "Users (:5003)",
  analytics: "Analytics (:5004)",
  notifications: "Notifications (:5005)",
  auth: "Auth (:5001)",
};

export default function App() {
  const [session, setSession] = useState(() => getSession());
  const [page, setPage] = useState("dashboard");
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("nimbus-theme") || null;
    } catch {
      return null;
    }
  });

  // Outaged remotes + a per-remote "generation" counter used to force a
  // clean remount (and therefore a fresh ErrorBoundary) on retry.
  const [outages, setOutages] = useState(() => new Set());
  const [gen, setGen] = useState({ dashboard: 0, users: 0, analytics: 0, notifications: 0, auth: 0 });

  useEffect(() => onSessionChange(setSession), []);

  useEffect(() => {
    // remote-notifications owns its own unread state and broadcasts it here
    // via a plain window CustomEvent — no shared store, no prop drilling
    // across the federation boundary. This is only wired up while the
    // Notifications page (or a standalone preview of it) has actually
    // mounted at least once; that's realistic — the shell shows the last
    // count it heard.
    function handleUnread(ev) {
      setUnreadCount(ev.detail.count);
    }
    window.addEventListener("nimbus:unread-count", handleUnread);
    return () => window.removeEventListener("nimbus:unread-count", handleUnread);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
    try {
      localStorage.setItem("nimbus-theme", theme || "");
    } catch {
      /* ignore */
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => {
      if (current === "dark") return "light";
      if (current === "light") return null;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "light" : "dark";
    });
  }

  function handleNavigate(key) {
    setPage(key);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function toggleOutage(key) {
    setOutages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function retryRemote(key) {
    setOutages((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setGen((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  }

  const pages = {
    dashboard: (
      <RemoteBoundary
        remoteKey="dashboard"
        remoteLabel={REMOTE_LABELS.dashboard}
        outaged={outages.has("dashboard")}
        resetToken={gen.dashboard}
        onRetry={() => retryRemote("dashboard")}
      >
        <Dashboard />
      </RemoteBoundary>
    ),
    users: (
      <RemoteBoundary
        remoteKey="users"
        remoteLabel={REMOTE_LABELS.users}
        outaged={outages.has("users")}
        resetToken={gen.users}
        onRetry={() => retryRemote("users")}
      >
        <Users />
      </RemoteBoundary>
    ),
    analytics: (
      <RemoteBoundary
        remoteKey="analytics"
        remoteLabel={REMOTE_LABELS.analytics}
        outaged={outages.has("analytics")}
        resetToken={gen.analytics}
        onRetry={() => retryRemote("analytics")}
      >
        <Analytics />
      </RemoteBoundary>
    ),
    notifications: (
      <RemoteBoundary
        remoteKey="notifications"
        remoteLabel={REMOTE_LABELS.notifications}
        outaged={outages.has("notifications")}
        resetToken={gen.notifications}
        onRetry={() => retryRemote("notifications")}
      >
        <Notifications />
      </RemoteBoundary>
    ),
    mesh: <Mesh outages={outages} onToggleOutage={toggleOutage} />,
  };

  // No session → the entire app is the federated Login page from
  // remote-auth, full-screen, no sidebar/topbar. This isn't a client route
  // guard bolted on top of a real backend; it's exactly as real as the rest
  // of this scaffold's "auth" — see the README's honest-limitations section.
  if (!session) {
    return (
      <Suspense fallback={<AuthGateFallback />}>
        <RemoteBoundary remoteKey="auth-login" remoteLabel="Auth (:5001)" outaged={outages.has("auth")} resetToken={gen.auth} onRetry={() => retryRemote("auth")}>
          <Login onAuthenticated={() => setSession(getSession())} />
        </RemoteBoundary>
      </Suspense>
    );
  }

  return (
    <div className="shell">
      <Sidebar page={page} onNavigate={handleNavigate} unreadCount={unreadCount} />
      <div className="main">
        <Topbar
          onToggleTheme={toggleTheme}
          unreadCount={unreadCount}
          authOutaged={outages.has("auth")}
          authResetToken={gen.auth}
          onRetryAuth={() => retryRemote("auth")}
          onNavigate={handleNavigate}
        />
        <main className="content">{pages[page]}</main>
      </div>
    </div>
  );
}
