import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { db } from '../components/firebase/firebase';
import { getAnalytics, logEvent } from "firebase/analytics";
import MenuOptions from '../components/menu/menu';
import '../css/App.css';
import SchedulePage from './schedulePage';
import GuidePage from './guidePage';
import HomePage from './homePage';
import ActivitiesPage from './activitiesPage';
import CountPage from './countPage';
import SplashScreen from '../components/splashScreen/splashScreen';
import LoginPage from './loginPage';
import ForgotPage from './forgotPage';
import UnknowPage from './unknowPage';
import MenuPage from './menuPage';
import MapPage from './mapPage';
import NotificationPage from './noticesPage';
import ScheduleActivity from './scheduleActivitiesPage';
import ScoresPage from './scorePage';
import ChaveamentoPage from './chaveamentoPage';
import InscricaoPage from './inscricaoPage';
import DashboarAtividade from './activityPage';

const analytics = getAnalytics(); // Instancia global

const RedirectToHelp = () => {
  useEffect(() => {
    logEvent(analytics, 'redirect_to_help'); // Evento de clique no link do WhatsApp
    window.location.href = "https://chat.whatsapp.com/LnPviuzOehtBrXiTlgSbLb";
  }, []);

  return null;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    logEvent(analytics, 'app_loaded'); // Evento ao carregar o app
  }, []);

  return (
    <Router>
      {showSplash ? <SplashScreen onFinish={() => setShowSplash(false)} /> : <AppContent />}
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const shouldHideMenu = ["/count"].includes(location.pathname);

  const [admin, setAdmin] = useState(false);
  const [clube, setClube] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [uid, setUid] = useState('');
  const [isAutenticated, setAutenticated] = useState(false);
  const [isMaster, setMaster] = useState(false);

  useEffect(() => {
    setLogin(true);
  }, []);

  useEffect(() => {
    // Evento de navegação
    logEvent(analytics, 'screen_view', {
      screen_name: location.pathname
    });
  }, [location]);

  function setLogin(value) {
    if (value) {
      const storedUser = localStorage.getItem('user');
      if (storedUser && db) {
        db.collection('users').doc(storedUser).onSnapshot((doc) => {
          if (doc.exists) {
            const userDoc = doc.data();

            setUid(storedUser);
            setAdmin(userDoc.admin || false);
            setClube(userDoc.clube || '');
            setUsername(userDoc.name || '');
            setEmail(userDoc.email || '');
            setAutenticated(!!userDoc.name);
            setMaster(userDoc.clube === 'APAC');

            logEvent(analytics, 'user_login', {
              user_id: storedUser,
              clube: userDoc.clube || 'desconhecido',
              admin: !!userDoc.admin,
            });

          } else {
            console.log("Nenhum documento encontrado!");
          }
        });
      } else {
        setAutenticated(false);
      }
    }
  }

  return (
    <div>
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chaveamento/:tournamentName" element={
            <ChaveamentoPage
              isMaster={isMaster}
              admin={admin}
            />
          } />
          <Route path="/inscricao" element={
            <InscricaoPage
              clube={clube}
              admin={admin}
              ismaster={isMaster}
            />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/schedule" element={
            <SchedulePage
              isclub={clube}
              isMaster={isMaster}
              isAutenticated={isAutenticated}
              clube={clube}
            />
          } />
          <Route path="/map" element={<MapPage />} />
          <Route path="/count" element={<CountPage />} />
          <Route path="/dashboard" element={
            <DashboarAtividade />}
          />
          <Route path="/scoresclubs" element={
            <ScoresPage
              isclub={clube}
              isMaster={isMaster}
              uid={uid}
            />}
          />
          <Route path="/scores" element={
            <ScoresPage
              isclub={clube}
              isMaster={isMaster}
              register={true}
              admin={admin}
              uid={uid}
            />
          } />
          <Route path="/menu" element={
            <MenuPage
              useradmin={admin}
              userusername={username}
              userclube={clube}
              userAutenticated={isAutenticated}
              isMaster={isMaster}
            />
          } />
          <Route path="/show" element={<SplashScreen animateStop={true} />} />
          <Route path="/login" element={
            <LoginPage
              isAutenticated={isAutenticated}
              setLogin={setLogin}
            />
          } />
          <Route path="/logout" element={
            <LoginPage setLogin={setLogin} />
          } />
          <Route path='/deleteprofile' element={
            <LoginPage
              menuEnabled={true}
              name={username}
            />
          } />
          <Route path="/singin" element={
            <LoginPage menuEnabled={true}
            />} />
          <Route path="/profile" element={
            <LoginPage menuEnabled={true}
              admin={admin}
              name={username}
              email={email}
              clube={clube}
              isAutenticated={isAutenticated}
              setLogin={setLogin}
            />
          } />
          <Route path="/forgotPassword" element={<ForgotPage />} />
          <Route path="/notifier" element={
            <NotificationPage
              email={email}
              name={username}
              admin={admin}
              uid={uid}
              isMaster={isMaster}
            />
          } />
          <Route path="/help" element={<RedirectToHelp />} />
          <Route path="/schedulesclub" element={
            <ScheduleActivity
              clube={clube}
              admin={admin}
              isMaster={isMaster}
              username={username}
              isEspecial={true}
            />
          } />
          <Route path="/schedulesactivity" element={
            <ScheduleActivity
              clube={clube}
              admin={admin}
              isMaster={isMaster}
              username={username}
            />
          } />
          <Route path="*" element={<UnknowPage />} />
        </Routes>
        {!shouldHideMenu && (<MenuOptions />)}
      </main>
    </div>
  );
}

export default App;
