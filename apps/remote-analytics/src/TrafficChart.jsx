import { useMemo, useRef, useState } from "react";

const X0 = 36, X1 = 504, Y0 = 176, Y1 = 20;
const MAX = 1500, MIN = 0;

export default function TrafficChart({ data }) {
  const svgRef = useRef(null);
  const hostRef = useRef(null);
  const [hover, setHover] = useState(null); // { idx, vx, vy }

  const px = (i) => X0 + (X1 - X0) * (i / (data.length - 1));
  const py = (v) => Y0 - (Y0 - Y1) * ((v - MIN) / (MAX - MIN));

  const { linePath, areaPath, endX, endY } = useMemo(() => {
    const pts = data.map((v, i) => `${px(i)},${py(v)}`).join(" L ");
    const line = "M " + pts;
    const area = `M ${px(0)},${Y0} L ${pts} L ${px(data.length - 1)},${Y0} Z`;
    return { linePath: line, areaPath: area, endX: px(data.length - 1), endY: py(data[data.length - 1]) };
  }, [data]);

  function handleMove(ev) {
    const svgRect = svgRef.current.getBoundingClientRect();
    const hostRect = hostRef.current.getBoundingClientRect();
    const scale = svgRect.width / 520;
    const localX = (ev.clientX - svgRect.left) / scale;
    let idx = Math.round(((localX - X0) / (X1 - X0)) * (data.length - 1));
    idx = Math.max(0, Math.min(data.length - 1, idx));
    const vx = px(idx);
    const vy = py(data[idx]);
    setHover({
      idx,
      vx,
      vy,
      tipX: svgRect.left - hostRect.left + vx * scale,
      tipY: svgRect.top - hostRect.top + vy * scale,
    });
  }

  return (
    <div className="chart-host chart-pad" ref={hostRef}>
      <svg
        ref={svgRef}
        className="chart-svg"
        viewBox="0 0 520 220"
        role="img"
        aria-label={`Line chart of platform requests per minute over the last 24 hours, rising from ${data[0]} to a peak of ${Math.max(...data)}`}
      >
        <g>
          <line className="grid-line" x1="36" y1="20" x2="36" y2="176" />
          <line className="grid-line" x1="36" y1="176" x2="504" y2="176" />
          <line className="grid-line" x1="36" y1="98" x2="504" y2="98" strokeDasharray="3 4" />
          <line className="grid-line" x1="36" y1="20" x2="504" y2="20" strokeDasharray="3 4" />
        </g>
        <text x="30" y="24" textAnchor="end" className="axis-label">1.5k</text>
        <text x="30" y="102" textAnchor="end" className="axis-label">0.75k</text>
        <text x="30" y="180" textAnchor="end" className="axis-label">0</text>
        <text x="36" y="196" className="axis-label">00:00</text>
        <text x="504" y="196" textAnchor="end" className="axis-label">now</text>

        <defs>
          <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path fill="url(#trafficFill)" stroke="none" d={areaPath} />
        <path fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={linePath} />
        <circle r="4" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" cx={endX} cy={endY} />

        {hover && (
          <g>
            <line x1={hover.vx} y1="20" x2={hover.vx} y2="176" stroke="var(--ink-faint)" strokeWidth="1" strokeDasharray="2 3" />
            <circle r="4.5" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" cx={hover.vx} cy={hover.vy} />
          </g>
        )}

        <rect
          x="36"
          y="10"
          width="468"
          height="176"
          fill="transparent"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      {hover && (
        <div className="chart-tip" style={{ opacity: 1, left: Math.max(0, hover.tipX - 44), top: Math.max(0, hover.tipY - 46) }}>
          <b>{data[hover.idx].toLocaleString()} req/min</b>
          <span>{hover.idx}:00</span>
        </div>
      )}
    </div>
  );
}
