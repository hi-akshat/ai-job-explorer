import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

interface BubbleData {
  id: string;
  value: number;
  label: string;
  category: string;
  color?: string;
  description?: string;
}

interface BubbleChartProps {
  data: BubbleData[];
  width?: number;
  height?: number;
  title?: string;
  subtitle?: string;
  animated?: boolean;
  onBubbleClick?: (bubble: BubbleData) => void;
}

const BubbleChart: React.FC<BubbleChartProps> = ({
  data,
  width = 600,
  height = 500,
  title,
  subtitle,
  animated = true,
  onBubbleClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: width, height: height });
  const [selectedBubble, setSelectedBubble] = useState<BubbleData | null>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setDimensions({
          width: containerWidth,
          height: Math.min(height, containerWidth * 0.8)
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [height]);

  // Intersection observer for animation
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Draw bubble chart
  useEffect(() => {
    if (!svgRef.current || !isVisible || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const colorScale = d3.scaleOrdinal()
      .domain(Array.from(new Set(data.map(d => d.category))))
      .range(['#9381FF', '#0EA5E9', '#F87171', '#10B981', '#FB923C', '#6366F1', '#EC4899']);

    const valueExtent = d3.extent(data, d => d.value) as [number, number];
    const maxValue = valueExtent[1];

    // Create bubble chart
    const bubble = d3.pack()
      .size([dimensions.width, dimensions.height])
      .padding(5); // Increased padding

    const hierarchyData = d3.hierarchy({ children: data })
      .sum(d => (d as any).value || 0);

    const root = bubble(hierarchyData);

    // Create groups for each bubble
    const bubbleGroups = svg.selectAll('g')
      .data(root.children || [])
      .join('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // Add bubble circles
    const bubbles = bubbleGroups.append('circle')
      .attr('r', 0)
      .style('fill', d => (d.data as any).color || colorScale((d.data as any).category))
      .style('opacity', 0.8)
      .style('stroke', d => d3.color((d.data as any).color || colorScale((d.data as any).category))?.darker(0.3) as string)
      .style('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(300)
          .style('opacity', 1)
          .attr('r', d.r * 1.05);
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .transition()
          .duration(300)
          .style('opacity', 0.8)
          .attr('r', d.r);
      })
      .on('click', function (event, d) {
        setSelectedBubble(d.data as BubbleData);
        if (onBubbleClick) {
          onBubbleClick(d.data as BubbleData);
        }
      })
      .transition()
      .delay((_, i) => i * 50)
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('r', d => d.r);

    // Add labels to bubbles
    bubbleGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-weight', 600)
      .style('font-size', d => {
        // More conservative font sizing based on bubble radius
        const maxLength = (d.data as any).label.length;
        const baseSize = d.r / Math.max(3, maxLength / 2);
        return Math.min(baseSize, 10) + 'px'; // Cap at 10px
      })
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .text(d => {
        const label = (d.data as any).label;
        // Truncate text if bubble is too small
        if (d.r < 10) {
          return label.length > 8 ? label.slice(0, 6) + '...' : label;
        }
        return label;
      })
      .transition()
      .delay((_, i) => i * 50 + 500)
      .duration(400)
      .style('opacity', 1);

    // Add value text below
    bubbleGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('y', d => d.r > 30 ? d.r / 4 : 0)
      .style('font-weight', 500)
      .style('font-size', d => {
        // Smaller font size for values
        const fontSize = Math.min(d.r / 4, 8);
        return fontSize + 'px';
      })
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .text(d => d.r > 25 ? `${(d.data as any).value}%` : '')
      .transition()
      .delay((_, i) => i * 50 + 700)
      .duration(400)
      .style('opacity', 1);

    // Create legend

    const categories = Array.from(new Set(data.map(d => d.category)));

    const legendConfig = {
      itemWidth: Math.min(150, dimensions.width / categories.length), // Limit item width
      legendX: 20,
      legendY: dimensions.height + 30, // Increased spacing from chart
      itemHeight: 25, // Increased height between items
      columns: Math.min(4, categories.length) // Limit number of columns
    };
    const itemsPerRow = legendConfig.columns;
    const legendWidth = dimensions.width - (legendConfig.legendX * 2); // Account for padding
    const columnWidth = legendWidth / itemsPerRow;

    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendConfig.legendX},${legendConfig.legendY})`);

    legend.selectAll('.legend-item')
      .data(categories)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        return `translate(${col * columnWidth}, ${row * legendConfig.itemHeight})`;
      })
      .style('opacity', 0)
      .each(function (d) {
        const g = d3.select(this);

        g.append('circle')
          .attr('r', 6)
          .style('fill', d => colorScale(d));

        g.append('text')
          .attr('x', 16) // Increased spacing between circle and text
          .attr('y', 5) // Better vertical alignment
          .text(d => d)
          .style('font-size', '11px') // Slightly smaller font
          .style('fill', '#4B5563')
          .style('font-weight', '500'); // Added font weight for better readability
      })
      .transition()
      .delay((_, i) => i * 100 + 1000)
      .duration(500)
      .style('opacity', 1);

  }, [data, dimensions, isVisible, onBubbleClick]);

  return (
    <div className="bubble-chart" ref={containerRef}>
      {title && <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-600 text-center mb-4">{subtitle}</p>}

      <div className="relative">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height + 80} // Increased padding for legend
          className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        />

        {selectedBubble && (
          <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-indigo-100 max-w-xs">
            <h4 className="font-semibold text-lg">{selectedBubble.label}</h4>
            <p className="text-sm text-gray-600 mb-2">{selectedBubble.category}</p>
            <div className="flex items-center mb-2">
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">{selectedBubble.value}%</span>
              <span className="text-sm text-gray-600 ml-2">Impact Score</span>
            </div>

            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedBubble(null)}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BubbleChart;