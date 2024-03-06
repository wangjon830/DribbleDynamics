import './shared/App.css';
import Navbar from './shared/Navbar';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './Home/Home';
import PlayerList from './PlayerList/PlayerList';
import TeamList from './TeamList/TeamList';
import PlayerProfile from './PlayerProfile/PlayerProfile';

function App() {
  return (
    <BrowserRouter>
        <Navbar />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playerList" element={<PlayerList />} />
            <Route path="/teamList" element={<TeamList />} />
            <Route path="/playerProfile/:playerId" element={<PlayerProfile />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
