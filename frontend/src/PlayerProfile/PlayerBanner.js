import '../shared/App.css';
import './PlayerProfile.css';

function PlayerBanner({data}) {
    if(data) {
      return (
        <div className='row banner'>
          <div className='col-3 bannerProfile'>
            <div className='circleImgContainer playerImg'>
              <img src={`${process.env.PUBLIC_URL}/MockData/Players/${data.id}/headshot.avif`} alt="Player Portrait"/>
            </div>
            <div className='playerBannerName'>
              <h1>{data.name}</h1>
            </div>
          </div>
          <div className='col-9 bannerStatContainer'>
            <div className='row'>
              <div className='bannerCareer'>
                <p>
                  Career Stats:
                </p>
              </div>
            </div>
            <div className='row bannerStatRow'>
              <div className='col-4 bannerMainStats'>
                <h2>
                  {data.career_ppg}
                </h2>
                <p>
                  PPG
                </p>
              </div>
              <div className='col-4 bannerMainStats'>
                <h2>
                  {data.career_rpg}
                </h2>
                <p>
                  RPG
                </p>
              </div>
              <div className='col-4 bannerMainStats'>
                <h2>
                  {data.career_apg}
                </h2>
                <p>
                  APG
                </p>
              </div>
            </div>
            <div className='row'>
              <div className='bannerSubStatsContainer'>
                <p>
                BPG: {data.career_bpg}, SPG: {data.career_spg}, TPG: {data.career_tpg}
                </p>
                <p>
                FG%: {data.career_fgper}, FG3%: {data.career_fg3per}, FT%: {data.career_ftper}
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

export default PlayerBanner;
