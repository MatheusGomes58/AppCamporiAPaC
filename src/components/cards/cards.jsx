// src/components/Card.js
import React from 'react';
import './card.css';

const Card = ({ image, text, size, onClick, htmlContent }) => {
  const isHeader = size === "header"; // Verifica se é o header

  // Função para gerar uma posição aleatória para a imagem
  const getImagePosition = () => {
    const positions = ["image-top", "image-bottom", "image-left", "image-right"];
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    return randomPosition;
  };

  // Define a posição da imagem, sem afetar o card header
  const imagePosition = isHeader ? "" : getImagePosition();

  return (
    <div
      className={`card ${size} ${imagePosition}`} // Aplica a posição aleatória da imagem
      onClick={onClick}
      style={isHeader ? { backgroundImage: `url(${image})` } : {}}
    >
      {!isHeader && ( // Só exibe a imagem se não for header
        <div className="card-columns">
          <div className="card-column">
            <div className="card-image-container">
              <img src={image} alt={text} className="card-image" />
            </div>
          </div>
          <div className="card-column">
            {htmlContent && <div className="card-html-content">{htmlContent}</div>}
            {text && <div className="card-text">{text}</div>}
          </div>
        </div>
      )}
      {isHeader && (
        htmlContent && <div className="card-html-content">{htmlContent}</div>
      )}
    </div>
  );
};

export default Card;
