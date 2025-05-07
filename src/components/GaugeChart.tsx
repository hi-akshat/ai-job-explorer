
import React, { useEffect, useRef } from 'react';

interface GaugeChartProps {
  percentage: number;
  color?: string;
  size?: number;
  animated?: boolean;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  percentage,
  color = '#9b87f5',
  size = 220,
  animated = true
}) => {
  const gaugeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (gaugeRef.current && animated) {
      // Animation setup when component mounts
      const gauge = gaugeRef.current;
      const gaugeFill = gauge.querySelector('.gauge-fill');
      
      if (gaugeFill) {
        const originalArc = gaugeFill.getAttribute('d');
        gaugeFill.setAttribute('d', getArcPath(0));
        
        // Trigger animation after a small delay
        setTimeout(() => {
          gaugeFill.setAttribute('d', originalArc || '');
        }, 100);
      }
    }
  }, [percentage, animated]);

  // Calculate the arc path for the gauge
  const getArcPath = (percent: number) => {
    const radius = 80;
    const startAngle = -Math.PI / 2; // Start at the top
    const endAngle = startAngle + (percent / 100) * Math.PI; // Max angle is 180 degrees (PI radians)
    
    // SVG arc path
    const x1 = size / 2 + radius * Math.cos(startAngle);
    const y1 = size / 2 + radius * Math.sin(startAngle);
    const x2 = size / 2 + radius * Math.cos(endAngle);
    const y2 = size / 2 + radius * Math.sin(endAngle);
    
    const largeArcFlag = percent > 50 ? 1 : 0;
    
    return `M ${size/2} ${size/2 - radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  // Determine color based on percentage
  const getColor = (percent: number) => {
    if (color) return color;
    if (percent < 30) return '#4CAF50'; // Low risk - green
    if (percent < 70) return '#FFC107'; // Medium risk - yellow/amber
    return '#E76F6F'; // High risk - red
  };

  // Get label text based on percentage
  const getLabelText = (percent: number) => {
    if (percent < 30) return 'Low Risk';
    if (percent < 70) return 'Medium Risk';
    return 'High Risk';
  };

  const arcPath = getArcPath(percentage);
  const arcColor = getColor(percentage);
  const labelText = getLabelText(percentage);

  return (
    <svg className="gauge-chart" width={size} height={size} ref={gaugeRef}>
      {/* Background arc */}
      <path
        className="gauge-background"
        d={getArcPath(100)}
        fill="none"
        stroke="#e9ecef"
        strokeWidth="30"
      />
      
      {/* Filled arc */}
      <path
        className="gauge-fill"
        d={arcPath}
        fill="none"
        stroke={arcColor}
        strokeWidth="30"
        style={{ transition: animated ? 'all 1s ease-out' : 'none' }}
      />
      
      {/* Percentage text */}
      <text
        className="gauge-text"
        x={size / 2}
        y={size / 2 + 15}
        textAnchor="middle"
        fill="#1A1F2C"
      >
        {percentage}%
      </text>
      
      {/* Label text */}
      <text
        className="gauge-label"
        x={size / 2}
        y={size / 2 + 45}
        textAnchor="middle"
        fill="#666"
      >
        {labelText}
      </text>
    </svg>
  );
};

export default GaugeChart;
