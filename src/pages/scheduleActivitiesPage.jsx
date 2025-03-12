import React from 'react';
import '../css/scheduleActivityPage.css';
import Schedule from '../components/scedules/scheduleActivity'

const App = () => {
  return (
    <div className='ScheduleActivityPage'>
      <div className='ScheduleActivityCard'>
        <Schedule />
      </div>
    </div>
  );
};

export default App;
