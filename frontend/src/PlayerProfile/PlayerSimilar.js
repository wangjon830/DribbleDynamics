import '../shared/App.css';
import './PlayerProfile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';

import React, { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import Joyride from 'react-joyride';

import LoadingPage from '../shared/LoadingPage';
import ErrorPage from '../shared/ErrorPage';

function PlayerSimilar({data}) {
    // Joyride
    const [runTour, setRunTour] = useState(false);
    const steps = [
      {
        target: '#statSelect',
        content: "Select which stats you'd like to visualize"
      },
      {
        target: '#similarGraph',
        content: "View players with similar numbers in the selected stats."
      },
      {
        target: '#similarPCA',
        content: "For more than two selected stats, we perform Principle Component Analysis on the stats so we can still visualize it in 2D. Here you can see how the stats contribute to the principle components."
      },
      {
        target: '#statLegend',
        content: "Point color represents information about the player"
      },
    ]
    const startTour = () => {
      setRunTour(true);
    };
    const stopTour = () => {
      setRunTour(false);
    };
    // Callback function to handle Joyride events
    const handleJoyrideCallback = (data) => {
      const { status } = data;
      const finishedStatuses = ['finished', 'skipped'];

      if (finishedStatuses.includes(status)) {
        stopTour();
      }
    };

    const [serverUrl, setServerUrl] = useState(null)

    useEffect(() => {
      setLoading(true);
      const serverDataUrl = `${process.env.PUBLIC_URL}/server.json`;
      fetch(serverDataUrl)
          .then((response) => response.json())
          .then((data) => {
              setServerUrl(data.address);
              setLoading(false);
          })
          .catch((error) => {
              console.error("Error fetching data: ", error);
              setError(error);
              setLoading(false);
          });
    }, [])

    const scatterContainer = useRef(null);
    const pcaContainer = useRef(null);

    const [scatterData, setScatterData] = useState(null)
    const [pcaData, setPcaData] = useState(null)
    const [radar, setRadar] = useState({})

    const [possibleStats, setPossibleStats] = useState([]);
    const [selectedStats, setSelectedStats] = useState([]);

    const [windowWidth, setWindowWidth] = useState(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0));
    const [windowHeight, setWindowHeight] = useState(Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0));

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    function handleCheckboxChange(event) {
      const value = event.target.value;
      const isChecked = event.target.checked;
  
      setSelectedStats(prev => {
        if (isChecked) {
          return [...prev, value];
        } else {
          return prev.filter(item => item !== value).sort();
        }
      });
    }

    // Handle window resizes
    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
        setWindowHeight(window.innerHeight);
      };
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load init data
    useEffect(() => {
      if(data && data.id && serverUrl){
        setLoading(true);
        var dataUrl = `${serverUrl}/get_player_similar_setup?id=${data.id}`;
        if(String(data.id).startsWith('p')){ // Mock Data case
          dataUrl = `${process.env.PUBLIC_URL}/MockData/Players/${data.id}/similar.json`;
        }
      
        // Fetch the JSON file
        fetch(dataUrl, {
            method: 'GET',
            headers: {
                "ngrok-skip-browser-warning":"69420",
            }
        })
          .then((response) => response.json())
          .then((data) => {
            setRadar(data.payload.radar_chart)
            setPossibleStats(data.payload.stats.sort())
            setSelectedStats([])
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching data: ", error);
            setError(error);
            setLoading(false);
          });
      }
    }, [data, serverUrl]);

    // Load graph data
    useEffect(() => {
      if(data && data.id && selectedStats && selectedStats.length > 0 && serverUrl){
        setLoading(true);
        console.log(selectedStats)
        var dataUrl = `${serverUrl}/get_player_similar?id=${data.id}&stats=${selectedStats}`;
        //var dataUrl = null
        if(String(data.id).startsWith('p')){ // Mock Data case
          dataUrl = null
          if(selectedStats.length === 1) {
            dataUrl = `${process.env.PUBLIC_URL}/MockData/Players/${data.id}/similar_1D.json`;
          } else if(selectedStats.length === 2) {
            dataUrl = `${process.env.PUBLIC_URL}/MockData/Players/${data.id}/similar_2D.json`;
          } else if(selectedStats.length === 3) {
            dataUrl = `${process.env.PUBLIC_URL}/MockData/Players/${data.id}/similar_3D.json`;
          }
        }
    
        // Fetch the JSON file
        if(dataUrl){
          fetch(dataUrl, {
              method: 'GET',
              headers: {
                  "ngrok-skip-browser-warning":"69420",
              }
          })
          .then((response) => response.json())
          .then((data) => {
            setScatterData(data.payload.scatter);
            setPcaData(data.payload.loadings);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching data: ", error);
            setError(error);
            setLoading(false);
          });
        } else {
          setScatterData(null);
          setPcaData(null);
          setLoading(false);
        }
      }
    }, [selectedStats, data, serverUrl]);

    function drawRadarChart(container, input_radar) {
      console.log(input_radar)
      console.log(radar)

      const cfg = {
        w: 200, // Width of the circle
        h: 200, // Height of the circle
        margin: { top: 25, right: 25, bottom: 25, left: 25 },
        levels: 5, // How many levels or inner circles
        maxValue:  100, // Maximum value of the chart
        labelFactor: 1.1, // Positioning of labels
        opacityArea: 0.15, // Opacity of areas
        dotRadius: 4, // Size of the dot
        opacityCircles: 0.1, // Opacity of circles
        strokeWidth: 2, // Width of stroke
        roundStrokes: false,
        color: ['gold', 'steelblue'] // Color scale
      };

      const totalWidth = cfg.w + cfg.margin.left + cfg.margin.right;
      const totalHeight = cfg.h + cfg.margin.top + cfg.margin.bottom;

      container.select('*').remove();

      let svg = container.append("svg")
        .attr("width", totalWidth)
        .attr("height", totalHeight)
        .append("g")
        .attr("transform", `translate(${cfg.w / 2 + cfg.margin.left}, ${cfg.h / 2 + cfg.margin.top})`);

      // Create a radial scale for the radius of the radar chart
      const radius = Math.min(cfg.w / 2, cfg.h / 2);
      const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, cfg.maxValue]);

      const axes = Object.keys(input_radar)
      const angleSlice = Math.PI * 2 / axes.length;

      // Draw the circles
      for(let i = 0; i <= cfg.levels; ++i) {
        const r = radius * (i / cfg.levels);
        svg.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", r)
          .style("fill", "none")
          .style("stroke", "grey")
          .style("opacity", cfg.opacityCircles);
      }

      // Draw the axes
      const axis = svg.selectAll(".axis")
        .data(axes)
        .enter().append("g")
        .attr("class", "axis");

      axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => rScale(cfg.maxValue) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => rScale(cfg.maxValue) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("class", "line")
        .style("stroke", "grey")
        .style("stroke-width", "1px");

      // Draw the labels
      axis.append("text")
        .attr("class", "legend")
        .style("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", (d, i) => (rScale(cfg.maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2)))
        .attr("y", (d, i) => (rScale(cfg.maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2)))
        .text(d => d);

      // Draw the radar area
      const radarLine = d3.lineRadial()
        .curve(cfg.roundStrokes ? d3.curveCardinalClosed : d3.curveLinearClosed)
        .radius(d => rScale(d))
        .angle((d, i) => i * angleSlice);

      svg.selectAll(".area")
        .data([Object.values(radar)])
        .enter().append("path")
        .attr("class", "radarArea")
        .attr("d", radarLine)
        .style("fill", cfg.color[0])
        .style("fill-opacity", cfg.opacityArea)
        .style("stroke", cfg.color[0])
        .style("stroke-width", cfg.strokeWidth + "px");

      svg.selectAll(".area")
        .data([Object.values(input_radar)])
        .enter().append("path")
        .attr("class", "radarArea")
        .attr("d", radarLine)
        .style("fill", cfg.color[1])
        .style("fill-opacity", cfg.opacityArea)
        .style("stroke", cfg.color[1])
        .style("stroke-width", cfg.strokeWidth + "px");
    }

    // Draw scatter plot
    useEffect(() => {
      if (scatterContainer.current) {
        const svg = d3.select(scatterContainer.current)
          .style('overflow', 'visible');

        // Clear SVG and legend to prevent duplication
        svg.selectAll("*").remove();

        // Set the dimensions and margins of the graph
        const margin = {top: 50, right: 50, bottom: 50, left: 50},
            width = 0.6*windowWidth - margin.left - margin.right,
            height = 0.80*windowHeight - margin.top - margin.bottom;

        // Append the svg object to the body of the page
        const g = svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top + height})`);     

        svg.append("clipPath")
          .attr("id", "plotClip")
          .append("rect")
          .attr("width", width) 
          .attr("height", height) 
          .attr("x", 0)
          .attr("y", 0);
        svg.append("clipPath")
          .attr("id", "axisClip") 
          .append("rect")
          .attr("width", width + 40)
          .attr("height", height) 
          .attr("x", -20)
          .attr("y", 0);
          
        if(!scatterData || selectedStats.length === 0) {
          // Add labels
          g.append("text")
          .attr("class", "graph-title") // Assign a class for easy selection
          .attr("x", width / 2) // Position at half of the width
          .attr("y", -20) // Position from the top of the SVG
          .attr("text-anchor", "middle") // Ensure the text is centered
          .text("Similar Players");

          // Add border
          g.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "none") // No fill to only show the border
          .attr("stroke", "grey") // Border color
          .attr("stroke-width", 1);
        } else if(scatterData && selectedStats.length === 1) {
          // Add labels
          g.append("text")
          .attr("class", "graph-title") 
          .attr("x", width / 2) 
          .attr("y", -20) 
          .attr("text-anchor", "middle") 
          .text("Similar Players");

          g.append("text")
          .attr("class", "x-axis-label")
          .attr("x", width / 2) 
          .attr("y", height + margin.top) 
          .attr("text-anchor", "middle")
          .text("Principle Component 1");
        
          // Add axes
          const xDomain = d3.extent(scatterData.points, point => point.x);
          const xDomainSize = xDomain[1] - xDomain[0];
          const x = d3.scaleLinear()
            .domain([xDomain[0] - 0.1*xDomainSize, xDomain[1] + 0.1*xDomainSize])
            .range([0, width]);

          const xTicks = x.ticks(10);
          g.append("g")
            .attr("class", "pcaXaxis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickValues(xTicks));

          const yDomain = d3.extent(scatterData.points, point => point.y);
          const y = d3.scaleLinear()
            .domain([yDomain[0] - 1, yDomain[1] + 25])
            .range([ height, 0 ]);

          g.append("line")
            .attr("class", "horizontal-line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", height)
            .attr("y2", height)
            .attr("stroke", "rgb(0,0,0)")
            .attr("stroke-width", 1);

          // Plot the points
          g.selectAll('circle')
            .data(scatterData.points)
            .enter().append('circle')
            .attr('cx', d => x(d.x))
            .attr('cy', d => y(d.y))
            .attr('r', 15)
            .attr('fill', d => d.id === data.id ? 'gold' : 'steelblue')
            .attr("clip-path", "url(#plotClip)")
            .on("mouseover", function(event, d) {
              const radarContainer = d3.select('#radarChartContainer');
              radarContainer.style('display', 'block'); 
              drawRadarChart(radarContainer, d.radar_chart);

              g.append("text")
                .attr("x", x(d.x))
                .attr("y", y(d.y) - 10)
                .attr("class", "tooltip")
                .text(`Name: ${d.name}`);
            })
            .on("mousemove", function(event) {
              // Update the position of the tooltip based on the mouse position
              d3.select('#radarChartContainer')
                  .style('left', (event.pageX - 0.04*windowWidth) + 'px') // Offset by 15px to avoid cursor overlap
                  .style('top', (event.pageY - 0.85*windowHeight - 350) + 'px');
            })
            .on("mouseout", function() {
              d3.select('#radarChartContainer').style('display', 'none');

              g.selectAll(".tooltip").remove(); // Remove tooltip
            });

          // Define the zoom behavior
          const zoom = d3.zoom()
              .scaleExtent([0.1, 10])  // This controls the zoom level
              .on("zoom", (event) => {
                  // Update scales with new zoom/pan parameters
                  const new_xScale = event.transform.rescaleX(x);

                  // Update axes
                  const newXTicks = new_xScale.ticks(10);
                  g.select(".pcaXaxis").call(d3.axisBottom(new_xScale).tickValues(newXTicks));

                  // Update your elements with the new scales
                  g.selectAll('circle')  // For example, if you have circles in your plot
                      .attr('cx', d => new_xScale(d.x))
                      .on("mouseover", function(event, d) {
                        const radarContainer = d3.select('#radarChartContainer');
                        radarContainer.style('display', 'block'); 
                        drawRadarChart(radarContainer, d.radar_chart);

                        g.append("text")
                          .attr("x", new_xScale(d.x))
                          .attr("y", y(d.y) - 10)
                          .attr("class", "tooltip")
                          .text(`Name: ${d.name}`);
                      });
              });

          // Apply the zoom behavior
          svg.call(zoom);
        } else if(scatterData) {
          // Add labels
          g.append("text")
          .attr("class", "x-axis-label")
          .attr("x", width / 2) 
          .attr("y", height + margin.top) 
          .attr("text-anchor", "middle") 
          .text("Principle Component 1");

          g.append("text")
          .attr("class", "y-axis-label")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2) 
          .attr("y", -margin.left + 20) 
          .attr("text-anchor", "middle")
          .text("Principle Component 2"); 

          g.append("text")
          .attr("class", "graph-title") 
          .attr("x", width / 2) 
          .attr("y", -20)
          .attr("text-anchor", "middle") 
          .text("Similar Players");

          // Add X axis
          const xDomain = d3.extent(scatterData.points, point => point.x);
          const xDomainSize = xDomain[1] - xDomain[0];
          const x = d3.scaleLinear()
            .domain([xDomain[0] - 0.1*xDomainSize, xDomain[1] + 0.1*xDomainSize])
            .range([ 0, width ]);
          const xTicks = x.ticks(10);
          g.append("g")
            .attr("class", "pcaXaxis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickValues(xTicks));

          // Add Y axis
          const yDomain = d3.extent(scatterData.points, point => point.y);
          const yDomainSize = yDomain[1] - yDomain[0];
          const y = d3.scaleLinear()
            .domain([yDomain[0] - 0.1*yDomainSize, yDomain[1] + 0.1*yDomainSize])
            .range([ height, 0 ]);
          const yTicks = y.ticks(10);
          g.append("g")
            .attr("class", "pcaYaxis")
            .call(d3.axisLeft(y).tickValues(yTicks));

          xTicks.forEach((xTick) => {
            yTicks.forEach((yTick) => {
              g.append("line")
                .attr("class", "vertical-line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", y(yTick))
                .attr("y2", y(yTick))
                .attr("stroke", (xTick===0 && yTick===0) ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.01)")
                .attr("stroke-dasharray", (xTick===0 && yTick===0) ? "4,2" : "0,0")
                .attr("stroke-width", 1);
              g.append("line")
                .attr("class", "horizontal-line")
                .attr("x1", x(xTick))
                .attr("x2", x(xTick))
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", (xTick===0 && yTick===0) ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.01)")
                .attr("stroke-dasharray", (xTick===0 && yTick===0) ? "4,2" : "0,0")
                .attr("stroke-width", 1);
            })
          })

          // Plot the points
          g.selectAll('circle')
            .data(scatterData.points)
            .enter().append('circle')
            .attr("clip-path", "url(#plotClip)")
            .attr('cx', d => x(d.x))
            .attr('cy', d => y(d.y))
            .attr('r', 15)
            .attr('fill', d => d.id === data.id ? 'gold' : 'steelblue')
            .on("mouseover", function(event, d) {
              const radarContainer = d3.select('#radarChartContainer');
              radarContainer.style('display', 'block'); 
              drawRadarChart(radarContainer, d.radar_chart);

              g.append("text")
                .attr("x", x(d.x))
                .attr("y", y(d.y) - 10)
                .attr("class", "tooltip")
                .text(`Name: ${d.name}`);
            })
            .on("mousemove", function(event) {
              // Update the position of the tooltip based on the mouse position
              d3.select('#radarChartContainer')
                  .style('left', (event.pageX - 0.04*windowWidth) + 'px') // Offset by 15px to avoid cursor overlap
                  .style('top', (event.pageY - 0.85*windowHeight - 350) + 'px');
            })
            .on("mouseout", function() {
              d3.select('#radarChartContainer').style('display', 'none');

              g.selectAll(".tooltip").remove(); // Remove tooltip
            });
          // Define the zoom behavior
          const zoom = d3.zoom()
              .scaleExtent([0.1, 10])  // This controls the zoom level
              .on("zoom", (event) => {
                  // Update scales with new zoom/pan parameters
                  const new_xScale = event.transform.rescaleX(x);
                  const new_yScale = event.transform.rescaleY(y);

                  // Update axes
                  const newXTicks = new_xScale.ticks(10)
                  const newYTicks = new_yScale.ticks(10)
                  g.select(".pcaXaxis").call(d3.axisBottom(new_xScale).tickValues(newXTicks));
                  g.select(".pcaYaxis").call(d3.axisLeft(new_yScale).tickValues(newYTicks));

                  // Update your elements with the new scales
                  g.selectAll('circle')  // For example, if you have circles in your plot
                      .attr('cx', d => new_xScale(d.x))
                      .attr('cy', d => new_yScale(d.y))
                      .on("mouseover", function(event, d) {
                        const radarContainer = d3.select('#radarChartContainer');
                        radarContainer.style('display', 'block');
                        drawRadarChart(radarContainer, d.radar_chart);
                        g.append("text")
                          .attr("x", new_xScale(d.x))
                          .attr("y", new_yScale(d.y) - 10)
                          .attr("class", "tooltip")
                          .text(`Name: ${d.name}`);
                      });
              })
              .on("end", (event) => {
                  // Update scales with new zoom/pan parameters
                  const new_xScale = event.transform.rescaleX(x);
                  const new_yScale = event.transform.rescaleY(y);

                  // Update axes
                  const newXTicks = new_xScale.ticks(10)
                  const newYTicks = new_yScale.ticks(10)
                  g.select(".pcaXaxis").call(d3.axisBottom(new_xScale).tickValues(newXTicks));
                  g.select(".pcaYaxis").call(d3.axisLeft(new_yScale).tickValues(newYTicks));

                  g.selectAll(".vertical-line").remove();
                  g.selectAll(".horizontal-line").remove();
                  newXTicks.forEach((xTick) => {
                    newYTicks.forEach((yTick) => {
                      g.append("line")
                        .attr("class", "vertical-line")
                        .attr("x1", 0)
                        .attr("x2", width)
                        .attr("y1", new_yScale(yTick))
                        .attr("y2", new_yScale(yTick))
                        .attr("stroke", (xTick===0 && yTick===0) ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.01)")
                        .attr("stroke-dasharray", (xTick===0 && yTick===0) ? "4,2" : "0,0")
                        .attr("stroke-width", 1);
                      g.append("line")
                        .attr("class", "horizontal-line")
                        .attr("x1", new_xScale(xTick))
                        .attr("x2", new_xScale(xTick))
                        .attr("y1", 0)
                        .attr("y2", height)
                        .attr("stroke", (xTick===0 && yTick===0) ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.01)")
                        .attr("stroke-dasharray", (xTick===0 && yTick===0) ? "4,2" : "0,0")
                        .attr("stroke-width", 1);
                    })
                  })

                  // Update your elements with the new scales
                  g.selectAll('circle')  // For example, if you have circles in your plot
                      .attr('cx', d => new_xScale(d.x))
                      .attr('cy', d => new_yScale(d.y))
                      .on("mouseover", function(event, d) {
                        const radarContainer = d3.select('#radarChartContainer');
                        radarContainer.style('display', 'block');
                        drawRadarChart(radarContainer, d.radar_chart);

                        g.append("text")
                          .attr("x", new_xScale(d.x))
                          .attr("y", new_yScale(d.y) - 10)
                          .attr("class", "tooltip")
                          .text(`Name: ${d.name}`);
                      })
                      .on("mousemove", function(event) {
                        // Update the position of the tooltip based on the mouse position
                        d3.select('#radarChartContainer')
                            .style('left', (event.pageX - 0.04*windowWidth) + 'px') // Offset by 15px to avoid cursor overlap
                            .style('top', (event.pageY - 0.85*windowHeight - 350) + 'px');
                      })
                      .on("mouseout", function() {
                        d3.select('#radarChartContainer').style('display', 'none');

                        g.selectAll(".tooltip").remove(); // Remove tooltip
                      });
              });

          // Apply the zoom behavior
          svg.call(zoom);
        }
      }
    }, [scatterData, selectedStats, data, windowWidth, windowHeight]); // Redraw chart if data changes

    // Draw PCA Loadings
    useEffect(() => {
      if (pcaContainer.current) {
        const svg = d3.select(pcaContainer.current)
          .style('overflow', 'visible');

        // Clear SVG and legend to prevent duplication
        svg.selectAll("*").remove();

        // Set the dimensions and margins of the graph
        const margin = {top: 50, right: 50, bottom: 50, left: 50},
            width = 0.3*windowWidth - margin.left - margin.right,
            height = 0.375*windowHeight - margin.top - margin.bottom;

        // Append the svg object to the body of the page
        const g = svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top + height})`);     

        if(!pcaData) {
          // Add labels
          g.append("text")
          .attr("class", "graph-title")
          .attr("x", width / 2) 
          .attr("y", -20) 
          .attr("text-anchor", "middle") 
          .text(`Similar Players PCA Loadings Plot`);

          // Add border
          g.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "none") // No fill to only show the border
          .attr("stroke", "grey") // Border color
          .attr("stroke-width", 1);
        } else {
          g.append("text")
          .attr("class", "x-axis-label")
          .attr("x", width / 2)
          .attr("y", height + margin.top - 10) 
          .attr("text-anchor", "middle") 
          .text("Principal Component 1");
  
          g.append("text")
          .attr("class", "y-axis-label")
          .attr("transform", "rotate(-90)") 
          .attr("x", -height / 2) 
          .attr("y", -margin.left + 20) 
          .attr("text-anchor", "middle")
          .text("Principal Component 2"); 
  
          g.append("text")
          .attr("class", "graph-title")
          .attr("x", width / 2) 
          .attr("y", -20) 
          .attr("text-anchor", "middle") 
          .text(`Similar Players PCA Loadings Plot`);
  
          // Add X axis
          const x = d3.scaleLinear()
            .domain([-1.5, 1.5])
            .range([ 0, width ]);
          const xTicks = x.ticks(10);
          g.append("g")
            .attr("class", "pcaXaxis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickValues(xTicks));
  
          // Add Y axis
          const y = d3.scaleLinear()
            .domain([-1.5, 1.5])
            .range([ height, 0 ]);
          const yTicks = x.ticks(10);
          g.append("g")
            .attr("class", "pcaYaxis")
            .call(d3.axisLeft(y).tickValues(yTicks));
          
          xTicks.forEach((xTick) => {
            yTicks.forEach((yTick) => {
              g.append("line")
                .attr("class", "vertical-line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", y(yTick))
                .attr("y2", y(yTick))
                .attr("stroke", (xTick===0 && yTick===0) ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.01)")
                .attr("stroke-dasharray", (xTick===0 && yTick===0) ? "4,2" : "0,0")
                .attr("stroke-width", 1);
              g.append("line")
                .attr("class", "horizontal-line")
                .attr("x1", x(xTick))
                .attr("x2", x(xTick))
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", (xTick===0 && yTick===0) ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.01)")
                .attr("stroke-dasharray", (xTick===0 && yTick===0) ? "4,2" : "0,0")
                .attr("stroke-width", 1);
            })
          })
  
          // Arrow head polygon
          svg.append("defs").append("marker")
          .attr("id", "arrowhead")
          .attr("viewBox", "0 -5 10 10")  // Coordinates in the viewbox to see the whole arrow
          .attr("refX", 5)  // Position where the line touches the arrow
          .attr("refY", 0)
          .attr("markerWidth", 6) 
          .attr("markerHeight", 6)
          .attr("orient", "auto")
        .append("path")
          .attr("d", "M0,-5L10,0L0,5")  // Path for the arrow shape
          .attr("class", "arrowHead")
          .attr("fill", "blue");
  
          for (const [key, value] of Object.entries(pcaData)) {
            var x1 = x(0)
            var x2 = x(value[0])
            var y1 = y(0)
            var y2 = y(value[1])
            var dx = x2 - x1;
            var dy = y2 - y1;
  
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const textAngle = angle > 90 || angle < -90 ? angle + 180 : angle;
            const offset = 25;
            const offset_x = x2 + (offset * dx / length);
            const offset_y = y2 + (offset * dy / length);
  
            g.append("line")
            .attr("x1", x1)
            .attr("x2", x2)
            .attr("y1", y1)
            .attr("y2", y2)
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)")
  
            g.append("text")
            .attr("class", "loadings-label")
            .attr("x", offset_x)
            .attr("y", offset_y)
            .attr("text-anchor", "middle") 
            .attr("transform", `rotate(${textAngle},${offset_x},${offset_y})`)
            .text(key);
          }
        }
      }
    }, [pcaData, selectedStats, data, windowWidth, windowHeight]);

    if (loading) return <div className='row playerGraphContainer'><LoadingPage /></div>;
    if (error) return <div className='row playerGraphContainer'><ErrorPage /></div>;
    return (
        <div className='row playerGraphContainer'>
          <Joyride 
            steps={steps}
            run={runTour}
            continuous={true}
            showProgress={true}
            showSkipButton={true}
            callback={handleJoyrideCallback}
            styles={{
              options: {
                zIndex: 10000
              },
            }}
          />
          <div className='col-8 playerSimilarGraphContainer'>
            <svg
              id="similarGraph"
              className='graphComponent'
              ref={scatterContainer}
            />
          </div>
          <div id="radarChartContainer" style={{ position: 'absolute', display: 'none' }}></div>
          <div className='col-4'>
            <div className='row playerSimilarLegendContainer'>
              <div id="statLegend" className='col-1 playerSimilarLegendBox'>
                <h3>Legend:</h3>
                  <div key={data.id} className='row similarLegendItem'>
                    <div className='similarLegendName'>
                      {data.name}: 
                    </div>
                    <div className='similarLegendColor' style={{backgroundColor: "gold"}} />
                    <br/>
                  </div>
                  <div key='other' className='row similarLegendItem'>
                    <div className='similarLegendName'>
                      Other: 
                    </div>
                    <div className='similarLegendColor' style={{backgroundColor: "steelblue"}} />
                    <br/>
                  </div>
              </div>
              <div id="statSelect" className='col-1 playerSimilarLegendBox'>
                <div id='pbpJoyride' className='joyrideIcon' onClick={startTour}>
                  <FontAwesomeIcon className='joyrideIcon' icon={faCircleQuestion} />
                </div>
                <h3>Select Stats:</h3>
                <form>
                {possibleStats.map(option => (
                  <label key={option}>
                    <input
                      key={option}
                      type="checkbox"
                      value={option}
                      onChange={handleCheckboxChange}
                      checked={selectedStats.includes(option)}
                    />
                    {option}
                    <br/>
                  </label>
                ))}
                </form>
              </div>
            </div>
            <div className='row playerSimilarPCAContainer'>
              <svg
                id="similarPCA"
                className='graphComponent'
                ref={pcaContainer}
              />
            </div>
          </div>
        </div>
    );
}

export default PlayerSimilar;
