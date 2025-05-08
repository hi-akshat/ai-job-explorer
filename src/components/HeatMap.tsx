import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface HeatMapCell {
  x: string;
  y: string;
  value: number;
  tooltip?: string;
}

interface HeatMapProps {
  data: HeatMapCell[];
  title?: string;
  subtitle?: string;
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
  colorScheme?: string[];
  animated?: boolean;
}

const HeatMap: React.FC<HeatMapProps> = ({
  data,
  title,
  subtitle,
  xLabel,
  yLabel,
  width = 600,
  height = 500,
  colorScheme = ['#f7fbff', '#9381FF'],
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

  // Draw heat map
  useEffect(() => {
    if (!svgRef.current || !isVisible || !data.length) return;

    const margin = { top: 50, right: 50, bottom: 70, left: 70 }; // Increased top margin
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Group for positioning elements
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique x and y values
    const xValues = Array.from(new Set(data.map(d => d.x)));
    const yValues = Array.from(new Set(data.map(d => d.y)));

    // Define scales
    const xScale = d3.scaleBand()
      .domain(xValues)
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(yValues)
      .range([0, innerHeight])
      .padding(0.1);

    // Find min and max values for color scale
    const valueExtent = d3.extent(data, d => d.value) as [number, number];

    // Create color scale
    const colorScale = d3.scaleLinear<string>()
      .domain([valueExtent[0], valueExtent[1]])
      .range([colorScheme[0], colorScheme[1]]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append axes
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('dy', '0.5em')
      .attr('dx', '-0.5em')
      .attr('transform', 'rotate(-45)') // Rotate labels
      .style('text-anchor', 'end')
      .style('font-size', '8px'); // Reduced font size

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('dy', '0.5em')
      .attr('dx', '-0.5em')
      .attr('transform', 'rotate(-45)') // Rotate labels
      .style('text-anchor', 'end')
      .style('font-size', '8px'); // Reduced font size

    // Add axis labels
    if (xLabel) {
      svg.append('text')
        .attr('class', 'x-label')
        .attr('x', dimensions.width / 2)
        .attr('y', dimensions.height - 5) // Adjusted position
        .style('text-anchor', 'middle')
        .style('font-size', '10px') // Reduced font size
        .text(xLabel);
    }

    if (yLabel) {
      svg.append('text')
        .attr('class', 'y-label')
        .attr('transform', `rotate(-90)`)
        .attr('x', -(dimensions.height / 2))
        .attr('y', 10) // Adjusted position
        .style('text-anchor', 'middle')
        .style('font-size', '10px') // Reduced font size
        .text(yLabel);
    }

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Draw cells
    g.selectAll('.cell')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.x) || 0)
      .attr('y', d => yScale(d.y) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', d => animated ? colorScheme[0] : colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke', '#000')
          .attr('stroke-width', 2);

        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 25}px`)
          .html(`
            <div class="font-medium">${d.x} × ${d.y}</div>
            <div class="text-lg font-bold">${d.value}%</div>
            ${d.tooltip ? `<div class="text-xs mt-1">${d.tooltip}</div>` : ''}
          `);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1);

        tooltip.style('opacity', 0);
      });

    // Add cell values
    g.selectAll('.cell-value')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'cell-value')
      .attr('x', d => (xScale(d.x) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => (yScale(d.y) || 0) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '10px') // Reduced font size
      .style('font-weight', 600)
      .style('fill', d => d.value > (valueExtent[1] - valueExtent[0]) / 2 + valueExtent[0] ? '#fff' : '#333')
      .style('opacity', 0)
      .text(d => `${d.value}%`);

    // Animation if enabled
    if (animated) {
      g.selectAll('.cell')
        .transition()
        .duration(1000)
        .delay((_, i) => i * 20)
        .attr('fill', d => colorScale(d.value));

      g.selectAll('.cell-value')
        .transition()
        .duration(800)
        .delay((_, i) => i * 20 + 500)
        .style('opacity', 1);
    } else {
      g.selectAll('.cell-value').style('opacity', 1);
    }

    // Add legend
    const legendWidth = 120; // Reduced legend width
    const legendHeight = 12; // Reduced legend height

    const legendX = dimensions.width - margin.right - legendWidth; // Adjusted position
    const legendY = 20; // Adjusted position

    const defs = svg.append('defs');

    const linearGradient = defs.append('linearGradient')
      .attr('id', 'linear-gradient');

    linearGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorScheme[0]);

    linearGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorScheme[1]);

    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX},${legendY})`);

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#linear-gradient)');

    // Add scale ticks to legend
    const legendScale = d3.scaleLinear()
      .domain([valueExtent[0], valueExtent[1]])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    legend.append('g')
      .attr('transform', `translate(0,${legendHeight})`)
      .call(legendAxis)
      .selectAll('text')
      .style('font-size', '6px'); // Reduced font size

    // Add legend title
    legend.append('text')
      .attr('x', 0)
      .attr('y', -3) // Adjusted position
      .style('font-size', '8px') // Reduced font size
      .style('font-weight', 500)
      .text('Automation Risk (%)');

  }, [data, dimensions, isVisible, colorScheme, xLabel, yLabel, animated]);

  return (
    <div className="heat-map" ref={containerRef}>
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

export default HeatMap;