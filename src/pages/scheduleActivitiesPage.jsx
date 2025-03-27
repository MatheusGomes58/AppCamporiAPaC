import React from 'react';
import '../css/scheduleActivityPage.css';
import Schedule from '../components/scedules/scheduleActivity'

const App = ({clube, admin, username, reserved, isMaster}) => {
  return (
    <div className='ScheduleActivityPage'>
      <div className='ScheduleActivityCard'>
        <Schedule clube={clube} admin={admin} reserved={reserved} username={username} isMaster={isMaster}/>
      </div>
    </div>
  );
};

export default App;
