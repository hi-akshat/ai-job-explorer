import React, { useEffect, useRef } from 'react';

interface GaugeChartProps {
  percentage: number;
  color?: string;
  size?: number;
  animated?: boolean;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  percentage,
  color,
  size = 220,
  animated = true
}) => {
  const gaugeRef = useRef<SVGSVGElement>(null);

  // Arc calculations for a full circle
  const strokeWidth = size * 0.12;
  const radius = (size / 2) - (strokeWidth / 2);
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const arcColor = color || (percentage < 30 ? '#10B981' : percentage < 70 ? '#F59E0B' : '#EF4444');
  const labelText = percentage < 30 ? 'Low Risk' : percentage < 70 ? 'Medium Risk' : 'High Risk';

  // For animation
  useEffect(() => {
    if (gaugeRef.current && animated) {
      const arc = gaugeRef.current.querySelector('.gauge-fill');
      if (arc) {
        arc.setAttribute('stroke-dasharray', `${circumference}`);
        arc.setAttribute('stroke-dashoffset', `${circumference}`);
        setTimeout(() => {
          arc.setAttribute('stroke-dashoffset', `${circumference * (1 - percentage / 100)}`);
        }, 100);
      }
    }
  }, [percentage, animated, circumference]);

  // If not animated, set offset directly
  const dashOffset = animated ? circumference : circumference * (1 - percentage / 100);

  return (
    <svg className="gauge-chart" width={size} height={size} ref={gaugeRef}>
      {/* Full grey background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
      />
      {/* Colored arc for percentage */}
      <circle
        className="gauge-fill"
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={arcColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{
          transition: animated ? 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.1))',
        }}
        transform={`rotate(-90 ${center} ${center})`}
      />
      {/* Solid center circle for text background */}
      <circle
        cx={center}
        cy={center}
        r={radius - strokeWidth / 1.5}
        fill="#F9FAFB"
        stroke="none"
      />
      {/* Percentage text */}
      <text
        className="gauge-text"
        x={center}
        y={center + size * 0.04}
        textAnchor="middle"
        fill="#1F2937"
        style={{
          fontSize: `${size * 0.2}px`,
          fontWeight: 'bold',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {percentage}%
      </text>
      {/* Label text */}
      <text
        className="gauge-label"
        x={center}
        y={center + size * 0.14}
        textAnchor="middle"
        fill="#6B7280"
        style={{
          fontSize: `${size * 0.09}px`,
          fontWeight: 500,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {labelText}
      </text>
    </svg>
  );
};

export default GaugeChart;
