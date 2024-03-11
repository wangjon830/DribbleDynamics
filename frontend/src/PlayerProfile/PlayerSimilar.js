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

    const scatterContainer = useRef(null);
    const pcaContainer = useRef(null);

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

    // Load data
    useEffect(() => {
      setLoading(true);
      const dataUrl = `${process.env.PUBLIC_URL}/MockData/Players/${data.id}/similar.json`;
    
      // Fetch the JSON file
      fetch(dataUrl)
        .then((response) => response.json())
        .then((data) => {
          setPossibleStats(data.payload.stats.sort())
          setSelectedStats(data.payload.stats.sort())
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
      if (selectedStats && scatterContainer.current) {
        const svg = d3.select(scatterContainer.current);

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

        // Add labels
        g.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2) // Center the text
        .attr("y", height + margin.top) // Position below the x-axis line
        .attr("text-anchor", "middle") // Ensure the text is centered
        .text("Principle Component 1");

        g.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)") // Rotate the text
        .attr("x", -height / 2) // Center the text along the y-axis
        .attr("y", -margin.left + 20) // Position to the left of the y-axis
        .attr("text-anchor", "middle") // Ensure the text is centered after rotation
        .text("Principle Component 2"); // The label text for the y-axis

        g.append("text")
        .attr("class", "graph-title") // Assign a class for easy selection
        .attr("x", width / 2) // Position at half of the width
        .attr("y", -20) // Position from the top of the SVG
        .attr("text-anchor", "middle") // Ensure the text is centered
        .text("Similar Players");

        // Add X axis
        const x = d3.scaleLinear()
          .domain([-1, 1])
          .range([ 0, width ]);
        const xTicks = x.ticks(10);
        g.append("g")
          .attr("class", "pcaXaxis")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x).tickValues(xTicks));

        // Add Y axis
        const y = d3.scaleLinear()
          .domain([-1, 1])
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
      }
    }, [selectedStats, windowWidth, windowHeight]); // Redraw chart if data changes

    // Draw PCA Loadings
    useEffect(() => {
      if (pcaContainer.current) {
        const svg = d3.select(pcaContainer.current);

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

        // Add labels
        g.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2) // Center the text
        .attr("y", height + margin.top - 10) // Position below the x-axis line
        .attr("text-anchor", "middle") // Ensure the text is centered
        .text("Principal Component 1");

        g.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)") // Rotate the text
        .attr("x", -height / 2) // Center the text along the y-axis
        .attr("y", -margin.left + 20) // Position to the left of the y-axis
        .attr("text-anchor", "middle") // Ensure the text is centered after rotation
        .text("Principal Component 2"); // The label text for the y-axis

        g.append("text")
        .attr("class", "graph-title") // Assign a class for easy selection
        .attr("x", width / 2) // Position at half of the width
        .attr("y", -20) // Position from the top of the SVG
        .attr("text-anchor", "middle") // Ensure the text is centered
        .text(`Similar Players PCA Loadings Plot`);

        // Add X axis
        const x = d3.scaleLinear()
          .domain([-1, 1])
          .range([ 0, width ]);
        const xTicks = x.ticks(10);
        g.append("g")
          .attr("class", "pcaXaxis")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x).tickValues(xTicks));

        // Add Y axis
        const y = d3.scaleLinear()
          .domain([-1, 1])
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

      }
    }, [selectedStats, windowWidth, windowHeight]);

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
                zIndex: 10000, // Make sure Joyride renders above your content
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
          <div className='col-4'>
            <div className='row playerSimilarLegendContainer'>
              <div id="statLegend" className='col-1 playerSimilarLegendBox'>
                <h3>Legend:</h3>
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
