import '../shared/App.css';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import PlayerBanner from './PlayerBanner';
import PlayerGraphSelector from './PlayerGraphSelector';
import LoadingPage from '../shared/LoadingPage';
import ErrorPage from '../shared/ErrorPage';

function PlayerProfile() {
    let { playerId } = useParams()

    const [serverUrl, setServerUrl] = useState(null)
    const [playerData, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
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

    useEffect(() => {
      if(playerId && serverUrl){
        console.log(playerId)
        setLoading(true);
        var dataUrl = `${serverUrl}/get_player_init?id=${playerId}`;
        if(playerId.startsWith('p')){ // Mock Data case
          dataUrl = `${process.env.PUBLIC_URL}/MockData/Players/${playerId}/init.json`;
        } 
        console.log(dataUrl)
        // Fetch the JSON file
        fetch(dataUrl, {
            method: 'GET',
            headers: {
                "ngrok-skip-browser-warning":"69420",
            }
        })
          .then((response) => {
            console.log(response)
            return response.json()
          })
          .then((data) => {
            setData(data.payload);
            console.log(data.payload)
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching data: ", error);
            setError(error);
            setLoading(false);
          });
      }
    }, [playerId, serverUrl]);
  
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
