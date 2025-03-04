import * as Icons from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import './card.css';

const Card = ({ image, title, text, size, onClick, htmlContent, columns, buttons, buttonPositions, buttonHeaders }) => {
  const [cardTitle, setCardTitle] = useState(title);
  const [cardText, setCardText] = useState(text);
  const [buttonActive, setButtonActive] = useState(0); // Define o primeiro botão como ativo
  const isHeader = size === "header";

  const alternateButtons = (button) => {
    setCardTitle(button.Title);
    setCardText(button.Text);
  };

  const handleButtonClick = (button, index) => {
    setButtonActive(index); // Atualiza o botão ativo
    alternateButtons(button); // Atualiza o título e o texto
  };

  useEffect(() => {
    if (buttonHeaders && buttons && buttons.length > 0) {
      alternateButtons(buttons[0]); // Aciona o primeiro botão ao carregar
    }
  }, [buttons]);

  return (
    <>
      {!isHeader && (
        columns ? (
          <div
            className={`card ${size}`}
            onClick={!buttons ? () => onClick && onClick({ title: text, image: image }) : undefined}
            style={isHeader ? { backgroundImage: `url(${image})` } : {}}
          >
            <div className="card-row">
              <div className="card-column">
                {cardTitle && <div className="card-title">{cardTitle}</div>}
                {htmlContent && <div className="card-html-content">{htmlContent}</div>}
                {cardText && <div className="card-text">{cardText}</div>}
                {buttonPositions && buttons && (
                  <div className="card-columns-buttons">
                    {buttons.map((button, index) => (
                      <div className="card-column" key={index}>
                        <button
                          className={`card-button ${button.name === buttonActive ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClick && onClick(button.onclick);
                          }}
                        >
                          {button.name}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-column">
                {image && <img src={image} alt={cardText} className="card-image" />}
                {!buttonPositions && buttons && (
                  <div className="card-columns-buttons">
                    {buttons.map((button, index) => (
                      <div className="card-column" key={index}>
                        <button
                          className={`card-button ${button.name === buttonActive ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClick && onClick(button.onclick);
                          }}
                        >
                          {button.name}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (<>
          {buttonHeaders && buttons && (
            <div className='card'>
              <div className="card-columns-buttons">
                {buttons.map((button, index) => {
                  const IconComponent = Icons[button.name];
                  return (
                    <div className="card-column" key={index}>
                      <button
                        className={`card-button-header ${index === buttonActive ? 'active' : ''}`}
                        onClick={() => handleButtonClick(button, index)} // Atualiza o botão ativo
                      >
                        {IconComponent ? <IconComponent size={20} /> : null}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div
            className={`card ${size}`}
            onClick={!buttons ? () => onClick && onClick({ title: text, image: image }) : undefined}
            style={isHeader ? { backgroundImage: `url(${image})` } : {}}
          >
            {image &&
              <div className='card-images'>
                <img src={image} alt={cardText} className="card-image" />
              </div>
            }
            {cardTitle && <div className="card-title">{cardTitle}</div>}
            {cardText && <div className="card-text">{cardText}</div>}
            {htmlContent && <div>{htmlContent[buttonActive]}</div>}
            {!buttonHeaders && buttons && (
              <div className="card-columns-buttons">
                {buttons.map((button, index) => (
                  <div className="card-column" key={index}>
                    <button
                      className={`card-button ${button.name === buttonActive ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick && onClick(button.onclick);
                      }}
                    >
                      {button.name}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
        )
      )}
      {isHeader && (
        <div
          className={`card ${size}`}
          onClick={!buttons ? () => onClick && onClick({ title: text, image: image }) : undefined}
          style={isHeader ? { backgroundImage: `url(${image})` } : {}}
        >
          {htmlContent && <div className="card-html-content">{htmlContent}</div>}
        </div>
      )}
    </>
  );
};

export default Card;
