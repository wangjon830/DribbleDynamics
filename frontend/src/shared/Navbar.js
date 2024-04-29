import { Link, useLocation } from 'react-router-dom';
import '../shared/App.css'
import '../shared/Navbar.css'; 
import 'react-toggle/style.css';
import React, { useEffect, useState } from 'react';
import Toggle from "react-toggle";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

function Navbar() {
    // Manage theme
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    // Manage Location
    const location = useLocation();
    const [pageType, setPageType] = useState("home");

    useEffect(() => {
        if(location.pathname.includes("playerList")){
            setPageType("playerList");
        } else if(location.pathname.includes("playerProfile")) {
            setPageType("playerProfile")
        } else if(location.pathname.includes("teamList")) {
            setPageType("teamList")
        } else {
            setPageType("home")
        }
    }, [location]);

    // Manage info visibility
    const [isInfoVisible, setIsInfoVisible] = useState(false);
    const toggleInfoOff = () => setIsInfoVisible(false);
    const toggleInfoOn = () => setIsInfoVisible(true);

    // Manage player dropdown visibility
    const [isPlayerVisible, setIsPlayerVisible] = useState(false);
    const togglePlayerOff = () => setIsPlayerVisible(false);
    const togglePlayerOn = () => setIsPlayerVisible(true);

    // Manage player dropdown visibility
    const [isTeamVisible, setIsTeamVisible] = useState(false);
    const toggleTeamOff = () => setIsTeamVisible(false);
    const toggleTeamOn = () => setIsTeamVisible(true);

    function PlayerProfileInfo() {
        return (
            <div id='nav-info' className='col-1 nav-link' onMouseEnter={toggleInfoOn} onMouseLeave={toggleInfoOff} >
                <div className='nav-text nav-icon'>
                    <FontAwesomeIcon icon={faBookOpen} />
                </div>
                {isInfoVisible && 
                    <div className="info-menu">
                        <h1 className='title'>Terms:</h1>
                        <p className='term'> <strong>PPG:</strong> Points&nbsp;Per&nbsp;Game</p>
                        <p className='term'> <strong>APG:</strong> Assists&nbsp;Per&nbsp;Game</p>
                        <p className='term'> <strong>RPG:</strong> Rebounds&nbsp;Per&nbsp;Game</p>
                        <p className='term'> <strong>BPG:</strong> Blocks&nbsp;Per&nbsp;Game</p>
                        <p className='term'> <strong>SPG:</strong> Steals&nbsp;Per&nbsp;Game</p>
                        <p className='term'> <strong>TPG:</strong> Turnovers&nbsp;Per&nbsp;Game</p>
                        <p className='term'> <strong>FPG:</strong> Fouls&nbsp;Per&nbsp;Game</p>
                        <p className='term'> <strong>FGA:</strong> Field&nbsp;Goal&nbsp;Attempts</p>
                        <p className='term'> <strong>FGM:</strong> Field&nbsp;Goals&nbsp;Made</p>
                        <p className='term'> <strong>FGP:</strong> Field&nbsp;Goal&nbsp;Percentage</p>
                        <p className='term'> <strong>TPA:</strong> Three&nbsp;Pointer&nbsp;Attempts</p>
                        <p className='term'> <strong>TPM:</strong> Three&nbsp;Pointers&nbsp;Made</p>
                        <p className='term'> <strong>TPP:</strong> Three&nbsp;Pointer&nbsp;Percentage</p>
                        <p className='term'> <strong>FTA:</strong> Free&nbsp;Throw&nbsp;Attempts</p>
                        <p className='term'> <strong>FTM:</strong> Free&nbsp;Throws&nbsp;Made</p>
                        <p className='term'> <strong>FTP:</strong> Free&nbsp;Throw&nbsp;Percentage</p>
                    </div>
                }
            </div>
        )
    }

    return (
        <div id="navbar" className='container sticky'>
            <div className="nav-main row">
                <div className='col-4' />
                <div id='nav-player' className='col-1 nav-link' onMouseEnter={togglePlayerOn} onMouseLeave={togglePlayerOff} >
                    <div className='nav-text nav-sub-text'>
                        <p>Players</p>
                    </div>
                    {isPlayerVisible && 
                        <div className="player-menu">
                            <Link id='navPlayerList' to="/playerList">
                                <div id="player-link-1" className='menu-link'>
                                    <p>Player Profiles</p>
                                </div>
                            </Link>
                            <Link id='navPlayerPortal' to="/playerPortal">
                                <div id="player-link-2" className='menu-link'>
                                    <p>Player Portal</p>
                                </div>
                            </Link>
                        </div>
                    }
                </div>
                <Link id='nav-home' className='col-2 nav-link' to="/">
                    <div className='nav-text nav-main-text'>
                        <p>Dribble <br /> Dynamics</p>
                    </div>
                </Link>
                <div id='nav-team' className='col-1 nav-link' onMouseEnter={toggleTeamOn} onMouseLeave={toggleTeamOff} >
                    <div className='nav-text nav-sub-text'>
                        <p>Teams</p>
                    </div>
                    {isTeamVisible && 
                        <div className="player-menu">
                            <Link id='navTeanList' to="/teamList">
                                <div id="team-link-1" className='menu-link'>
                                    <p>Team Profiles</p>
                                </div>
                            </Link>
                            <Link id='navTeamPortal' to="/teamPortal">
                                <div id="team-link-2" className='menu-link'>
                                    <p>Team Portal</p>
                                </div>
                            </Link>
                        </div>
                    }
                </div>
                <div className='col-2' />
                {pageType === 'playerProfile' ? 
                    PlayerProfileInfo()
                 : 
                (
                    <div className='col-1'/>
                )}
                <div className='col-1 nav-mode'>
                    <div className='row nav-text nav-mode-text'>
                        <FontAwesomeIcon icon={faSun} />
                        &nbsp;
                        <Toggle
                            className='darkToggle'
                            checked={isDark}
                            onChange={({ target }) => setIsDark(target.checked)}
                            icons={{ checked: "", unchecked: "" }}
                            aria-label="Dark mode toggle"
                        />
                        &nbsp;
                        <FontAwesomeIcon icon={faMoon} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;