import './shared/App.css';
import Navbar from './shared/Navbar';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './Home/Home';
import PlayerList from './PlayerList/PlayerList';
import TeamList from './TeamList/TeamList';
import PlayerProfile from './PlayerProfile/PlayerProfile';
import TeamProfile from './TeamProfile/TeamProfile';
import PlayerPortal from './PlayerPortal/PlayerPortal';
import TeamPortal from './TeamPortal/TeamPortal';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playerList" element={<PlayerList />} />
          <Route path="/teamList" element={<TeamList />} />
          <Route path="/playerPortal" element={<PlayerPortal />} />
          <Route path="/teamPortal" element={<TeamPortal />} />
          <Route path="/playerProfile/:playerId" element={<PlayerProfile />} />
          <Route path="/teamProfile/:teamId" element={<TeamProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
