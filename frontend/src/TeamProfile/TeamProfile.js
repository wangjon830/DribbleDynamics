import '../shared/App.css';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import LoadingPage from '../shared/LoadingPage';
import ErrorPage from '../shared/ErrorPage';
import TeamBanner from './TeamBanner';

function TeamProfile() {
    let { teamId } = useParams()

    const [serverUrl, setServerUrl] = useState(null)
    const [teamData, setData] = useState(null);
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
      if(teamId && serverUrl){
        setLoading(true);
        var dataUrl = `${serverUrl}/get_team_init?id=${teamId}`;
        if(teamId.startsWith('t')){ // Mock Data case
          dataUrl = `${process.env.PUBLIC_URL}/MockData/Players/${teamId}/init.json`;
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
            return response.json()
          })
          .then((data) => {
            console.log(data)
            setData(data.payload);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching data: ", error);
            setError(error);
            setLoading(false);
          });
      }
    }, [teamId, serverUrl]);
  
    if (loading) return <LoadingPage />;
    if (error) return <ErrorPage />;

    return (
        <div className='App-page'>
          <TeamBanner id="banner" data={teamData}/>
        </div>
    );
}

export default TeamProfile;
