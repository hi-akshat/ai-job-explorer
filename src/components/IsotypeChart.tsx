
import React, { useEffect, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

interface IsotypeChartProps {
  percentage: number;
  icon?: React.ReactNode;
  rows?: number;
  columns?: number;
  title?: string;
  description?: string;
}

const IsotypeChart: React.FC<IsotypeChartProps> = ({
  percentage,
  icon = '👤',
  rows = 5,
  columns = 10,
  title,
  description
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const totalIcons = rows * columns;
  const activeIcons = Math.round(totalIcons * (percentage / 100));
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1 });
    
    if (chartRef.current) {
      observer.observe(chartRef.current);
    }
    
    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, []);

  return (
    <div className="isotype-chart" ref={chartRef}>
      {title && (
        <div className="flex items-center justify-center gap-2 mb-2">
          <h4 className="text-lg font-semibold">{title}</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="text-gray-400 hover:text-gray-600">
                <Info size={16} />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-64 text-xs">
                  This isotype chart shows {percentage}% of individuals in this field
                  may be affected by AI automation. Each icon represents a portion of the workforce.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      <div className="grid" style={{ 
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '5px'
      }}>
        {Array.from({ length: totalIcons }).map((_, index) => (
          <div 
            key={index} 
            className={`icon text-center text-xl ${isVisible && index < activeIcons ? 'active' : ''}`}
            style={{ 
              opacity: isVisible && index < activeIcons ? 1 : 0.2,
              transition: `opacity 0.3s ease ${Math.random() * 0.5}s`,
              fontSize: '1.5rem'
            }}
          >
            {icon}
          </div>
        ))}
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      )}
    </div>
  );
};

export default IsotypeChart;
