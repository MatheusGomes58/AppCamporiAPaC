import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import MenuOptions from '../components/menu/menu';
import '../css/App.css';
import SchedulePage from './schedulePage';
import GuidePage from './guidePage'; 
import logo from '../img/Nome.png';
import MapPage from './mapPage';
import HomePage from './homePage';
import ActivitiesPage from './activitiesPage';
import CountPage from './countPage';
import { getAnalytics } from "firebase/analytics";
import SplashScreen from '../components/splashScreen/splashScreen';
import LoginPage from './loginPage';
import ForgotPage from './forgotPage';
import MenuPage from './menuPage';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      {showSplash ? <SplashScreen onFinish={() => setShowSplash(false)}/> : <AppContent />}
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const shouldHideMenu = ["/count", "/menu"].includes(location.pathname);

  return (
    <>
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/count" element={<CountPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/show" element={<SplashScreen animateStop={true}/>}/>
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/logout" element={<LoginPage />}/>
          <Route path="/singin" element={<LoginPage menuEnabled={true}/>}/>
          <Route path="/profile" element={<LoginPage menuEnabled={true}/>}/>
          <Route path="/forgotPassword" element={<ForgotPage/>}/>
        </Routes>
        {!shouldHideMenu && (<MenuOptions />)}
      </main>
    </>
  );
}

export default App;
