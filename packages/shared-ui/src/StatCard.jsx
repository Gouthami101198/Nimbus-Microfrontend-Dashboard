export default function StatCard({ label, icon, iconClass = "accent", value, unit, delta, foot, iconStyle }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="label">{label}</span>
        <div className={`stat-icon ${iconClass}`} style={iconStyle}>
          {icon}
        </div>
      </div>
      <div className="stat-value">
        {value}
        {unit && <span style={{ fontSize: 16, color: "var(--ink-soft)", fontWeight: 600 }}>{unit}</span>}
        {delta && <span className={`delta ${delta.dir}`}>{delta.dir === "up" ? "↑" : "↓"} {delta.text}</span>}
      </div>
      {foot && <div className="stat-foot">{foot}</div>}
    </div>
  );
}
