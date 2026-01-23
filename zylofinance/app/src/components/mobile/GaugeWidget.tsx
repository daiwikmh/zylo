'use client';

import { useEffect, useRef } from 'react';
import '../../styles/mobile-neo-brutalist.css';

interface GaugeWidgetProps {
  percentage?: number;
  title?: string;
  onUpgradeClick?: () => void;
}

export default function GaugeWidget({
  percentage = 64,
  title = 'Monthly Limit',
  onUpgradeClick
}: GaugeWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 200;
    canvas.width = size;
    canvas.height = size / 2;

    // Clear canvas
    ctx.clearRect(0, 0, size, size / 2);

    // Draw background arc
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 15, Math.PI, 0, false);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Draw progress arc
    const endAngle = Math.PI + (Math.PI * percentage) / 100;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 15, Math.PI, endAngle, false);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();
  }, [percentage]);

  return (
    <div className="mobile-gauge-widget">
      <div className="mobile-gauge-title">{title}</div>

      <div className="mobile-gauge-container">
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        <div className="mobile-gauge-percentage">{percentage}%</div>
      </div>

      <div className="mobile-gauge-upsell" onClick={onUpgradeClick}>
        Get Plus
      </div>
    </div>
  );
}
