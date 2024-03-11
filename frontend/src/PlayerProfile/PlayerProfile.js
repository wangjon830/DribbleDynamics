import '../shared/App.css';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import PlayerBanner from './PlayerBanner';
import PlayerGraphSelector from './PlayerGraphSelector';
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

    return (
        <div className='App-page'>
          <PlayerBanner id="banner" data={playerData}/>
          <PlayerGraphSelector data={playerData}/>
        </div>
    );
}

export default PlayerProfile;
