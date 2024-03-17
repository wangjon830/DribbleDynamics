import '../shared/App.css';
import './PlayerProfile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';

import React, { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import Joyride from 'react-joyride';

import LoadingPage from '../shared/LoadingPage';
import ErrorPage from '../shared/ErrorPage';

function PlayerProgression({data}) {
    // Joyride
    const [runTour, setRunTour] = useState(false);
    const steps = [
      {
        target: '#statSelect',
        content: "Select which stats you'd like to visualize"
      },
      {
        target: '#statLegend',
        content: "Your chosen stats will be assigned a color in the graphs"
      },
      {
        target: '#progressionGraphOverlay',
        content: "View your player's corresponding career stat progressions on the graph"
      },
      {
        target: '#progressionBrushOverlay',
        content: "Select a desired range of seasons to view on the graph"
      },
      {
        target: '#progressionHistogram',
        content: "See your player's game distribution of performances per stat over the selected seasons"
      }
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

    const lineContainer = useRef(null);
    const histogramContainer = useRef(null);
    const [careerAverages, setPoints] = useState(null);
    const [gamesPer, setGamesPer] = useState(null);
    const [possibleStats, setPossibleStats] = useState([]);
    const [selectedStats, setSelectedStats] = useState([]);
    const [legend, setLegend] = useState([])
    const [brushRange, setBrushRange] = useState([0,0])

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

    // Load data
    useEffect(() => {
      setLoading(true);
      const dataUrl = `${process.env.PUBLIC_URL}/MockData/Players/${data.id}/career.json`;
    
      // Fetch the JSON file
      fetch(dataUrl)
        .then((response) => response.json())
        .then((data) => {
          setPoints(data.payload.career_stats.seasonAverages);
          setGamesPer(data.payload.career_stats.gamesPer);
          setPossibleStats(data.payload.career_stats.stats.sort())
          setSelectedStats(data.payload.career_stats.stats.sort())
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
          setError(error);
          setLoading(false);
        });
    }, [data]);

    // Draw Line plot
    useEffect(() => {
      if (careerAverages && selectedStats && lineContainer.current) {
        const svg = d3.select(lineContainer.current)
          .style('overflow', 'visible');

        // Clear SVG and legend to prevent duplication
        svg.selectAll("*").remove();
        setLegend([])

        // Set the dimensions and margins of the graph
        const margin = {top: 50, right: 50, bottom: 50, left: 50},
            width = 0.525*windowWidth - margin.left - margin.right,
            height = 0.7*windowHeight - margin.top - margin.bottom,
            subheight = 0.2*windowHeight - margin.top - margin.bottom;;

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

        // Add X axis
        const yearDomain = d3.extent(careerAverages, d => d.season)
        const startYear = yearDomain[0] - 1
        const endYear = yearDomain[1] + 1
        var yearTicks = d3.range(startYear, endYear + 1).map(year => new Date(year, 0));
        var subYearTicks = d3.range(startYear, endYear + 1).map(year => new Date(year, 0));

        const x = d3.scaleTime()
          .domain([new Date(startYear, 0), new Date(endYear, 0)])
          .range([ 0, width ]);
        const xAxis = d3.axisBottom(x).tickValues(yearTicks).tickFormat(d3.timeFormat("%Y"));
        const subx = d3.scaleTime()
          .domain([new Date(startYear, 0), new Date(endYear, 0)])
          .range([ 0, width ]);
        const subxAxis = d3.axisBottom(subx).tickValues(subYearTicks).tickFormat(d3.timeFormat("%Y"));
        g.append("g")
          .attr("clip-path", "url(#axisClip)")
          .attr("class", "mainXaxis")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis);
        g.append("g")
          .attr("class", "subXaxis")
          .attr("clip-path", "url(#axisClip)")
          .attr("transform", `translate(0,${height + margin.top + subheight})`)
          .call(subxAxis);

        // Add Y axis
        const maxVal = careerAverages.reduce((max, obj) => {
          const vals = selectedStats.map(stat => obj[stat]);
          const currentMax = Math.max(...vals);
          return Math.max(max, currentMax);
        }, 0);
        const y = d3.scaleLinear()
          .domain([0, maxVal+1])
          .range([ height, 0 ]);
        const suby = d3.scaleLinear()
          .domain([0, maxVal+1])
          .range([height + margin.top + subheight, height + margin.top]);
        g.append("g")
          .attr("class", "mainYaxis")
          .call(d3.axisLeft(y));
        g.append("g")
          .attr("class", "subYaxis")
          .call(d3.axisLeft(suby));

        // Add the lines
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(selectedStats);

        selectedStats.forEach((stat) => {
          setLegend(prevLegend => [...prevLegend, {"stat":stat, "color":colorScale(stat)}].sort((a, b) => {return a.stat.localeCompare(b.stat)}))
          g.append("path")
          .attr("clip-path", "url(#plotClip)")
          .datum(careerAverages)
          .attr("class", `mainLine-${stat}`)
          .attr("fill", "none")
          .attr("stroke", colorScale(stat))
          .attr("stroke-width", 1.5)
          .attr("stat", stat)
          .attr("d", d3.line()
            .x(d => x(new Date(d.season, 0)))
            .y(d => y(d[stat]))
          );
          g.append("path")
          .datum(careerAverages)
          .attr("class", `subLine-${stat}`)
          .attr("fill", "none")
          .attr("stroke", colorScale(stat))
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(d => subx(new Date(d.season, 0)))
            .y(d => suby(d[stat]))
          );
          g.selectAll(".mainPoint")
          .data(careerAverages)
          .enter().append("circle")
            .attr("clip-path", "url(#plotClip)")
            .attr("cx", d => x(new Date(d.season, 0)))
            .attr("cy", d => y(d[stat]))
            .attr("r", 5)
            .attr("fill", colorScale(stat))
            .attr("class", `mainPoint-${stat}`)
            .on("mouseover", function(event, d) {
              d3.select(this).attr("r", 8); // Enlarge on hover
              g.append("text")
                .attr("x", x(new Date(d.season, 0)))
                .attr("y", y(d[stat]) - 35)
                .attr("class", "tooltip")
                .text(`Season: ${d.season}`);
              g.append("text")
                .attr("x", x(new Date(d.season, 0)))
                .attr("y", y(d[stat]) - 15)
                .attr("class", "tooltip")
                .text(`${stat}: ${d[stat]}`);
            })
            .on("mouseout", function() {
              d3.select(this).attr("r", 5); // Reset size
              g.selectAll(".tooltip").remove(); // Remove tooltip
            });
        });

        // Add labels
        g.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2) // Center the text
        .attr("y", height + margin.top + margin.bottom + subheight - 5) // Position below the x-axis line
        .attr("text-anchor", "middle") // Ensure the text is centered
        .text("Season");

        g.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)") // Rotate the text
        .attr("x", -height / 2) // Center the text along the y-axis
        .attr("y", -margin.left + 20) // Position to the left of the y-axis
        .attr("text-anchor", "middle") // Ensure the text is centered after rotation
        .text("Count"); // The label text for the y-axis

        g.append("text")
        .attr("class", "graph-title") // Assign a class for easy selection
        .attr("x", width / 2) // Position at half of the width
        .attr("y", -20) // Position from the top of the SVG
        .attr("text-anchor", "middle") // Ensure the text is centered
        .text("Career Stat Progression");

        // Add brushing
        const brush = d3.brushX() // Use brushX for a one-dimensional brush along the x-axis
        .extent([[margin.left, margin.top + height + margin.bottom], [width + margin.left, margin.top + height + margin.bottom + subheight]]) // Define the area where the brush can be applied
        .on("brush", onBrush);
        
        function onBrush(event) {
          if (event.selection) {
            const [x0, x1] = event.selection; // Convert from pixel coords to domain values
            const [season0, season1] = [x0 - margin.left, x1 - margin.left].map(subx.invert, subx);
            setBrushRange([season0.getFullYear(), season1.getFullYear()])
            x.domain([season0, season1]); // Update the main x-axis domain

            // Redraw the main x-axis
            g.select(".mainXaxis")
              .attr("clip-path", "url(#axisClip)")
              .call(xAxis.ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat("%Y")));

            // Redraw lines for each stat with the updated x-scale
            selectedStats.forEach(stat => {
              g.selectAll(`.mainLine-${stat}`) // Assuming lines have unique classes like 'mainLine-statName'
                .datum(careerAverages)
                .attr("clip-path", "url(#plotClip)")
                .attr("d", d3.line()
                  .x(d => x(new Date(d.season, 0)))
                  .y(d => y(d[stat]))
                );
            });
            selectedStats.forEach(stat => {
              g.selectAll(`.mainPoint-${stat}`) // Assuming points have unique classes like 'mainPoint-statName'
                .data(careerAverages)
                .attr("clip-path", "url(#plotClip)")
                .attr("cx", d => x(new Date(d.season, 0)))
                .attr("cy", d => y(d[stat]));
            });
          }
        }
        
        const brushG = svg.append("g")
          .attr("class", "brush")
          .call(brush);

        const initialSelection = [x(new Date(startYear, 0)) + margin.left, x(new Date(endYear, 0)) + margin.left];

        // Programmatically move the brush to the initial selection
        brushG.call(brush.move, initialSelection);
      }
    }, [careerAverages, selectedStats, windowWidth, windowHeight]); // Redraw chart if data changes

    // Draw histogram
    useEffect(() => {
      const bucketSize = 5;
      if (brushRange && gamesPer && histogramContainer.current) {
        var season0 = brushRange[0] + 1;
        var season1 = brushRange[1];

        const svg = d3.select(histogramContainer.current)
          .style('overflow', 'visible');

        // Clear SVG and legend to prevent duplication
        svg.selectAll("*").remove();

        // Set the dimensions and margins of the graph
        const margin = {top: 50, right: 50, bottom: 50, left: 50},
            width = 0.35*windowWidth - margin.left - margin.right,
            height = 0.425*windowHeight - margin.top - margin.bottom;

        // Append the svg object to the body of the page
        const g = svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top + height})`);     

        // Add labels
        g.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2) // Center the text
        .attr("y", height + margin.top - 10) // Position below the x-axis line
        .attr("text-anchor", "middle") // Ensure the text is centered
        .text("Count");

        g.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)") // Rotate the text
        .attr("x", -height / 2) // Center the text along the y-axis
        .attr("y", -margin.left + 20) // Position to the left of the y-axis
        .attr("text-anchor", "middle") // Ensure the text is centered after rotation
        .text("Games"); // The label text for the y-axis

        if(season0 > season1) {
          g.append("text")
          .attr("class", "graph-title") // Assign a class for easy selection
          .attr("x", width / 2) // Position at half of the width
          .attr("y", -20) // Position from the top of the SVG
          .attr("text-anchor", "middle") // Ensure the text is centered
          .text(`Games per stat`);
          // Add X axis
          const x = d3.scaleLinear()
            .domain([0, 1])
            .range([ 0, width ]);
          const xAxis = d3.axisBottom(x);
          g.append("g")
            .attr("clip-path", "url(#axisClip)")
            .attr("class", "mainXaxis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

          // Add Y axis
          const y = d3.scaleLinear()
            .domain([0, 1])
            .range([ height, 0 ]);
          g.append("g")
            .attr("class", "mainYaxis")
            .call(d3.axisLeft(y));

          return;
        }

        g.append("text")
        .attr("class", "graph-title") // Assign a class for easy selection
        .attr("x", width / 2) // Position at half of the width
        .attr("y", -20) // Position from the top of the SVG
        .attr("text-anchor", "middle") // Ensure the text is centered
        .text(`Games per stat ${season0}-${season1}`);

        // Initialize buckets
        var maxVal = 0;
        for(let i = season0; i <= season1; i++){
          if(i.toString() in gamesPer){
            let seasonMax = selectedStats.map((stat) => {
              return Math.max(...gamesPer[i.toString()][stat])
            });
            maxVal = Math.max(maxVal, ...seasonMax);
          }
        }
        const bucketRanges = d3.range(0, Math.ceil((maxVal)/bucketSize)*bucketSize + bucketSize + 1, bucketSize);
        const bucketCounts = {};
        var maxPerBucket = 0;
        for(let season = season0; season <= season1; season++){
          if(season.toString() in gamesPer){
            selectedStats.forEach(stat => {
              gamesPer[season.toString()][stat].forEach(value => {
                for (let bucket = 0; bucket < bucketRanges.length - 1; bucket++) {
                  if (value < bucketRanges[bucket + 1] && value >= bucketRanges[bucket]) {
                    if(!(stat in bucketCounts)) {
                      bucketCounts[stat] = new Array(bucketRanges.length).fill(0);
                    }
                    bucketCounts[stat][bucket]++;
                    maxPerBucket = Math.max(maxPerBucket, bucketCounts[stat][bucket])
                    break; // Stop checking once the correct bucket is found
                  }
                }
              });
            });
          }
        }

        // Add X axis
        const x = d3.scaleLinear()
          .domain([0, Math.max(...bucketRanges)])
          .range([ 0, width ]);
        const xAxis = d3.axisBottom(x).tickValues(bucketRanges);
        g.append("g")
          .attr("clip-path", "url(#axisClip)")
          .attr("class", "mainXaxis")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis);

        // Add Y axis
        const y = d3.scaleLinear()
          .domain([0, maxPerBucket])
          .range([ height, 0 ]);
        g.append("g")
          .attr("class", "mainYaxis")
          .call(d3.axisLeft(y));

        // Add the lines
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(selectedStats);

        // Calculate bar values
        const consolidatedBucketsData = bucketRanges.slice(0, -1).map((start, index) => ({
          rangeStart: start,
          rangeEnd: bucketRanges[index + 1],
          statsData: []
        }));
        selectedStats.forEach(stat => {
          if(stat in bucketCounts) {
            for(var index = 0; index < bucketCounts[stat].length-1; index ++) {
              consolidatedBucketsData[index].statsData.push({
                count: bucketCounts[stat][index],
                stat: stat
              });
            }
          }
        });
        // Sort statsData within each bucket based on count to ensure smaller bars are drawn first
        consolidatedBucketsData.forEach(bucket => {
          bucket.statsData.sort((a, b) => b.count - a.count);
        });

        consolidatedBucketsData.forEach((bucket, bucketIndex) => {
          bucket.statsData.forEach((statData, statIndex) => {
            g.append("rect")
              .attr("x", x(bucket.rangeStart) + 1)
              .attr("y", y(statData.count))
              .attr("width", x(bucket.rangeEnd) - x(bucket.rangeStart) - 2)
              .attr("height", height - y(statData.count))
              .attr("fill", colorScale(statData.stat))
              .style("opacity", 0.9)
              .on("mouseover", function(event, d) {
                d3.select(this)
                  .style("opacity", 1)
                  .style("stroke", "black")
                  .style("stroke-width", 2);
                g.append("text")
                  .attr("x", x(bucket.rangeStart) + 1)
                  .attr("y", y(statData.count) - 10)
                  .attr("class", "tooltip")
                  .text(`${statData.count} games`);
              })
              .on("mouseout", function(event, d) {
                d3.select(this)
                  .style("opacity", 0.75)
                  .style("stroke", "none");
                g.selectAll(".tooltip").remove();
              });
          });
        });

      }
    }, [gamesPer, brushRange, careerAverages, selectedStats, windowWidth, windowHeight]);

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
                zIndex: 10000,
              },
            }}
          />
          <div className='col-6 playerProgressionGraphContainer'>
            <div id="progressionGraphOverlay"/>
            <div id="progressionBrushOverlay"/>
            <svg
              id="progressionGraph"
              className='graphComponent'
              ref={lineContainer}
            />
          </div>
          <div className='col-4'>
            <div className='row playerProgressionLegendContainer'>
              <div id="statLegend" className='col-1 playerProgressionLegendBox'>
                <h3>Legend:</h3>
                {legend.map(option => (
                  <div key={option.stat} className='row careerLegendItem'>
                    <div className='careerLegendName'>
                      {option.stat}: 
                    </div>
                    <div className='careerLegendColor' style={{backgroundColor: option.color}} />
                    <br/>
                  </div>
                ))}
              </div>
              <div id='statSelect' className='col-1 playerProgressionLegendBox'>
                <div id='progressionJoyride' className='joyrideIcon' onClick={startTour}>
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
            <div className='row playerProgressionHistogramContainer'>
              <svg
                id='progressionHistogram'
                className='graphComponent'
                ref={histogramContainer}
              />
            </div>
          </div>
        </div>
    );
}

export default PlayerProgression;
