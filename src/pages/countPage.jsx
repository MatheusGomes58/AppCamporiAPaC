import React, { useState, useCallback,  } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/homePage.css';
import Countdown from '../components/cronometro/cronometro';


const App = () => {
  const navigate = useNavigate();

  return (
    <div className="App">
      <div className='centered'>
        <div className="card-container">
          <Countdown />
        </div>
      </div>
    </div>
  );
};

export default App;
