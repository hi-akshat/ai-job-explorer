import React, { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TimelineEvent {
  year: number | string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  iconColor?: string;
}

interface TimelineChartProps {
  events: TimelineEvent[];
  title?: string;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ events, title }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [visibleEvents, setVisibleEvents] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            setVisibleEvents(prev => [...prev, index]);
          }
        });
      },
      { threshold: 0.2 }
    );

    const eventElements = timelineRef.current?.querySelectorAll('.timeline-item');
    if (eventElements) {
      eventElements.forEach(el => observer.observe(el));
    }

    return () => {
      if (eventElements) {
        eventElements.forEach(el => observer.unobserve(el));
      }
    };
  }, []);

  return (
    <div className="timeline-chart">
      {title && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <h3 className="text-xl font-semibold text-center">{title}</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="text-gray-400 hover:text-gray-600">
                <Info size={16} />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-64 text-xs">
                  This timeline shows key AI adoption milestones expected in the coming years
                  and their potential impact on the workforce.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      <div className="timeline" ref={timelineRef}>
        {events.map((event, index) => {
          const isVisible = visibleEvents.includes(index);
          const side = index % 2 === 0 ? 'left' : 'right';
          
          return (
            <div 
              key={index}
              className="timeline-item"
              data-index={index}
            >
              <div className="timeline-marker" style={{ 
                backgroundColor: event.iconColor || '#9b87f5',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.5s ease'
              }}>
                {event.icon && (
                  <div className="flex items-center justify-center h-full">
                    {event.icon}
                  </div>
                )}
              </div>
              
              <div 
                className={`timeline-content ${side}`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible 
                    ? 'translateX(0)' 
                    : `translateX(${side === 'left' ? '-20px' : '20px'})`,
                  transition: 'opacity 0.5s ease, transform 0.5s ease'
                }}
              >
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="font-bold text-theme-primary">{event.year}</div>
                  <h4 className="text-lg font-medium mb-2">{event.title}</h4>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        {/* Scroll to explore the full timeline of AI's workforce impact */}
      </div>
    </div>
  );
};

export default TimelineChart;
