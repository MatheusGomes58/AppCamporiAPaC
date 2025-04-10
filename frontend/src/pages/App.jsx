import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { db } from '../components/firebase/firebase';
import MenuOptions from '../components/menu/menu';
import '../css/App.css';
import SchedulePage from './schedulePage';
import GuidePage from './guidePage';
import HomePage from './homePage';
import ActivitiesPage from './activitiesPage';
import CountPage from './countPage';
import { getAnalytics } from "firebase/analytics";
import SplashScreen from '../components/splashScreen/splashScreen';
import LoginPage from './loginPage';
import ForgotPage from './forgotPage';
import UnknowPage from './unknowPage';
import MenuPage from './menuPage';
import NotificationPage from './noticesPage';
import ScheduleActivity from './scheduleActivitiesPage';
import ScoresPage from './scorePage';
import ChaveamentoPage from './chaveamentoPage';
import InscricaoPage from './inscricaoPage';

const RedirectToHelp = () => {
  useEffect(() => {
    window.location.href = "https://chat.whatsapp.com/LnPviuzOehtBrXiTlgSbLb";
  }, []);

  return null;
};


function App() {
  const [showSplash, setShowSplash] = useState(true);

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

  function setLogin(value){
    if (value) {
      const storedUser = localStorage.getItem('user');
      if (storedUser && db) {
        db.collection('users').doc(storedUser).onSnapshot((doc) => {
          if (doc.exists) {
            const userDoc = doc.data();
            const userData = userDoc;

            setUid(storedUser);
            setAdmin(userData.admin || false);
            setClube(userData.clube || '');
            setUsername(userData.name || '');
            setEmail(userData.email || '');
            setAutenticated(userData.name ? true : false);
            setMaster(userData.clube == 'APAC' ? true : false);
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
    <>
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chaveamento/:tournamentName"  element={<ChaveamentoPage />} />
          <Route path="/inscricao" element={<InscricaoPage clube={clube}/>} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/schedule" element={
            <SchedulePage
              isAutenticated={isAutenticated}
              clube={clube}
            />
          } />
          <Route path="/map" element={<UnknowPage />} />
          <Route path="/count" element={<CountPage />} />
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
            <LoginPage setLogin={setLogin}/>
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
              reserved={isMaster}
            />
          } />
          <Route path="*" element={<UnknowPage />} />
        </Routes>
        {!shouldHideMenu && (<MenuOptions />)}
      </main>
    </>
  );
}

export default App;
