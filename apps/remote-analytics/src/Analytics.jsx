import { useState } from "react";
import { Icon, StatCard } from "@nimbus/shared-ui";
import TrafficChart from "./TrafficChart.jsx";
import { TRAFFIC_DATA, LOAD_TIME_BARS } from "./data.js";

export default function Analytics() {
  const [traffic, setTraffic] = useState(TRAFFIC_DATA);
  const [loadBars, setLoadBars] = useState(LOAD_TIME_BARS);
  const [requests, setRequests] = useState(1.82);
  const [refreshing, setRefreshing] = useState(false);
  const [exported, setExported] = useState(false);

  function refreshTelemetry() {
    setRefreshing(true);
    setTimeout(() => {
      setTraffic((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.round(Math.max(400, Math.min(1500, last + (Math.random() * 160 - 60))));
        return [...prev.slice(1), next];
      });
      setLoadBars((prev) =>
        prev.map((b) => {
          const ms = Math.max(90, b.ms + Math.round(Math.random() * 40 - 20));
          return { ...b, ms, width: Math.min(330, Math.max(60, Math.round(ms * 1.18))) };
        })
      );
      setRequests((n) => Math.round((n + (Math.random() * 0.08 - 0.02)) * 100) / 100);
      setRefreshing(false);
    }, 700);
  }

  function exportCSV() {
    const lines = ["metric,value"];
    loadBars.forEach((b) => lines.push(`${b.label} avg load time (ms),${b.ms}`));
    traffic.forEach((v, i) => lines.push(`traffic requests/min at minute ${i},${v}`));
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nimbus-analytics-export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  }

  return (
    <section>
      <div className="page-head">
        <div className="title-row">
          <h1>Analytics</h1>
          <span className="env-chip">
            <span className="d" />
            MFE REMOTE: ANALYTICS (:5004)
          </span>
        </div>
        <p>Traffic and performance telemetry streamed from every federated remote via the shared event bus.</p>
      </div>

      <div className="actions">
        <button className="btn" onClick={refreshTelemetry} disabled={refreshing}>
          <Icon.refresh width={14} height={14} style={refreshing ? { animation: "auth-spin-anim 0.7s linear infinite" } : undefined} />
          {refreshing ? "Refreshing…" : "Refresh telemetry"}
        </button>
        <button className="btn" onClick={exportCSV}>
          {exported ? <Icon.check width={14} height={14} /> : <Icon.download width={14} height={14} />}
          {exported ? "Downloaded" : "Export CSV"}
        </button>
      </div>

      <div className="stat-grid">
        <StatCard label="Requests (24h)" icon={<Icon.spark width={16} height={16} />} iconClass="accent" value={<span className="num">{requests}M</span>} delta={{ dir: "up", text: "9.8%" }} foot="Across all remotes" />
        <StatCard label="P95 Latency" icon={<Icon.clock width={16} height={16} />} iconClass="info" value={<span className="num">184</span>} unit="ms" foot="Host Shell → remote round trip" />
        <StatCard label="Error Rate" icon={<Icon.shield width={16} height={16} />} iconClass="warn" value={<span className="num">0.34</span>} unit="%" delta={{ dir: "down", text: "0.08%" }} foot="Caught by React boundaries" />
        <StatCard label="Active Remotes" icon={<Icon.check width={16} height={16} />} iconClass="good" value="5 / 5" foot="All reporting telemetry" />
      </div>

      <div className="chart-grid">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-icon">
              <Icon.bolt width={17} height={17} />
            </div>
            <div>
              <h2>Platform Traffic</h2>
              <p>Requests per minute, last 24 hours</p>
            </div>
          </div>
          <TrafficChart data={traffic} />
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-icon">
              <Icon.clock width={17} height={17} />
            </div>
            <div>
              <h2>Avg Load Time by Remote</h2>
              <p>Time to interactive, per module</p>
            </div>
          </div>
          <div className="chart-pad">
            <svg
              className="chart-svg"
              viewBox="0 0 340 210"
              role="img"
              aria-label={`Bar chart of average load time by remote module: ${loadBars.map((b) => `${b.label} ${b.ms}ms`).join(", ")}`}
            >
              {loadBars.map((b, i) => {
                const y = 22 + i * 42;
                const labelInside = b.width > 240;
                return (
                  <g key={b.label}>
                    <text x="0" y={y - 6} className="bar-label" fill="var(--ink)">
                      {b.label}
                    </text>
                    <rect x="0" y={y} width={b.width} height="16" rx="3" fill={b.color} />
                    <text
                      x={labelInside ? b.width - 8 : b.width + 8}
                      y={y + 12}
                      textAnchor={labelInside ? "end" : "start"}
                      className="bar-label"
                      fill={labelInside ? "#fff" : "var(--ink-soft)"}
                    >
                      {b.ms}ms
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
