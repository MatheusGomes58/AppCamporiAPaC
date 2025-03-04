import React, { useEffect } from "react";
import logo from "../../img/trunfo.png"; // Certifique-se de que o caminho está correto
import "./splashscreen.css"; // Arquivo CSS com as animações

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish(); // Chama a função para esconder a splash screen após 3 segundos
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-container">
      <div className="splash-content">
        <img src={logo} alt="Logo" className="splash-logo" />
        <p className="splash-text">Desenvolvido por MatheusGomes58</p>
      </div>
    </div>
  );
};

export default SplashScreen;
