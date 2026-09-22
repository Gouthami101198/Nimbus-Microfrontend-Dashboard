import React from "react";
import { createRoot } from "react-dom/client";
import "@nimbus/shared-ui/src/tokens.css";
import Analytics from "./Analytics.jsx";

createRoot(document.getElementById("root")).render(
  <div className="content" style={{ padding: 26 }}>
    <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11.5, color: "var(--ink-faint)" }}>
      remote-analytics :5004 — standalone preview (no Host Shell chrome)
    </p>
    <Analytics />
  </div>
);
