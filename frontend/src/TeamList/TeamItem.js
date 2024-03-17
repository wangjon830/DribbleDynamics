import '../shared/App.css';
import './TeamList.css';
import { Link } from 'react-router-dom';

function TeamItem({data}) {
  return (
      <Link to={`/teamProfile/${data.id}`} className='row teamItemContainer'>
        <div className='col-1 teamHeadshot'>
          <div className='teamHeadshotContainer'>
            <img src={`${process.env.PUBLIC_URL}/MockData/Teams/${data.id}/logo.svg`} alt="team Portrait"/>
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
