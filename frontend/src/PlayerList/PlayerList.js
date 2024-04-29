import '../shared/App.css';
import './PlayerList.css';
import PlayerItem from './PlayerItem';
import React, { useState, useEffect } from 'react';

import LoadingPage from '../shared/LoadingPage';
import ErrorPage from '../shared/ErrorPage';

function PlayerList() {
    const [serverUrl, setServerUrl] = useState(null)
    const [playerData, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [curSearch, setCurSearch] = useState('')
    const [searchString, setSearch] = useState('')
    const [sort, setSort] = useState('relevance+DESC')
    const [page, setPage] = useState(1)
    const [hasPrev, setHasPrev] = useState(false)
    const [hasNext, setHasNext] = useState(false)

    const pageSize = 20

    const handleSearch = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        console.log(data);
        setSearch(curSearch);
        if(data.searchSort) setSort(data.searchSort);
    };

    const handleInputChange = (event) => {
        setCurSearch(event.target.value);
      };

    const handleSortChange = (event) => {
        setSort(event.target.value);
      };
    
    const handlePrev = () => {
        if(hasPrev){
            setPage(page-1)
        }
      };

    const handleNext = () => {
        if(hasNext){
            setPage(page+1)
        }
    };


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
            const dataUrl = `${serverUrl}/get_players?sortby=${sort}&search=${searchString}&page=${page}&pagesize=${pageSize}`;
            const mockDataUrl = `${process.env.PUBLIC_URL}/MockData/Players/PlayerList.json`;
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

                    if(data.payload.players.length < pageSize){
                        setHasNext(false)
                    } else {
                        setHasNext(true)
                    }

                    if(page > 1){
                        setHasPrev(true)
                    } else {
                        setHasPrev(false)
                    }
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
      }, [serverUrl, searchString, sort, pageSize, page]);

    if (loading) return <LoadingPage />;
    if (error) return <ErrorPage />;

    return (
    <div className="App-page container">
        <div className='row'>
            <div id="searchBar" className='searchBar'>
                <form onSubmit={handleSearch}>
                    <input id="searchName" name="searchName" type="text" value={curSearch} onChange={handleInputChange} placeholder='Search...' />
                    <button type="submit"><i className="fa fa-search"></i></button>
                    <select id="searchSort" name="searchSort" onChange={handleSortChange} value={sort}>
                        <option value="relevance+DESC">Relevance High to Low</option>
                        <option value="relevance+ASC">Relevance Low to High</option>
                        <option value="name+ASC">Alphabetical Ascending</option>
                        <option value="name+DESC">Alphabetical Descending</option>
                        <option value="max_year+DESC">Recency Present to Past</option>
                        <option value="max_year+ASC">Recency Past to Present</option>
                        
                    </select>
                    <button type="submit" onClick={handlePrev} className='page-button'>&#60;</button>
                    {page}
                    <button type="submit" onClick={handleNext} className='page-button'>&#62;</button>
                </form>
            </div>
        </div>
        <div>
            <div className='row'>
                <div id="playerList" className='col-12 listHeader'>
                    <div className='row'>
                        <div className='col-1 playerHeadshot' />
                        <div className='col-2 playerName'>
                            <h3>&nbsp;&nbsp;Name</h3>
                        </div>
                        <div className='col-5' />
                        <div className='col-2 playerColumn'>
                            <h3>Teams</h3>
                        </div>
                        <div className='col-2 playerColumn'>
                            <h3>Seasons</h3>
                        </div>
                    </div>
                    <hr/>
                </div>
            </div>
            <div className='row'>
                <div className='col-12 listContainer'>
                    {playerData && playerData.players.map(item => (
                        <PlayerItem key={item.id} data={item} />
                    ))}
                </div>
            </div>
        </div>
    </div>
    );
}

export default PlayerList;
