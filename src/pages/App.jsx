import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import MenuOptions from '../components/menu/menu';
import '../css/App.css';
import SchedulePage from './schedulePage';
import GuidePage from './guidePage'; 
import logo from '../img/Nome.png';
import MapPage from './mapPage';
import HomePage from './homePage';
import ScorePage from './scorePage';
import ActivitiesPage from './activitiesPage';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
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
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const shouldHideMenu = ["/autentication", "/forgotPassword", "/score"].includes(location.pathname);

  return (
    <>
      {!shouldHideMenu && (
        <header className="header">
          <img src={logo} alt="Logo" className="logo" />
        </header>
      )}
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/score" element={<ScorePage />} />
        </Routes>
        <MenuOptions />
      </main>
      <Footer />
    </>
  );
}

function Footer() {
  const location = useLocation();
  const handleRedirect = () => {
    if (location.pathname === '/score') {
      window.location.href = 'https://www.instagram.com/pedroalpha/';
    } else {
      window.location.href = 'https://www.instagram.com/matheusgome58/';
    }
  };

  return (
    <footer className="footer" onClick={handleRedirect}>
      <p className="footer-text">
        {location.pathname === '/score' ? 'Desenvolvido por PedroAlpha' : 'Desenvolvido por MatheusGomes58'}
      </p>
    </footer>
  );
}

export default App;
