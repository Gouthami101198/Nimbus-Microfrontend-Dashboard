import { lazy } from "react";
import { Icon } from "@nimbus/shared-ui";
import RemoteBoundary from "./RemoteBoundary.jsx";

// Federated straight from remote-auth (:5001) — the shell has zero code for
// what "signed in" looks like, it just mounts whatever that remote exposes.
const AuthStatus = lazy(() => import("auth/AuthStatus"));

export default function Topbar({ onToggleTheme, unreadCount, authOutaged, authResetToken, onRetryAuth, onNavigate }) {
  return (
    <header className="topbar">
      <div className="search">
        <Icon.search width={14} height={14} />
        Search Nimbus modules…
        <kbd>⌘K</kbd>
      </div>
      <div className="status-pill">
        <span className="live-dot" />
        <span className="txt">Mesh Gateway</span> Live
      </div>
      <div className="top-icons">
        <button className="icon-btn" title="Toggle theme" aria-label="Toggle theme" onClick={onToggleTheme}>
          <Icon.moon width={16} height={16} />
        </button>
        <button className="icon-btn" title="Alerts" aria-label="Alerts" onClick={() => onNavigate("notifications")}>
          <Icon.shield width={16} height={16} />
          {unreadCount > 0 && <span className="ping">{unreadCount}</span>}
        </button>
        <RemoteBoundary
          remoteKey="auth"
          remoteLabel="Auth"
          outaged={authOutaged}
          resetToken={authResetToken}
          onRetry={onRetryAuth}
          compact
        >
          <AuthStatus />
        </RemoteBoundary>
      </div>
    </header>
  );
}
