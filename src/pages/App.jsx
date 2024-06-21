import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import MenuOptions from '../components/menu/menu';
import '../css/App.css';
import SchedulePage from './schedulePage';
import Profile from './profilePage';
import GuidePage from './guidePage'; 
import logo from '../img/Nome.png';
import MapPage from './mapPage';
import HomePage from './homePage';
import ActivitiesPage from './activitiesPage';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const shouldHideMenu = ["/autentication", "/forgotPassword"].includes(location.pathname);

  return (
    <>
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
        {!shouldHideMenu && <MenuOptions />}
      </main>
    </>
  );
}

export default App;
