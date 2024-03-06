import '../shared/App.css';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import PlayerBanner from './PlayerBanner';
import PlayerProgression from './PlayerProgression';
import PlayerPBP from './PlayerPBP';
import PlayerSimilar from './PlayerSimilar';
import LoadingPage from '../shared/LoadingPage';
import ErrorPage from '../shared/ErrorPage';

function PlayerProfile() {
    let { playerId } = useParams()

    const [playerData, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      setLoading(true);
      const dataUrl = `${process.env.PUBLIC_URL}/MockData/Players/${playerId}/init.json`;
    
      // Fetch the JSON file
      fetch(dataUrl)
        .then((response) => response.json())
        .then((data) => {
          setData(data.payload);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
          setError(error);
          setLoading(false);
        });
    }, [playerId]);
  
    if (loading) return <LoadingPage />;
    if (error) return <ErrorPage />;

    console.log(playerData)
    return (
        <div className='App-page container'>
          <PlayerBanner data={playerData} />
          <PlayerProgression data={playerData} />
          <PlayerPBP data={playerData} />
          <PlayerSimilar data={playerData} />
        </div>
    );
}

export default PlayerProfile;
