import '../shared/App.css';
import './PlayerProfile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';

import React, { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import Joyride from 'react-joyride';

import LoadingPage from '../shared/LoadingPage';
import ErrorPage from '../shared/ErrorPage';

function PlayerPBP({data}) {
    // Joyride
    const [runTour, setRunTour] = useState(false);
    const steps = [
      {
        target: '#pbpGameSelect',
        content: "Choose which game performance you'd like to see visualized. You can also choose to show all their career games"
      },
      {
        target: '#pbpGameCourt',
        content: "View the shots your player took over the game"
      },
      {
        target: '#pbpGameLegend',
        content: "Point color represents information about the shot type and status"
      },
      {
        target: '#pbpGameHover',
        content: "Hover points on the court to see information about those shots"
      },
      {
        target: '#pbpGameSlider',
        content: "Select a desired time range and traverse through the game chronologically"
      },
      {
        target: '#pbpGameScore',
        content: "View the score of the game at your selected time"
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

    const heatmapContainer = useRef(null);
    const sliderContainer = useRef(null);

    const [gameList, setGameList] = useState([]);
    const [selectedGame, setSelectedGame] = useState("default");
    const [gameInfo, setGameInfo] = useState({});
    const [currentGameInfo, setCurrentGameInfo] = useState({});
    const [currentGameScore, setCurrentGameScore] = useState([0,0]);
    const [hoveredShot, setHoveredShot] = useState({});

    const [timeRange, setTimeRange] = useState([0, 2880]);
    const [selectedTime, setSelectedTime] = useState([0, 2880])
    
    const [windowWidth, setWindowWidth] = useState(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0));
    const [windowHeight, setWindowHeight] = useState(Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0));

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
      const dataUrl = `${process.env.PUBLIC_URL}/MockData/Players/${data.id}/pbp.json`;
    
      // Fetch the JSON file
      fetch(dataUrl)
        .then((response) => response.json())
        .then((data) => {
          setGameList(data.payload.gameList);
          setGameInfo(data.payload.gameInfo);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
          setError(error);
          setLoading(false);
        });
    }, [data]);

    // Handle selection change
    const handleGameSelection = (event) => {
      setSelectedGame(event.target.value);
    };

    // Create Slider
    useEffect(() => {
      if (gameInfo && currentGameInfo && sliderContainer.current) {
        const svg = d3.select(sliderContainer.current);

        // Clear SVG to prevent duplication
        svg.selectAll("*").remove();

        // Set the dimensions and margins of the graph
        const margin = {top: 30, right: 100, bottom: 30, left: 100},
            width =  0.525*Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) - margin.left - margin.right,
            height = 0.1*Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - margin.top - margin.bottom;

        // Append the svg object to the body of the page
        const g = svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`)

        // Append border
        svg.append("rect")
          .attr("x", margin.left)
          .attr("y", margin.top)
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "none") // No fill to only show the border
          .attr("stroke", "black") // Border color
          .attr("stroke-width", 1);

        var x = d3.scaleLinear()
          .domain(timeRange) 
          .range([0, width]);

        // labels
        var labelL = g.append('text')
          .attr('id', 'labelleft')
          .attr('x', 0)
          .attr('y', height + 16)

        var labelR = g.append('text')
          .attr('id', 'labelright')
          .attr('x', 0)
          .attr('y', height + 16)

        // define brush
        function formatTime(seconds) {
          const minutes = Math.floor(seconds / 60);
          const new_seconds = Math.floor(seconds % 60);

          const formattedMinutes = minutes.toString();
          const formattedSeconds = new_seconds.toString().padStart(2, '0');

          return `${formattedMinutes}:${formattedSeconds}`;
        }

        var brush = d3.brushX()
          .extent([[0,0], [width, height]])
          .on('brush', function(event) {
              var s = event.selection;

              // update and move labels
              var text1 = (x.invert(s[0]).toFixed(2))
              var text2 = (x.invert(s[1]).toFixed(2))
              
              setSelectedTime([Math.floor(text1), Math.floor(text2)]);

              labelL
                .attr('x', s[0] - 45)
                .attr('y', height/2 + 5)
                .text(formatTime(text1))
              labelR
                .attr('x', s[1] + 10)
                .attr('y', height/2 + 5)
                .text(formatTime(text2))

              svg.node().value = s.map(function(d) {var temp = x.invert(d); return +temp.toFixed(2)});
              svg.node().dispatchEvent(new CustomEvent("input"));
          });
        

        // append brush to g
        var gBrush = g.append("g")
            .attr("class", "pbpSliderBrush")
            .call(brush);

        gBrush.selectAll(".overlay")
        .each(function(d) { d.type = "selection"; })
        .on("mousedown touchstart", brushcentered)
        
        function brushcentered(event) {
          var dx = x(180), // Use a fixed width when recentering.
          cx = d3.pointer(event, this)[0],
          x0 = cx - dx / 2,
          x1 = cx + dx / 2;
          d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
        }
        
        // select entire range
        const initialSelection = [x(timeRange[0]), x(timeRange[1])];
        gBrush.call(brush.move, initialSelection)

        // Draw vertical lines
        var lines = [{ x: 0, label:"Q1"},{ x: 720, label:"Q2"},{ x: 1440, label:"Q3"},{ x: 2160, label:"Q4"}]
        for(let i = 0; i < currentGameInfo.overtimes; i++) {
          lines.push({ x: 2880 + i*600, label:`OT${i+1}`})
        }

        g.selectAll(".vertical-line")
          .data(lines)
          .enter().append("line")
            .attr("class", "vertical-line")
            .attr("x1", d => x(d.x))
            .attr("x2", d => x(d.x))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "rgba(0,0,0,0.25)")
            .attr("stroke-width", 2)
            .on("mouseover", function(event, d) {
              g.append("text")
                .attr("x", x(d.x))
                .attr("y", -10)
                .attr("class", "tooltip")
                .text(d.label);
            })
            .on("mouseout", function() {
              g.selectAll(".tooltip").remove(); // Remove tooltip
            });
      }
    }, [gameInfo, currentGameInfo, timeRange, windowWidth, windowHeight]); // Redraw chart if data changes

    // Get current game
    useEffect(() => {
      var currentGame = {}
      var shots = []
      if(selectedGame === "all"){
        shots = []
        Object.keys(gameInfo).forEach((game) => {
          shots = shots.concat(gameInfo[game].shots.map(item => {
            return {...item, "teams":gameInfo[game].teams, "date":gameInfo[game].date}
          }));
        })  
        currentGame = {"shots": shots, "finalScore": ["NA", "NA"], "overtimes":0};
      } else if(selectedGame.toString() in gameInfo) {
        shots = gameInfo[selectedGame.toString()].shots.map(item => {
          return {...item, "teams":gameInfo[selectedGame.toString()].teams, "date":gameInfo[selectedGame.toString()].date}
        });
        currentGame = {"shots": shots, "finalScore": gameInfo[selectedGame.toString()].finalScore, "overtimes":gameInfo[selectedGame.toString()].overtimes};
      } else {
        currentGame = {"shots": shots, "finalScore": ["NA", "NA"], "overtimes":0};
      }

      setCurrentGameInfo(currentGame);
      setTimeRange([0, 2880 + currentGame["overtimes"]*300])
    }, [selectedGame, gameInfo])

    // Plot heatmap
    useEffect(() => {
      const imageUrl = `${process.env.PUBLIC_URL}/Images/court.png`;
      if (gameInfo && heatmapContainer.current) {
        const svg = d3.select(heatmapContainer.current);

        // Clear SVG to prevent duplication
        svg.selectAll("*").remove();

        // Set the dimensions and margins of the graph
        const margin = {top: 10, right: 20, bottom: 30, left: 20},
            width =  0.525*Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) - margin.left - margin.right,
            height = 0.70*Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - margin.top - margin.bottom;

        // Append the svg object to the body of the page
        const g = svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`)

        g.append('image')
          .attr('href', imageUrl)
          .attr("preserveAspectRatio", "none")
          .attr("x", 0)
          .attr("y", 0)
          .attr('width', width)
          .attr('height', height)
          .attr('opacity', 0.75);

        const x = d3.scaleLinear()
          .domain([-564, 564])
          .range([ 0, width ]);

        const y = d3.scaleLinear()
          .domain([-300, 300])
          .range([ height, 0 ]);

        if(currentGameInfo) {
          var sorted_shots = currentGameInfo.shots
          var shots_to_draw = [];
          sorted_shots.forEach(shot => {
            if(shot.time >= selectedTime[0] && shot.time <= selectedTime[1]) {
              shots_to_draw.push(shot);
              setCurrentGameScore([shot.score[0], shot.score[1]]);
            }
          });
          if(selectedTime[1] === timeRange[1]) {
            setCurrentGameScore(currentGameInfo.finalScore);
          }

          g.selectAll(".mainPoint")
          .data(shots_to_draw)
          .enter().append("circle")
            .attr("cx", d => x(d.x))
            .attr("cy", d => y(d.y))
            .attr("r", 8)
            .attr("fill", d=> d.miss ? d.type === "3" ? 'orange' : 'red' : d.type === "3" ? 'cyan' : 'lime')
            .on("mouseover", function(event, d) {
              d3.select(this).attr("r", 15);
              setHoveredShot(d);
            })
            .on("mouseout", function() {
              d3.select(this).attr("r", 8);
              setHoveredShot({});
            });
        }
      }
    }, [gameInfo, timeRange, currentGameInfo, selectedTime, windowWidth, windowHeight]); // Redraw chart if data changes

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
          <div id='pbpJoyride' className='joyrideIcon' onClick={startTour}>
            <FontAwesomeIcon className='joyrideIcon' icon={faCircleQuestion} />
          </div>
          <div className='col-1 pbpContainer'>
            <div className='row pbpSelectContainer'>
              <p className='graph-title'>Play by Play </p>
            </div>
            <div className='row '>
              <div className='col-4 '/>
              <div id="pbpGameSelect" className='col-4 pbpSelectContainer'>
                Select Game: &nbsp;
                <select id="pbpGameSelect" value={selectedGame} onChange={handleGameSelection}>
                    <option value="default" disabled> -- Select Game -- </option>
                    <option id={"all"} key={"all"} value={"all"}>
                      All Games
                    </option>
                  {gameList.map((option) => (
                    <option id={option.id} key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='col-4'/>
            </div>
            <div className='row pbpSliderContainer'>
              <div className='col-2' />
              <div id="pbpGameSlider" className='col-6 centerSvg'>
                <svg
                  className='graphComponent'
                  ref={sliderContainer}
                />
              </div>
              <div className='col-2' />
            </div>
            <div className='row pbpHeatmapContainer'>
              <div className='col col-2 pbpInfoContainer'>
                <div id="pbpGameLegend" className='pbpLegend'>
                  <div className='row pbpLegendHead'>
                    <p>Legend: </p>
                  </div>
                  <div className='row pbpLegendInfo'>
                    <p>Made&nbsp;2&nbsp;pointer:&nbsp;</p>
                    <div className='pbpLegendColor' style={{"backgroundColor":"lime"}}/>
                  </div>
                  <div className='row pbpLegendInfo'>
                    <p>Made&nbsp;3&nbsp;pointer:&nbsp;</p>
                    <div className='pbpLegendColor' style={{"backgroundColor":"cyan"}}/>
                  </div>
                  <div className='row pbpLegendInfo'>
                    <p>Missed&nbsp;2&nbsp;pointer:&nbsp;</p>
                    <div className='pbpLegendColor' style={{"backgroundColor":"red"}}/>
                  </div>
                  <div className='row pbpLegendInfo'>
                    <p>Missed&nbsp;3&nbsp;pointer:&nbsp;</p>
                    <div className='pbpLegendColor' style={{"backgroundColor":"orange"}}/>
                  </div>
                </div>
              </div>
              <div id="pbpGameCourt" className='col-6 centerSvg'>
                <svg
                  className='graphComponent'
                  ref={heatmapContainer}
                />
              </div>
              <div className='col col-2 pbpInfoContainer'>
                <div id="pbpGameScore" className='pbpScoreboard'>
                  <div className='row pbpScoreboardHead'>
                      { selectedTime[1] === timeRange[1] ? (
                          <p>Final Score</p>
                        ) : (
                          <p>Score</p>
                      )}
                  </div>
                  <div className='row pbpScoreboardTimeContainer'>
                    <div className='col-1'/>
                    <div className='col-1 pbpScoreboardTime'>
                      { selectedGame !== 'all' && selectedGame !== 'default' ? (
                          <p>{Math.floor(selectedTime[1]/60)}:{Math.floor(selectedTime[1]%60).toString().padStart(2, '0')}</p>
                        ) : (
                          <p>N/A</p>
                      )}
                    </div>
                    <div className='col-1'/>
                  </div>
                  <div className='row pbpScoreboardScore'>
                    <div className='col-1' />
                    <div className='col-6 pbpScoreboardNumber'>
                      { selectedGame !== 'all' && selectedGame !== 'default' ? (
                          <p>{currentGameScore[0]}</p>
                        ) : (
                          <p>N/A</p>
                      )}
                    </div>
                    <div className='col-1' />
                    <div className='col-6 pbpScoreboardNumber'>
                      { selectedGame !== 'all' && selectedGame !== 'default' ? (
                        <p>{currentGameScore[1]}</p>
                      ) : (
                        <p>N/A</p>
                      )}
                    </div>
                    <div className='col-1' />
                  </div>
                </div>
                <div id="pbpGameHover" className='pbpTooltip'>
                  <div className='row pbpTooltipHead'>
                    <p>Hovered Shot</p>
                  </div>
                  { Object.keys(hoveredShot).length !== 0 ? (
                      <div className='col'>
                        <div className='row pbpTooltipSubtitle'>
                          <p>Game</p>
                        </div>
                        <div className='row pbpTooltipInfo'>
                          <p>{hoveredShot.teams[1]} @ {hoveredShot.teams[0]} {hoveredShot.date}</p>
                        </div>
                        <div className='row pbpTooltipSubtitle'>
                          <p>Time</p>
                        </div>
                        <div className='row pbpTooltipInfo'>
                          <p>{Math.floor(hoveredShot.time/60)}:{Math.floor(hoveredShot.time%60).toString().padStart(2, '0')}</p>
                        </div>
                        <div className='row pbpTooltipSubtitle'>
                          <p>Distance</p>
                        </div>
                        <div className='row pbpTooltipInfo'>
                          <p>{hoveredShot.distance}ft</p>
                        </div>
                        <div className='row pbpTooltipSubtitle'>
                          <p>Shot type </p>
                        </div>
                        <div className='row pbpTooltipInfo'>
                          <p>{hoveredShot.type}</p>
                        </div>
                        <div className='row pbpTooltipSubtitle'>
                          <p>Result</p>
                        </div>
                        <div className='row pbpTooltipInfo'>
                          <p>{hoveredShot.miss ? "Miss" : "Make"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className='row pbpTooltipInfo'>
                        <p>None</p>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    );
}

export default PlayerPBP;
