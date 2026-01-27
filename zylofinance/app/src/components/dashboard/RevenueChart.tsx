"use client";

import { useEffect, useState } from 'react';

interface DataPoint {
  date: string;
  value: number;
  prior: number;
}

export const RevenueChart = () => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [maxValue, setMaxValue] = useState(100);

  useEffect(() => {
    // TODO: Fetch real chart data from API
    // For now, showing empty state
    setDataPoints([]);
  }, []);

  if (dataPoints.length === 0) {
    return (
      <div className="bento-card chart-card" style={{
        background: '#E1C4E9',
        border: '2px solid #070709',
        boxShadow: '4px 4px 0px #070709',
        borderRadius: '1rem',
        padding: '1.5rem'
      }}>
        <div className="chart-header">
          <div>
            <h3 className="chart-title" style={{ color: '#070709', fontWeight: '700', fontSize: '1.25rem' }}>
              Yield Performance
            </h3>
            <p className="chart-subtitle" style={{ color: '#232323', fontSize: '0.875rem', opacity: 0.7 }}>
              Track your earnings over time
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          minHeight: '200px',
          gap: '1rem'
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#070709" strokeWidth="2" style={{ opacity: 0.3 }}>
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
          </svg>
          <p style={{ fontSize: '0.875rem', color: '#232323', textAlign: 'center', opacity: 0.6 }}>
            Start depositing to see your yield performance chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bento-card chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Yield Performance</h3>
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
            <text x="30" y="24" textAnchor="end">Max</text>
            <text x="30" y="104" textAnchor="end">Mid</text>
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
        </svg>
      </div>
    </div>
  );
};

export default RevenueChart;
