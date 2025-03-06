import React, { useEffect, useRef } from "react";
import logo from "../../img/trunfo.png";
import logomgw from "../../img/logoMGW.png";
import "./splashscreen.css";

const SplashScreen = ({ onFinish, animateStop }) => {
  const splashContainerRef = useRef(null);

  useEffect(() => {
    if (!animateStop) {
      const timer = setTimeout(() => {
        onFinish();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // Se onFinish não for fornecido, remove a classe de animação
      if (splashContainerRef.current) {
        splashContainerRef.current.classList.remove('animate');
      }
    }
  }, [onFinish]);

  return (
    <div className={`splash-container ${onFinish ? 'animate' : ''}`} ref={splashContainerRef}>
      <div className="splash-content">
        <img src={logo} alt="Logo" className="splash-logo" />
        <p className="splash-text">© Todos os direitos reservados.</p>
      </div>
      <div className="splash-content">
        <img src={logomgw} alt="Logo" className="splash-logo-maker" />
        <p className="splash-text small">MatheusGomes58</p>
      </div>
    </div>
  );
};

export default SplashScreen;