import React from 'react';
import '../css/scheduleActivityPage.css';
import Schedule from '../components/scedules/scheduleActivity';
import especialidades from '../data/especialidades.json';

const App = ({ clube, admin, username, reserved, isMaster }) => {
  return (
    <Schedule
      clube={clube}
      admin={admin}
      reserved={reserved}
      username={username}
      isMaster={isMaster}
      atividades={especialidades}
    />
  );
};

export default App;
