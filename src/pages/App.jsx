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
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import SplashScreen from '../components/splashScreen/splashScreen';
import LoginPage from './loginPage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBjrgMpj2zCsrV90Yb7tJaFbXBbA29L9c0",
  authDomain: "camporiapac.firebaseapp.com",
  projectId: "camporiapac",
  storageBucket: "camporiapac.appspot.com",
  messagingSenderId: "1083996220137",
  appId: "1:1083996220137:web:0412310e181143d5865e78",
  measurementId: "G-2QDNZ589BZ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
  const shouldHideMenu = ["/autentication", "/forgotPassword", "/score", "/count"].includes(location.pathname);

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
          <Route path="/show" element={<SplashScreen animateStop={true}/>}/>
          <Route path="/login" element={<LoginPage />}/>
        </Routes>
        {!shouldHideMenu && (<MenuOptions />)}
      </main>
    </>
  );
}

export default App;
