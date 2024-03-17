import '../shared/App.css';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import LoadingPage from '../shared/LoadingPage';
import ErrorPage from '../shared/ErrorPage';
import TeamBanner from './TeamBanner';

function TeamProfile() {
    let { teamId } = useParams()

    const [teamData, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      setLoading(true);
      const dataUrl = `${process.env.PUBLIC_URL}/MockData/Teams/${teamId}/init.json`;
    
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
    }, [teamId]);
  
    if (loading) return <LoadingPage />;
    if (error) return <ErrorPage />;

    return (
        <div className='App-page'>
          <TeamBanner id="banner" data={teamData}/>
        </div>
    );
}

export default TeamProfile;
