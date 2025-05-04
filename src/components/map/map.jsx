import React, { useState, useEffect } from 'react';
import './mapa.css';

const GoogleMapEmbed = () => {
  const [showMessage, setShowMessage] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowMessage(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mapa">
      {showMessage && (
        <div className="orientation-message">
          Para uma melhor experiência use o mapa em tela cheia e no modo paisagem (Deitado).
        </div>
      )}
      <iframe
        src="https://www.google.com/maps/d/u/0/embed?mid=1ikhpyjdVKMHbcf4Z32DyBVcRFa6EqHM&ehbc=2E312F&noprof=1"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default GoogleMapEmbed;
