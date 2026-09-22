import { useState } from "react";
import { Icon, setSession } from "@nimbus/shared-ui";
import { DIRECTORY } from "./data.js";

// The actual authentication surface, federated whole from remote-auth
// (:5001) into the Host Shell — the shell renders this when it finds no
// session, and never sees the email/password form itself. On success this
// writes the session (see session.js) and broadcasts it; the Host Shell is
// just listening for that, same as it listens for the notifications
// unread-count broadcast.
export default function Login({ onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | pending | error
  const [error, setError] = useState("");

  function fillDemo(entry) {
    setEmail(entry.email);
    setPassword(entry.password);
    setStatus("idle");
    setError("");
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!email.trim() || !password) {
      setStatus("error");
      setError("Enter both an email and a password.");
      return;
    }
    setStatus("pending");
    setError("");

    // Simulated network round trip to remote-auth's own session service.
    setTimeout(() => {
      const match = DIRECTORY.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );
      if (!match) {
        setStatus("error");
        setError("That email and password don't match a Nimbus account.");
        return;
      }
      setStatus("idle");
      setSession({
        name: match.name,
        initials: match.initials,
        role: match.role,
        email: match.email,
        verified: true,
        remember,
        signedInAt: new Date().toISOString(),
      });
      onAuthenticated?.();
    }, 650);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
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

        <h1 className="auth-title">Sign in to your workspace</h1>
        <p className="auth-sub">
          This form is served entirely from <code>remote-auth (:5001)</code> — an independently
          deployed micro-frontend, not part of the Host Shell's own bundle.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-field">
            <span className="auth-label">Work email</span>
            <span className="auth-input-wrap">
              <Icon.mail width={15} height={15} />
              <input
                type="email"
                autoComplete="username"
                placeholder="you@nimbus.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "pending"}
              />
            </span>
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <span className="auth-input-wrap">
              <Icon.lock width={15} height={15} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status === "pending"}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <Icon.eyeOff width={15} height={15} /> : <Icon.eye width={15} height={15} />}
              </button>
            </span>
          </label>

          <div className="auth-row">
            <label className="auth-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Keep me signed in
            </label>
            <a href="#" className="auth-link" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
          </div>

          {status === "error" && (
            <div className="auth-error">
              <Icon.alert width={14} height={14} />
              {error}
            </div>
          )}

          <button type="submit" className="btn primary auth-submit" disabled={status === "pending"}>
            {status === "pending" ? (
              <>
                <span className="auth-spin">
                  <Icon.spinner width={14} height={14} />
                </span>
                Verifying…
              </>
            ) : (
              <>
                <Icon.shield width={14} height={14} />
                Sign in
              </>
            )}
          </button>
        </form>

        <div className="auth-demo">
          <div className="auth-demo-head">
            <Icon.spark width={13} height={13} />
            Demo accounts — click to fill
          </div>
          <div className="auth-demo-list">
            {DIRECTORY.map((u) => (
              <button type="button" key={u.email} className="auth-demo-chip" onClick={() => fillDemo(u)}>
                <span className="auth-demo-avatar">{u.initials}</span>
                <span className="auth-demo-info">
                  <b>{u.name}</b>
                  <span>{u.email}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="auth-demo-note">Password for every demo account is <code>nimbus123</code>.</p>
        </div>
      </div>

      <p className="auth-foot">
        Session stored locally and broadcast via <code>window</code> events — the Host Shell, the
        topbar's <code>AuthStatus</code> widget, and this form share nothing but that contract.
      </p>
    </div>
  );
}
