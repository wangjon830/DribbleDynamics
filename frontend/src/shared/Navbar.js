import { Link } from 'react-router-dom';
import '../shared/App.css'
import '../shared/Navbar.css'; 

function Navbar() {
  return (
    <div className='container'>
        <div className="nav-main row">
            <Link id='navHome' className='col-2 nav-link' to="/">
                <div className='nav-text nav-main-text'>
                    <p>Dribble <br /> Dynamics</p>
                </div>
            </Link>
            <Link id='navPlayers' className='col-1 nav-link' to="/playerList">
                <div className='nav-text nav-sub-text'>
                    <p>Players</p>
                </div>
            </Link>
            <Link id='navTeams' className='col-1 nav-link' to="/teamList">
                <div className='nav-text nav-sub-text'>
                    <p>Teams</p>
                </div>
            </Link>
            <div className='col-9' />
        </div>
    </div>
  );
}

export default Navbar;