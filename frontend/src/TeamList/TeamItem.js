import '../shared/App.css';
import './TeamList.css';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function TeamItem({data}) {
  const [imageSrc, setImgSrc] = useState(`https://cdn.nba.com/logos/nba/${data.id}/primary/L/logo.svg`)

  const handleError = () => {
    setImgSrc("https://www.adaptivewfs.com/wp-content/uploads/2020/07/logo-placeholder-image.png")
  }
  return (
      <Link to={`/teamProfile/${data.id}`} className='row teamItemContainer'>
        <div className='col-1 teamHeadshot'>
          <div className='teamHeadshotContainer'>
            <img src={imageSrc} onError={handleError} alt="team Portrait"/>
          </div>
        </div>
        <div className='col-4 teamName'>
          <h3>
          {data.name} ({data.abbreviation})
          </h3>
        </div>
        <div className='col-1' />
        <div className='col-2 teamColumn'>
            <h3>
            {data.championships}
            </h3>
        </div>
        <div className='col-2 teamColumn'>
            <h3>
            {data.founded}
            </h3>
        </div>
      </Link>
  );
}

export default TeamItem;
