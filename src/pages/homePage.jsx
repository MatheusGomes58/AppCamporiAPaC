import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/homePage.css';
import LogoCampori from '../img/logoCampori.jpg';
import Countdown from '../components/cronometro/cronometro';
import cardsData from '../data/cardsData.json';

// Importa todas as imagens
import image1 from '../img/activities/1.jpg';
import image2 from '../img/activities/2.jpg';
import image3 from '../img/activities/3.jpg';
import image4 from '../img/activities/4.jpg';
import image5 from '../img/activities/5.jpg';
import image6 from '../img/activities/6.jpg';
import image7 from '../img/activities/7.jpg';
import image8 from '../img/activities/8.jpg';
import image9 from '../img/activities/9.jpg';
import image10 from '../img/activities/10.jpg';
import image11 from '../img/activities/11.jpg';
import image12 from '../img/activities/12.jpg';
import image13 from '../img/activities/13.jpg';
import image14 from '../img/activities/14.jpg';
import image15 from '../img/activities/15.jpg';

// Mapeia identificadores para imagens importadas
const imageMap = {
  image1: image1,
  image2: image2,
  image3: image3,
  image4: image4,
  image5: image5,
  image6: image6,
  image7: image7,
  image8: image8,
  image9: image9,
  image10: image10,
  image11: image11,
  image12: image12,
  image13: image13,
  image14: image14,
  image15: image15,
};

// Lazy load Card component
const Card = lazy(() => import('../components/cards/cards'));

const YouTubeModal = React.memo(({ videoId, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <iframe
          className="video-frame"
          src={`https://www.youtube.com/embed/${videoId}?si=an_wDXuOi08OoYzp`}
          title="YouTube video player"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
});

const useCardsData = () => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const cardsWithImages = cardsData.map(card => ({
      ...card,
      image: imageMap[card.image],
    }));
    setCards(cardsWithImages);
  }, []);

  return cards;
};

const App = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const cards = useCardsData();
  const navigate = useNavigate();

  const handleClick = useCallback((text, image) => {
    if (text === "Musica tema do campori") {
      setModalOpen(true);
    } else {
      const imageKey = Object.keys(imageMap).find(key => imageMap[key] === image);
      navigate(`/activities?text=${encodeURIComponent(text)}&headerImage=${encodeURIComponent(imageKey)}`);
    }
  }, [navigate]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <div className="App">
      <div className="card-container">
        <Suspense fallback={<div>Loading...</div>}>
          <Card
            key="countdown"
            image={LogoCampori}
            text="ENQUANTO FAZEMOS A CONTAGEM REGRESSIVA DO NOSSO CAMPORI, QUE TAL APRENDER A NOVA MÚSICA? CLIQUE AQUI E SAIBA MAIS!"
            size="header"
            htmlContent={<Countdown />}
            onClick={() => handleClick("Musica tema do campori", LogoCampori)}
          />
          {cards.map((card, index) => (
            <Card
              key={index}
              image={card.image}
              text={card.text}
              size={card.size}
              onClick={() => handleClick(card.text, card.image)}
            />
          ))}
        </Suspense>
      </div>
      {modalOpen && <YouTubeModal videoId={"C-M-AAhH2o0"} onClose={closeModal} />}
    </div>
  );
};

export default App;
