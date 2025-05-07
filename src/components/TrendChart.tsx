
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  year: number;
  value: number;
  label: string;
  category: string;
}

interface TrendChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
  showLegend?: boolean;
  colors?: { [key: string]: string };
  animated?: boolean;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  subtitle,
  xLabel = 'Year',
  yLabel = 'Impact (%)',
  width = 700,
  height = 400,
  showLegend = true,
  colors = {
    'Jobs Lost': '#F87171',
    'Jobs Created': '#10B981',
    'Workers Needing Reskilling': '#9381FF'
  },
  animated = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width, height });

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setDimensions({
          width: containerWidth,
          height: height * (containerWidth / width)
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, [width, height]);

  // Intersection observer to trigger animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Draw chart
  useEffect(() => {
    if (!svgRef.current || !isVisible || !data.length) return;

    const margin = { top: 40, right: showLegend ? 120 : 40, bottom: 60, left: 70 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Group for positioning elements
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const categories = Array.from(new Set(data.map(d => d.category)));
    
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.year) as number, d3.max(data, d => d.year) as number])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) as number])
      .range([innerHeight, 0])
      .nice();

    // Color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(categories)
      .range(categories.map(c => colors[c] || '#9381FF'));

    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => d.toString());
      
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    // Add gridlines
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#E5E7EB')
      .attr('stroke-dasharray', '3,3');

    // Append axes
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px');

    // Add axis labels
    svg.append('text')
      .attr('class', 'x-label')
      .attr('x', dimensions.width / 2)
      .attr('y', dimensions.height - 10)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(xLabel);

    svg.append('text')
      .attr('class', 'y-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(dimensions.height / 2))
      .attr('y', 20)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(yLabel);

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Create a line generator
    const lineGenerator = d3.line<DataPoint>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Group data by category
    const groupedData = d3.group(data, d => d.category);

    // Draw lines
    Array.from(groupedData.entries()).forEach(([category, points]) => {
      // Sort points by year
      points.sort((a, b) => a.year - b.year);
      
      const line = g.append('path')
        .datum(points)
        .attr('class', 'line')
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', colorScale(category))
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');

      if (animated) {
        // Line drawing animation
        const totalLength = (line.node() as SVGPathElement).getTotalLength();
        line.attr('stroke-dasharray', totalLength)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(2000)
          .delay(categories.indexOf(category) * 300)
          .ease(d3.easeQuadOut)
          .attr('stroke-dashoffset', 0);
      }

      // Add circles for data points
      g.selectAll(`.point-${category.replace(/\s+/g, '-')}`)
        .data(points)
        .enter()
        .append('circle')
        .attr('class', `point-${category.replace(/\s+/g, '-')}`)
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => yScale(d.value))
        .attr('r', 6)
        .attr('fill', colorScale(category))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('opacity', animated ? 0 : 1)
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(150)
            .attr('r', 8);
            
          tooltip
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 25}px`)
            .html(`
              <div class="text-sm font-medium">${d.category}</div>
              <div class="text-lg font-bold">${d.value}%</div>
              <div class="text-sm">${d.year}</div>
              <div class="text-xs mt-1">${d.label}</div>
            `);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(150)
            .attr('r', 6);
            
          tooltip.style('opacity', 0);
        });

      if (animated) {
        // Animate points
        g.selectAll(`.point-${category.replace(/\s+/g, '-')}`)
          .transition()
          .duration(500)
          .delay((_, i) => categories.indexOf(category) * 300 + i * 100 + 1500)
          .style('opacity', 1);
      }
    });

    // Add annotations / labels to the points
    Array.from(groupedData.entries()).forEach(([category, points]) => {
      points.forEach(point => {
        g.append('text')
          .attr('x', xScale(point.year))
          .attr('y', yScale(point.value) - 15)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .style('opacity', animated ? 0 : 1)
          .text(`${point.value}%`);
      });
      
      if (animated) {
        g.selectAll('text')
          .transition()
          .duration(500)
          .delay((_, i) => 2000 + i * 100)
          .style('opacity', 1);
      }
    });

    // Create legend if enabled
    if (showLegend) {
      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${dimensions.width - margin.right + 30},${margin.top})`);

      categories.forEach((category, i) => {
        const legendItem = legend.append('g')
          .attr('transform', `translate(0,${i * 30})`)
          .style('opacity', animated ? 0 : 1);

        legendItem.append('rect')
          .attr('width', 16)
          .attr('height', 16)
          .attr('rx', 2)
          .attr('fill', colorScale(category));

        legendItem.append('text')
          .attr('x', 24)
          .attr('y', 12)
          .style('font-size', '14px')
          .text(category);
          
        if (animated) {
          legendItem.transition()
            .duration(500)
            .delay(i * 200 + 2500)
            .style('opacity', 1);
        }
      });
    }

  }, [data, dimensions, isVisible, xLabel, yLabel, showLegend, colors, animated]);

  return (
    <div className="trend-chart" ref={containerRef}>
      {title && <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-600 text-center mb-4">{subtitle}</p>}
      
      <div className="relative">
        <svg 
          ref={svgRef}
          width={dimensions.width} 
          height={dimensions.height}
          className={`transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        />
        <div 
          ref={tooltipRef}
          className="absolute pointer-events-none bg-white px-3 py-2 rounded shadow-lg border border-gray-200 text-sm transition-opacity duration-200 z-10 opacity-0"
        />
      </div>
    </div>
  );
};

export default TrendChart;
