import '../shared/App.css';
import './PlayerProfile.css';

import React, { useState } from 'react';
import PlayerProgression from './PlayerProgression';
import PlayerPBP from './PlayerPBP';
import PlayerSimilar from './PlayerSimilar';

function PlayerGraphSelector({data}) {

  // State to track the active component
  const [activeComponent, setActiveComponent] = useState('PlayerProgression');

  // Function to render the active component
  const renderComponent = () => {
    switch (activeComponent) {
      case 'PlayerProgression':
        return <PlayerProgression data={data}/>;
      case 'PlayerPBP':
        return <PlayerPBP data={data}/>;
      case 'PlayerSimilar':
        return <PlayerSimilar data={data}/>;
      default:
        return null;
    }
  };

  return (
    <div className=''>
      <div id="graphSelector" className='row graphSelectorMain'>
        <button 
          className={activeComponent === 'PlayerProgression' ? "active" : "inactive"}
          onClick={() => setActiveComponent('PlayerProgression')}>
            Career Progression
        </button>
        <button 
          className={activeComponent === 'PlayerPBP' ? "active" : "inactive"}
          onClick={() => setActiveComponent('PlayerPBP')}>
            Play by Play
        </button>
        <button 
          className={activeComponent === 'PlayerSimilar' ? "active" : "inactive"}
          onClick={() => setActiveComponent('PlayerSimilar')}>
            Similar Players
        </button>
      </div>
      <div className='row'>
          {renderComponent()}
        </div>
    </div>

  );
}

export default PlayerGraphSelector;