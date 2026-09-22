import { useEffect, useState } from "react";
import { Icon, getSession, clearSession, onSessionChange } from "@nimbus/shared-ui";

// This is the whole point of the exercise: a *widget*, not a page, federated
// from an independently-deployed app into the Host Shell's chrome. It owns
// its own session (read from the shared localStorage contract in
// session.js) and renders itself — the shell only knows "there is an
// AuthStatus component at auth/AuthStatus", nothing about its internals.
export default function AuthStatus() {
  const [session, setSessionState] = useState(() => getSession());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => onSessionChange(setSessionState), []);

  if (!session) {
    return (
      <div className="who-chip" aria-busy="true">
        <div className="avatar" style={{ opacity: 0.4 }}>
          …
        </div>
        <span style={{ color: "var(--ink-faint)" }}>Not signed in</span>
      </div>
    );
  }

  return (
    <div className="who-menu">
      <button
        type="button"
        className="who-chip who-chip-btn"
        onClick={() => setMenuOpen((v) => !v)}
        title={`${session.role} · session verified by remote-auth :5001`}
      >
        <div className="avatar">{session.initials}</div>
        <span>{session.name}</span>
      </button>
      {menuOpen && (
        <div className="who-dropdown" role="menu">
          <div className="who-dropdown-head">
            <b>{session.name}</b>
            <span>{session.email}</span>
          </div>
          <button
            type="button"
            className="who-dropdown-item"
            onClick={() => {
              clearSession();
              setMenuOpen(false);
            }}
          >
            <Icon.logout width={14} height={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
