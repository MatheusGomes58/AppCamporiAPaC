import React, { useState, useCallback,  } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/homePage.css';
import Countdown from '../components/cronometro/cronometro';
import image from '../img/background.jpg'


const App = () => {
  const navigate = useNavigate();

  return (
    <div className="App-count" style={{ backgroundImage: `url(${image})` }}>
      <div className='centered'>
        <div className="card-container">
          <Countdown />
        </div>
      </div>
    </div>
  );
};

export default App;
