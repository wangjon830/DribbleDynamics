import '../shared/App.css';
import './PlayerList.css';
import { Link } from 'react-router-dom';

function PlayerItem({data}) {
  return (
      <Link to={`/playerProfile/${data.id}`} className='row playerItemContainer'>
        <div className='col-1 playerHeadshot'>
          <div className='playerHeadshotContainer'>
            <img src={`${process.env.PUBLIC_URL}/MockData/Players/${data.id}/headshot.avif`} alt="Player Portrait"/>
          </div>
        </div>
        <div className='col-2 playerName'>
          <h3>
          {data.name}
          </h3>
        </div>
        <div className='col-5' />
        <div className='col-2 playerColumn'>
          <h3>
          {data.teams.join(', ')}
          </h3>
        </div>
        <div className='col-2 playerColumn'>
          <h3>
          {data.start_season}-{data.end_season}
          </h3>
        </div>
      </Link>
  );
}

export default PlayerItem;
