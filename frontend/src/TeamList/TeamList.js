import '../shared/App.css';
import './TeamList.css';
import TeamItem from './TeamItem';
import React, { useState, useEffect } from 'react';

import LoadingPage from '../shared/LoadingPage';
import ErrorPage from '../shared/ErrorPage';

function TeamList() {
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
        if(serverUrl){
            setLoading(true);
            const dataUrl = `${serverUrl}/get_teams`;
            const mockDataUrl = `${process.env.PUBLIC_URL}/MockData/Teams/TeamList.json`;
        
            // Fetch the JSON file
            // Fetch the JSON file
            fetch(dataUrl, {
                method: 'GET',
                headers: {
                    "ngrok-skip-browser-warning":"69420",
                }
            })
                .then((response) => {
                    if(!response.ok) {
                        throw new Error('Network response not ok')
                    }
                    console.log(response)
                    return response.json()
                })
                .then((data) => {
                    if(!data.success){
                        throw new Error('Query failed')
                    }
                    setData(data.payload);
                    setLoading(false);
                })
                .catch((e) => {
                    console.log(e);
                    fetch(mockDataUrl)
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
                })
        }
      }, [serverUrl]);

    if (loading) return <LoadingPage />;
    if (error) return <ErrorPage />;

    return (
    <div className="App-page container">
        <br/><br/>
        <div>
            <div className='row'>
                <div id="teamList" className='col-12 listHeader'>
                    <div className='row'>
                        <div className='col-1 teamHeadshot' />
                        <div className='col-4 teamName'>
                            <h3>&nbsp;&nbsp;Name</h3>
                        </div>
                        <div className='col-1' />
                        <div className='col-2 teamColumn'>
                            <h3>Championships</h3>
                        </div>
                        <div className='col-2 teamColumn'>
                            <h3>Founding Season</h3>
                        </div>
                    </div>
                    <hr/>
                </div>
            </div>
            <div className='row'>
                <div className='col-12 listContainer'>
                    {teamData && teamData.teams.map(item => (
                        <TeamItem key={item.id} data={item} />
                    ))}
                </div>
            </div>
        </div>
    </div>
    );
}

export default TeamList;
