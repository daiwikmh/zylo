"use client";

interface StatsWidgetProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  };
}

export const StatsWidget = ({ title, value, change }: StatsWidgetProps) => {
  return (
    <div className="bento-card stats-widget">
      <div className="stats-widget-header">{title}</div>
      <div className="stats-widget-value">
        {value}
        {change && (
          <span className={`stats-widget-change ${change.positive ? 'positive' : 'negative'}`}>
            {change.positive ? '+' : ''}{change.value}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsWidget;
