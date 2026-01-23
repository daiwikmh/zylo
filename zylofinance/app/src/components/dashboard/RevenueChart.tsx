"use client";

export const RevenueChart = () => {
  // Sample data points for the chart
  const dataPoints = [
    { date: 'Feb 14', value: 60, prior: 40 },
    { date: 'Feb 15', value: 75, prior: 55 },
    { date: 'Feb 16', value: 65, prior: 50 },
    { date: 'Feb 17', value: 85, prior: 60 },
    { date: 'Feb 18', value: 70, prior: 55 },
    { date: 'Feb 19', value: 90, prior: 65 },
    { date: 'Feb 20', value: 80, prior: 70 },
  ];

  const maxValue = 100;

  return (
    <div className="bento-card chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Revenue</h3>
          <p className="chart-subtitle">Last 7 days VS prior week</p>
        </div>
        <div className="chart-legend">
          <div className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: '#070709' }} />
            <span>Current</span>
          </div>
          <div className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: 'rgba(7, 7, 9, 0.5)' }} />
            <span>Prior</span>
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="chart-container">
        <svg viewBox="0 0 600 200" className="revenue-chart-svg">
          {/* Grid lines */}
          <g className="chart-grid">
            {[0, 25, 50, 75, 100].map((y, i) => (
              <line
                key={i}
                x1="40"
                y1={180 - (y / maxValue) * 160}
                x2="580"
                y2={180 - (y / maxValue) * 160}
                stroke="rgba(7, 7, 9, 0.15)"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* Y-axis labels */}
          <g className="chart-y-labels" fill="rgba(7, 7, 9, 0.6)" fontSize="10">
            <text x="30" y="24" textAnchor="end">20K</text>
            <text x="30" y="64" textAnchor="end">15K</text>
            <text x="30" y="104" textAnchor="end">10K</text>
            <text x="30" y="144" textAnchor="end">5K</text>
            <text x="30" y="184" textAnchor="end">0</text>
          </g>

          {/* Prior week line */}
          <path
            d={`M ${dataPoints.map((p, i) =>
              `${40 + (i * 90)},${180 - (p.prior / maxValue) * 160}`
            ).join(' L ')}`}
            fill="none"
            stroke="rgba(7, 7, 9, 0.4)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Current week line */}
          <path
            d={`M ${dataPoints.map((p, i) =>
              `${40 + (i * 90)},${180 - (p.value / maxValue) * 160}`
            ).join(' L ')}`}
            fill="none"
            stroke="#070709"
            strokeWidth="2"
          />

          {/* Data points */}
          {dataPoints.map((p, i) => (
            <g key={i}>
              <circle
                cx={40 + (i * 90)}
                cy={180 - (p.value / maxValue) * 160}
                r="4"
                fill="#E1C4E9"
                stroke="#070709"
                strokeWidth="2"
              />
            </g>
          ))}

          {/* X-axis labels */}
          <g className="chart-x-labels" fill="rgba(7, 7, 9, 0.6)" fontSize="10">
            {dataPoints.map((p, i) => (
              <text key={i} x={40 + (i * 90)} y="198" textAnchor="middle">{p.date}</text>
            ))}
          </g>

          {/* Tooltip for highlighted point */}
          <g transform="translate(490, 55)">
            <rect x="-40" y="-20" width="80" height="30" rx="6" fill="#070709" />
            <text x="0" y="-2" textAnchor="middle" fill="#E1C4E9" fontSize="11" fontWeight="600">
              $1,259.79
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default RevenueChart;
