// src/components/Card.js
import React from 'react';
import './card.css';

const Card = ({ image, text, size, onClick, htmlContent }) => {
  const cardStyle = {
    backgroundImage: `url(${image})`,
  };

  return (
    <div className={`card ${size}`} onClick={onClick}>
      <div className="card-image-container">
        <img src={image} alt={text} className="card-image" style={cardStyle}/>
        {htmlContent && (
          <div className="card-html-content">
            {htmlContent}
          </div>
        )}
      </div>
      {text?<div className="card-text">{text}</div>:""}
    </div>
  );
};

export default Card;
