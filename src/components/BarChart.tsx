
import React, { useEffect, useRef, useState } from 'react';

interface BarChartDataItem {
  label: string;
  value: number;
  color?: string;
  description?: string;
}

interface BarChartProps {
  data: BarChartDataItem[];
  title?: string;
  subtitle?: string;
  height?: number;
  animated?: boolean;
  orientation?: 'vertical' | 'horizontal';
  showValues?: boolean;
  maxValue?: number;
  valueSuffix?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  animated = true,
  orientation = 'vertical',
  showValues = true,
  maxValue,
  valueSuffix = '%'
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  // Calculate the maximum value if not provided
  const calculatedMaxValue = maxValue || Math.max(...data.map(item => item.value)) * 1.1;
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.2 });
    
    if (chartRef.current) {
      observer.observe(chartRef.current);
    }
    
    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, []);

  const isHorizontal = orientation === 'horizontal';
  const barWidth = isHorizontal ? `calc((100% - ${data.length * 10}px) / ${data.length})` : '100%';
  const barMargin = '0 5px';

  return (
    <div className="bar-chart-container" ref={chartRef}>
      {title && <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-600 text-center mb-4">{subtitle}</p>}
      
      <div 
        className="bar-chart relative" 
        style={{ 
          height: isHorizontal ? `${data.length * 40 + 20}px` : `${height}px`,
          width: '100%',
          display: 'flex',
          flexDirection: isHorizontal ? 'column' : 'row',
          alignItems: 'flex-end',
          justifyContent: isHorizontal ? 'space-between' : 'flex-end'
        }}
      >
        {/* Horizontal grid lines - only for vertical bars */}
        {!isHorizontal && (
          <div className="grid-lines absolute inset-0" style={{ zIndex: 0 }}>
            {[0.25, 0.5, 0.75, 1].map((line, i) => (
              <div 
                key={i}
                className="grid-line absolute w-full border-t border-gray-200"
                style={{ bottom: `${line * 100}%` }}
              />
            ))}
          </div>
        )}
        
        {/* Bars */}
        {data.map((item, index) => {
          const barColor = item.color || '#9b87f5';
          const barSize = `${(item.value / calculatedMaxValue) * 100}%`;
          
          return (
            <div
              key={index}
              className="bar-container relative"
              style={{
                height: isHorizontal ? '30px' : '100%',
                width: isHorizontal ? '100%' : barWidth,
                margin: barMargin,
                zIndex: 1
              }}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div
                className="bar"
                style={{
                  backgroundColor: barColor,
                  width: isHorizontal ? (isVisible && animated ? barSize : '0%') : '100%',
                  height: isHorizontal ? '100%' : (isVisible && animated ? barSize : '0%'),
                  transition: animated ? 'width 1s ease-out, height 1s ease-out' : 'none',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  borderRadius: '4px 4px 0 0'
                }}
              />
              
              {/* Bar label */}
              <div
                className="bar-label"
                style={{
                  position: 'absolute',
                  [isHorizontal ? 'left' : 'bottom']: isHorizontal ? 'calc(100% + 10px)' : '-25px',
                  [isHorizontal ? 'top' : 'left']: isHorizontal ? '50%' : '50%',
                  transform: isHorizontal ? 'translateY(-50%)' : 'translateX(-50%) rotate(-45deg)',
                  fontSize: '0.8rem',
                  color: '#666',
                  width: isHorizontal ? 'auto' : '100%',
                  textAlign: 'center',
                  whiteSpace: isHorizontal ? 'nowrap' : 'normal'
                }}
              >
                {item.label}
              </div>
              
              {/* Bar value */}
              {showValues && (
                <div
                  className="bar-value"
                  style={{
                    position: 'absolute',
                    [isHorizontal ? 'right' : 'bottom']: '5px',
                    [isHorizontal ? 'top' : 'left']: isHorizontal ? '50%' : '50%',
                    transform: isHorizontal 
                      ? 'translateY(-50%)' 
                      : `translateX(-50%) translateY(${isVisible && animated ? '-100%' : '-50%'})`,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#444',
                    opacity: isVisible && animated ? 1 : 0,
                    transition: 'all 0.5s ease-out 0.5s'
                  }}
                >
                  {item.value}{valueSuffix}
                </div>
              )}
              
              {/* Tooltip */}
              {item.description && hoveredBar === index && (
                <div
                  className="tooltip absolute bg-white shadow-md p-2 rounded z-10 text-sm"
                  style={{
                    bottom: isHorizontal ? 'auto' : '100%',
                    top: isHorizontal ? '-100%' : 'auto',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '150px',
                    maxWidth: '200px'
                  }}
                >
                  {item.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
