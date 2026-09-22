import { Suspense } from "react";
import ErrorBoundary from "./ErrorBoundary.jsx";

// Throws synchronously during render when this remote has been marked as
// "outaged" from the Mesh page — giving the ErrorBoundary above something
// real to catch, the same way an actual federated-module load failure or a
// runtime exception inside the remote would surface.
function OutageTrigger({ remoteLabel, outaged, children }) {
  if (outaged) {
    throw new Error(`Simulated outage: ${remoteLabel} stopped responding.`);
  }
  return children;
}

function RemoteFallback({ remoteLabel }) {
  return (
    <div className="panel" style={{ padding: 28, textAlign: "center", color: "var(--ink-faint)" }}>
      <p style={{ fontSize: 13.5 }}>Loading {remoteLabel}…</p>
    </div>
  );
}

/**
 * Wraps one federated remote with its own Suspense boundary (for the async
 * chunk load) and its own ErrorBoundary (for load failures or runtime
 * errors) — the combination that gives each micro-frontend true fault
 * isolation. `resetToken` changing forces a full remount, which is how a
 * crashed remote gets a clean retry.
 */
export default function RemoteBoundary({ remoteKey, remoteLabel, outaged, resetToken, onRetry, compact, children }) {
  return (
    <ErrorBoundary key={`${remoteKey}-${resetToken}`} remoteLabel={remoteLabel} onRetry={onRetry} compact={compact}>
      <Suspense fallback={compact ? null : <RemoteFallback remoteLabel={remoteLabel} />}>
        <OutageTrigger remoteLabel={remoteLabel} outaged={outaged}>
          {children}
        </OutageTrigger>
      </Suspense>
    </ErrorBoundary>
  );
}
