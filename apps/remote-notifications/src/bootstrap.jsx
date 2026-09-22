import React from "react";
import { createRoot } from "react-dom/client";
import "@nimbus/shared-ui/src/tokens.css";
import Notifications from "./Notifications.jsx";

createRoot(document.getElementById("root")).render(
  <div className="content" style={{ padding: 26 }}>
    <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11.5, color: "var(--ink-faint)" }}>
      remote-notifications :5005 — standalone preview. Open devtools console: this page dispatches
      window "nimbus:unread-count" events the Host Shell listens for.
    </p>
    <Notifications />
  </div>
);
