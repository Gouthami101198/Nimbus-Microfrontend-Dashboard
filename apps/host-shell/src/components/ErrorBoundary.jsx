import React from "react";
import { Icon } from "@nimbus/shared-ui";

// A real React error boundary — not a simulation of one. It catches any
// throw (or federated-module load failure) beneath it in the tree and
// renders a localized recovery panel instead of taking the whole app down.
// This is what backs the "Fault Isolation: React Boundaries" claim on the
// Mesh page: only the remote inside this boundary goes dark; the sidebar,
// topbar and every other remote keep running.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // In a real deployment this is where you'd forward to your error
    // tracker, tagged with which remote failed.
    console.error(`[${this.props.remoteLabel}] crashed:`, error, info);
  }

  render() {
    if (this.state.error) {
      if (this.props.compact) {
        return (
          <div className="who-chip" title={this.state.error.message}>
            <div className="avatar" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
              !
            </div>
            <span style={{ fontSize: 12, color: "var(--danger)" }}>{this.props.remoteLabel} unreachable</span>
            {this.props.onRetry && (
              <button
                className="icon-btn"
                style={{ width: 26, height: 26, marginLeft: 4 }}
                title={`Retry ${this.props.remoteLabel}`}
                onClick={this.props.onRetry}
              >
                <Icon.refresh width={12} height={12} />
              </button>
            )}
          </div>
        );
      }
      return (
        <div className="panel" style={{ padding: 28, textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--danger-soft)",
              color: "var(--danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <Icon.alert width={20} height={20} />
          </div>
          <h2 style={{ fontSize: 16, marginBottom: 6 }}>{this.props.remoteLabel} is unreachable</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 13.5, maxWidth: 420, margin: "0 auto 18px" }}>
            {this.state.error.message || "The remote failed to load."} This React Error Boundary caught it before it
            could take down the rest of the shell — the sidebar, topbar and other modules are still fully
            operational.
          </p>
          {this.props.onRetry && (
            <button className="btn primary" onClick={this.props.onRetry}>
              <Icon.refresh width={14} height={14} />
              Retry {this.props.remoteLabel}
            </button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
