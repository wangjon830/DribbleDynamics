import '../shared/App.css';
import './Home.css';
import React from 'react';

function Home() {
  return (
    <div className="App-page Home-page">
      <div className='row'>
        <div className='col-2'/>
        <div className='col-6 header-main'>
          <p className='header-main-italic'>
            Welcome to
          </p>
          <p className='header-main-text'>
            Dribble <br /> Dynamics
          </p>
          <p className='header-main-subtext'>
            Our data is sourced from the NBA API. As a result, historical stats are only available from present day to around 1983.
          </p>
        </div>
        <div className='col-2'/>
      </div>

    </div>
  );
}

export default Home;
