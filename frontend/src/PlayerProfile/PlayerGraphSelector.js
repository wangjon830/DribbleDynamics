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
    <div className='row graphSelectorMain'>
      <button onClick={() => setActiveComponent('PlayerProgression')}>Career Progression</button>
      <button onClick={() => setActiveComponent('PlayerPBP')}>Play by Play</button>
      <button onClick={() => setActiveComponent('PlayerSimilar')}>Similar Players</button>
    </div>
    <div className='row'>
        {renderComponent()}
      </div>
    </div>

  );
}

export default PlayerGraphSelector;