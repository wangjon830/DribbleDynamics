import '../shared/App.css';
import './TeamProfile.css';
import React, { useState, useEffect } from 'react';

function TeamBanner({data}) {
    const [imageSrc, setImgSrc] = useState('')

    const handleError = () => {
      setImgSrc("https://www.adaptivewfs.com/wp-content/uploads/2020/07/logo-placeholder-image.png")
    }

    useEffect(() => {
      if(data) {
        setImgSrc(`https://cdn.nba.com/logos/nba/${data.id}/primary/L/logo.svg`)
      }
    }, [data])

    if(data) {
      return (
        <div className='row banner'>
          <div className='col-3 bannerProfile'>
            <div className='circleImgContainer teamImg'>
              <img src={imageSrc} onError={handleError} alt="Team Logo"/>
            </div>
            <div className='teamBannerName'>
              <h1>{data.name}</h1>
            </div>
          </div>
          <div id="careerBanner" className='col-9 bannerStatContainer'>
            <div className='row'>
              <div className='bannerCareer'>
                <p>
                  Historical Stats:
                </p>
              </div>
            </div>
            <div className='row bannerStatRow'>
              <div className='col-4 bannerMainStats'>
                <h2>
                  {data.championships}
                </h2>
                <p>
                  Championships
                </p>
              </div>
              <div className='col-4 bannerMainStats'>
                <h2>
                {data.conference_titles}
                </h2>
                <p>
                  Conference Titles
                </p>
              </div>
              <div className='col-4 bannerMainStats'>
                <h2>
                  {data.division_titles}
                </h2>
                <p>
                  Division Titles
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className='row'>
          <p>Invalid Data</p>
        </div>
      );
    }
}

export default TeamBanner;
