import '../shared/App.css';
import './TeamList.css';
import TeamItem from './TeamItem';
import React, { useState, useEffect } from 'react';

import LoadingPage from '../shared/LoadingPage';
import ErrorPage from '../shared/ErrorPage';

function TeamList() {
    const handleSearch = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        console.log(data);
    };
    
    const [mockData, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const dataUrl = `${process.env.PUBLIC_URL}/MockData/teams/teamList.json`;
    
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
      }, []);

    if (loading) return <LoadingPage />;
    if (error) return <ErrorPage />;

    return (
    <div className="App-page container">
        <div className='row'>
            <div id="searchBar" className='searchBar'>
                <form onSubmit={handleSearch}>
                    <input id="searchName" name="searchName" type="text" placeholder='Search..' />
                    <button type="submit"><i className="fa fa-search"></i></button>
                    <select id="searchSort" name="searchSort" defaultValue="default">
                        <option value="default" disabled>Sort by</option>
                        <option value="alphabetical">Alphabetical</option>
                        <option value="team">Team</option>
                        <option value="relevance">Relevance</option>
                        <option value="year">Year</option>
                    </select>
                </form>
            </div>
        </div>
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
                    {mockData && mockData.teams.map(item => (
                        <TeamItem key={item.id} data={item} />
                    ))}
                </div>
            </div>
        </div>
    </div>
    );
}

export default TeamList;
