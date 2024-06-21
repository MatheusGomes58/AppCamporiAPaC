import React from 'react';
import './mapa.css';

const GoogleMapEmbed = () => {
  return (
    <div className='mapa'>
      <iframe
        src="https://www.google.com/maps/d/embed?mid=1ikhpyjdVKMHbcf4Z32DyBVcRFa6EqHM&ehbc=2E312F&noprof=1"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default GoogleMapEmbed;
