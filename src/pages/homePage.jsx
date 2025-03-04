import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/homePage.css';
import TrunfoCampori from '../img/trunfo.png';
import LogoCampori from '../img/logoCampori.jpg';
import ChurchCampori from '../img/Church.png';
import Countdown from '../components/cronometro/cronometro';
import EventsWidgets from '../components/eventsWidgets/eventsWidgets';
import ContactsWidgets from '../components/contactsWidgets/contactsWidgets'
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
import image16 from '../img/activities/16.jpg';
import image17 from '../img/activities/17.jpg';
import image18 from '../img/activities/18.jpg';
import image19 from '../img/activities/19.jpg';

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
  image16: image16,
  image17: image17,
  image18: image18,
  image19: image19,
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
    if (text.includes("Musica Tema")) {
      //setModalOpen(true);
    } else {
      image = setImage(image); 
      console.log(image)
      const imageKey = Object.keys(imageMap).find(key => imageMap[key] === image);
      navigate(`/activities?text=${encodeURIComponent(text)}&headerImage=${encodeURIComponent(imageKey)}`);
    }
  }, [navigate]);

  const setImage = useCallback((image) => {
    if(image == 'image13'){
      return image13
    }else if(image == 'image17'){
      return image17
    }else if(image == 'image18'){
      return image18
    }else {
      return image
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <div className="App">
      <div className="card-container">
        <Suspense fallback={<div>Loading...</div>}>
          <Card
            key="header"
            image={ChurchCampori}
            text=""
            size="header"
            columns={false}
            htmlContent={
              <div className="card header">
                <div className="card-image-container">
                  <img src={TrunfoCampori} alt="Header" className="imageHeader" />
                </div>
              </div>}
          />
          <Card
            title="Campori Experience"
            text="Acesse o Campori Experience para agendar atividades, acompanhar pontuações e gerenciar seu clube com facilidade."
            size="mili"
            columns={false}
            onClick={(response) => handleClick(response?.title, response?.image)}
            buttons={[
              { name: "Log In", onclick: { title: "Campori Experience Login", image: LogoCampori } },
              { name: "Criar conta", onclick: { title: "Campori Experience Sing In", image: LogoCampori } }
            ]}
          />
          <Card
            size="medium"
            columns={false}
            buttonHeaders={true}
            htmlContent={[<EventsWidgets/>,<div/>,<div/>, <ContactsWidgets/>]}
            buttons={[
              { name: 'FaCalendarAlt', Title: 'Programações', onclick: { title: "Campori Experience Login", image: LogoCampori } },
              { name: 'FaTasks', Title: 'Atividades', Text: 'Conheça agora as atividades do nosso campori clicando no botão abaixo' },
              { name: 'FaBullhorn', Title: 'Anúncios', Text: 'Fique por dentro de todas as noticias de nosso campori clicando no botão abaixo' },
              { name: 'FaAddressBook', Title: 'Contatos'}
            ]}            
          />
          <Card
            key="countdown"
            image={LogoCampori}
            text=""
            size="header"
            columns={false}
            htmlContent={<Countdown />}
            onClick={() => handleClick("Musica Tema do campori", LogoCampori)}
          />
          {cards.map((card, index) => (
            <Card
              key={index}
              image={card.image}
              title={card.title}
              text={card.text}
              size={card.size}
              onClick={(response) => handleClick(response?.title, response?.image)}
              //onClick={() => handleClick(card.text, card.image)}
              columns={card.columns}
              buttons={card.buttons}
              buttonPositions={card.buttonPos}
            />
          ))}
        </Suspense>
      </div>
      {modalOpen && <YouTubeModal videoId={"C-M-AAhH2o0"} onClose={closeModal} />}
    </div>
  );
};

export default App;
