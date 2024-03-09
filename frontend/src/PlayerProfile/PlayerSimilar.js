import '../shared/App.css';
import './PlayerProfile.css';

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function PlayerSimilar({data}) {
    const test_data = [
      { "x": 1, "y": 2 },
      { "x": 2, "y": 3 },
      { "x": 3, "y": 5 },
      { "x": 4, "y": 7 }
    ]
    const d3Container = useRef(null);

    useEffect(() => {
      if (test_data && d3Container.current) {
        const svg = d3.select(d3Container.current);

        // Clear SVG to prevent duplication
        svg.selectAll("*").remove();

        // Set the dimensions and margins of the graph
        const margin = {top: 50, right: 30, bottom: 20, left: 40},
            width =  0.9*Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) - margin.left - margin.right,
            height = 0.8*Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - margin.top - margin.bottom;

        // Append the svg object to the body of the page
        const g = svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add X axis
        const x = d3.scaleLinear()
          .domain(d3.extent(test_data, d => d.x))
          .range([ 0, width ]);
        g.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear()
          .domain([0, d3.max(test_data, d => d.y)])
          .range([ height, 0 ]);
        g.append("g")
          .call(d3.axisLeft(y));

        // Add the line
        g.append("path")
          .datum(test_data)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(d => x(d.x))
            .y(d => y(d.y))
          );
        g.append("text")
        .attr("class", "graph-title") // Assign a class for easy selection
        .attr("x", width / 2) // Position at half of the width
        .attr("y", -20) // Position from the top of the SVG
        .attr("text-anchor", "middle") // Ensure the text is centered
        .text("Similar Players");
      }
    }, [test_data]); // Redraw chart if data changes

    return (
        <div className='row playerGraphContainer'>
          <svg
            className='graphComponent'
            ref={d3Container}
          />
        </div>
    );
}

export default PlayerSimilar;
