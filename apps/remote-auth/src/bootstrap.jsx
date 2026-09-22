// Standalone dev entry point — lets this remote run and be previewed on its
// own (`npm run start -w remote-auth`) without the Host Shell. Renders the
// real Login page full-screen, exactly as the Host Shell sees it when
// federating "auth/Login", plus a preview of the AuthStatus widget below.
import React from "react";
import { createRoot } from "react-dom/client";
import "@nimbus/shared-ui/src/tokens.css";
import Login from "./Login.jsx";
import AuthStatus from "./AuthStatus.jsx";

createRoot(document.getElementById("root")).render(
  <div>
    <Login onAuthenticated={() => window.location.reload()} />
    <div style={{ padding: "0 32px 32px" }}>
      <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--ink-faint)", marginBottom: 10 }}>
        remote-auth :5001 — standalone preview. Above: the federated &lt;Login /&gt; page. Below: the
        &lt;AuthStatus /&gt; widget the Host Shell federates into its topbar.
      </p>
      <div style={{ background: "var(--sidebar-bg)", padding: 14, borderRadius: 12, display: "inline-flex" }}>
        <AuthStatus />
      </div>
    </div>
  </div>
);
