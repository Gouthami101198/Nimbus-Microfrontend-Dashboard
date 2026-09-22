import { Icon, StatCard } from "@nimbus/shared-ui";
import { MESH_NODES } from "../data.js";

export default function Mesh({ outages, onToggleOutage }) {
  const healthyCount = MESH_NODES.length - outages.size;

  return (
    <section>
      <div className="page-head">
        <div className="title-row">
          <h1>Micro-Frontend Mesh &amp; Chaos Inspector</h1>
          <span
            className="env-chip"
            style={
              outages.size === 0
                ? { background: "var(--good-soft)", color: "var(--good)" }
                : { background: "var(--danger-soft)", color: "var(--danger)" }
            }
          >
            <span className="d" style={{ background: outages.size === 0 ? "var(--good)" : "var(--danger)" }} />
            {outages.size === 0 ? "MESH 100% OPERATIONAL" : `${outages.size} REMOTE${outages.size > 1 ? "S" : ""} DOWN`}
          </span>
        </div>
        <p>
          This is a real fault-isolation test, not a mockup: toggling a remote below throws inside that remote's own
          React Error Boundary. Navigate to its page (or look at the Auth chip in the topbar) to see the isolated
          recovery UI — the rest of the shell keeps running.
        </p>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <StatCard
          label="Mesh Resiliency"
          icon={<Icon.check width={16} height={16} />}
          iconClass={outages.size === 0 ? "good" : "warn"}
          value={
            <>
              {healthyCount} / {MESH_NODES.length} <span style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 600 }}>healthy</span>
            </>
          }
        />
        <StatCard label="Average Ping" icon={<Icon.clock width={16} height={16} />} iconClass="accent" value={<span className="num">19</span>} unit="ms" />
        <StatCard label="Federated Footprint" icon={<Icon.spark width={16} height={16} />} iconClass="info" value={<span className="num">236.2</span>} unit=" KB total" />
        <StatCard label="Fault Isolation" icon={<Icon.shield width={16} height={16} />} iconClass="warn" value={<span style={{ fontSize: 19 }}>React Boundaries</span>} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-icon">
            <Icon.mesh width={17} height={17} />
          </div>
          <div>
            <h2>Interactive Module Federation Interconnect Mesh</h2>
            <p>Toggle a remote to simulate an outage, then visit that page to see the recovery UI.</p>
          </div>
          <span className="pill">
            <span className="d" />
            EVENT BUS: LIVE BROADCAST
          </span>
        </div>

        <div className="node-chip-row">
          <span className="node-chip">
            <span className="d" style={{ background: "#FF7A3D" }} />
            Host Shell :5000
          </span>
          {MESH_NODES.map((n) => {
            const outaged = outages.has(n.key);
            return (
              <button
                key={n.key}
                className="node-chip"
                style={{
                  cursor: "pointer",
                  border: outaged ? "1px solid var(--danger)" : undefined,
                  color: outaged ? "var(--danger)" : undefined,
                }}
                onClick={() => onToggleOutage(n.key)}
                title={outaged ? `Restore ${n.label}` : `Simulate outage on ${n.label}`}
              >
                <span className="d" style={{ background: outaged ? "var(--danger)" : n.color }} />
                {n.label}
                {outaged && " — down"}
              </button>
            );
          })}
        </div>

        <div className="mesh-wrap">
          <svg
            className="mesh-svg"
            viewBox="0 0 720 380"
            role="img"
            aria-label="Diagram of the Host Shell connected to four federated remote modules, with outaged remotes shown in red"
          >
            <g fill="none" strokeWidth="1.6" strokeDasharray="5 5">
              {MESH_NODES.map((n) => (
                <path key={n.key} d={n.path} stroke={outages.has(n.key) ? "var(--danger)" : n.color} opacity="0.75" />
              ))}
            </g>

            {MESH_NODES.map((n) => {
              const outaged = outages.has(n.key);
              const color = outaged ? "var(--danger)" : n.color;
              return (
                <g key={n.key} style={{ cursor: "pointer" }} onClick={() => onToggleOutage(n.key)}>
                  <circle cx={n.cx} cy={n.cy} r="17" fill="var(--surface)" stroke={color} strokeWidth="2.4" />
                  <circle cx={n.cx} cy={n.cy} r="5.5" fill={color} />
                  <text x={n.cx} y={n.labelY} textAnchor="middle" className="node-title" fill="var(--ink)">
                    {n.label}
                  </text>
                  <text x={n.cx} y={n.subY} textAnchor="middle" className="node-sub" fill={outaged ? "var(--danger)" : "var(--ink-faint)"}>
                    {outaged ? "outage: simulated" : "latency: active"}
                  </text>
                </g>
              );
            })}

            <g>
              <circle cx="360" cy="190" r="40" fill="#FF7A3D" opacity="0.15" />
              <circle cx="360" cy="190" r="29" fill="#FF7A3D" />
              <text x="360" y="185" textAnchor="middle" fontFamily="Manrope,sans-serif" fontWeight="700" fontSize="10.5" fill="#fff">
                HOST SHELL
              </text>
              <text x="360" y="199" textAnchor="middle" className="node-label" fill="#fff" opacity="0.9">
                PORT :5000
              </text>
            </g>
          </svg>
        </div>
      </div>

      <div className="panel">
        <div className="why-copy">
          <b>Why micro-frontend resiliency matters.</b> In a traditional monolithic SPA, an unhandled exception in
          one auxiliary module crashes the entire screen into a blank white page. In <b>Nimbus</b>, each remote —{" "}
          <code>Auth</code>, <code>Dashboard</code>, <code>Users</code>, <code>Analytics</code>,{" "}
          <code>Notifications</code> — ships from its own independently-deployed app and is wrapped in an isolated
          React Error Boundary in the Host Shell. Click a node above, then open its page: only that viewport shows a
          localized recovery panel while the sidebar, topbar and every other micro-frontend keep operating
          uninterrupted.
        </div>
      </div>
    </section>
  );
}
