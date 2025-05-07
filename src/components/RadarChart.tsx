
import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

interface RadarChartProps {
  data: { [key: string]: number }[];
  keys: string[];
  indexBy: string;
  title?: string;
  subtitle?: string;
  maxValue?: number;
  colors?: string[];
  animated?: boolean;
}

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  keys,
  indexBy,
  title,
  subtitle,
  maxValue = 100,
  colors = ['#9381FF', '#10B981'],
  animated = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
    
    if (chartRef.current) {
      observer.observe(chartRef.current);
    }
    
    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!data || !data.length || !isVisible || !svgRef.current) return;

    const width = 500;
    const height = 500;
    const margin = { top: 50, right: 80, bottom: 50, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`);

    // Calculate the angle for each axis
    const allAxes = Object.keys(data[0]).filter(key => key !== indexBy);
    const angleSlice = (Math.PI * 2) / allAxes.length;
    
    // Scale for the radius
    const rScale = d3.scaleLinear()
      .range([0, radius])
      .domain([0, maxValue]);
    
    // Draw the background circles
    const circles = [0.2, 0.4, 0.6, 0.8, 1];
    svg.selectAll('.circle-grid')
      .data(circles)
      .enter()
      .append('circle')
      .attr('class', 'circle-grid')
      .attr('r', d => radius * d)
      .attr('fill', 'none')
      .attr('stroke', '#E5E7EB')
      .attr('stroke-dasharray', '4,4')
      .style('opacity', 0.5);
    
    // Add value indicators
    svg.selectAll('.circle-label')
      .data(circles)
      .enter()
      .append('text')
      .attr('class', 'circle-label')
      .attr('x', 0)
      .attr('y', d => -radius * d)
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('fill', '#6B7280')
      .style('font-size', '10px')
      .text(d => `${Math.round(maxValue * d)}`);
    
    // Draw the axes
    const axes = svg.selectAll('.axis')
      .data(allAxes)
      .enter()
      .append('g')
      .attr('class', 'axis');
    
    axes.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => radius * Math.cos(angleSlice * i - Math.PI/2))
      .attr('y2', (d, i) => radius * Math.sin(angleSlice * i - Math.PI/2))
      .attr('stroke', '#E5E7EB')
      .attr('stroke-width', 1);
    
    axes.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('x', (d, i) => (radius + 20) * Math.cos(angleSlice * i - Math.PI/2))
      .attr('y', (d, i) => (radius + 20) * Math.sin(angleSlice * i - Math.PI/2))
      .text(d => d)
      .style('font-size', '12px')
      .style('fill', '#4B5563');
    
    // Create the radar areas for each key
    keys.forEach((key, keyIndex) => {
      const radarLine = d3.lineRadial<any>()
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveLinearClosed);
      
      const radarData = allAxes.map(axis => ({
        axis,
        value: data[0][axis] || 0
      }));
      
      // Draw the area
      const radarArea = svg.append('path')
        .datum(radarData)
        .attr('class', `radar-area-${keyIndex}`)
        .attr('d', radarLine as any)
        .attr('fill', colors[keyIndex % colors.length])
        .attr('fill-opacity', 0.2)
        .attr('stroke', colors[keyIndex % colors.length])
        .attr('stroke-width', 2);
      
      if (animated) {
        radarArea
          .style('opacity', 0)
          .transition()
          .duration(1000)
          .style('opacity', 1);
      }
      
      // Add dots at each data point
      svg.selectAll(`.radar-dot-${keyIndex}`)
        .data(radarData)
        .enter()
        .append('circle')
        .attr('class', `radar-dot-${keyIndex}`)
        .attr('r', 5)
        .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI/2))
        .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI/2))
        .attr('fill', colors[keyIndex % colors.length])
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('opacity', animated ? 0 : 1)
        .transition()
        .duration(1000)
        .delay(800)
        .style('opacity', 1);
    });
    
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${radius + 20}, ${-radius + 30})`)
      .attr('class', 'legend');
    
    keys.forEach((key, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);
      
      legendItem.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colors[i % colors.length]);
      
      legendItem.append('text')
        .attr('x', 25)
        .attr('y', 12)
        .text(key)
        .style('font-size', '12px')
        .attr('text-anchor', 'start')
        .style('text-transform', 'capitalize')
        .style('fill', '#4B5563');
    });

  }, [data, keys, indexBy, colors, maxValue, isVisible, animated]);

  return (
    <div className="radar-chart" ref={chartRef}>
      {title && <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-600 text-center mb-4">{subtitle}</p>}
      
      <div className="radar-chart-container w-full flex justify-center">
        <div 
          className="w-full h-full"
          style={{ 
            opacity: animated ? (isVisible ? 1 : 0) : 1,
            transform: animated ? (isVisible ? 'scale(1)' : 'scale(0.9)') : 'scale(1)',
            transition: 'opacity 1s ease-out, transform 1s ease-out'
          }}
        >
          <svg ref={svgRef} className="w-full h-[400px]" viewBox="0 0 500 500" />
        </div>
      </div>
    </div>
  );
};

export default RadarChart;
