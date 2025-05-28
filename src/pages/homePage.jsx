import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/homePage.css';
import TrunfoCampori from '../img/trunfo.png';
import LogoCampori from '../img/logoCampori.jpg';
import ChurchCampori from '../img/Church.png';
import Countdown from '../components/cronometro/cronometro';
import EventsWidgets from '../components/eventsWidgets/eventsWidgets';
import ContactsWidgets from '../components/contactsWidgets/contactsWidgets';
import NoticeWidgets from '../components/notices/notices'
import AtividadesWidgets from '../components/atividades/atividades'
import cardsData from '../data/cardsData.json';

// Importa todas as imagens
import image1 from '../img/activities/1.jpg';
import image2 from '../img/activities/2.jpg';
import image3 from '../img/activities/3.jpg';
import image4 from '../img/activities/4.jpg';
import image5 from '../img/activities/5.jpg';
import image7 from '../img/activities/7.jpg';
import image8 from '../img/activities/8.jpg';

// Mapeia identificadores para imagens importadas
const imageMap = {
  image1: image1,
  image2: image2,
  image3: image3,
  image4: image4,
  image5: image5,
  image7: image7,
  image8: image8,
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
  const [isAutentication, setAutentication] = useState(false);
  const cards = useCardsData();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('user');
    if (auth) {
      setAutentication(true);
    }
  }, [setAutentication]);

  const handleClick = useCallback((text, image) => {
    if (text.includes("Musica Tema")) {
      setModalOpen(true);
    } else {
      image = setImage(image);
      console.log(image)
      const imageKey = Object.keys(imageMap).find(key => imageMap[key] === image);
      navigate(`/activities?text=${encodeURIComponent(text)}&headerImage=${encodeURIComponent(imageKey)}`);
    }
  }, [navigate]);

  const setImage = useCallback((image) => {
    if (image == 'image1') {
      return image1
    } else if (image == 'image2') {
      return image2
    } else if (image == 'image3') {
      return image3
    } else if (image == 'image4') {
      return image4
    } else if (image == 'image5') {
      return image5
    } else if (image == 'image7') {
      return image7
    } else if (image == 'image8') {
      return image8
    } else {
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
            size="header"
            columns={false}
            onClick={() => handleClick("Musica Tema do campori", LogoCampori)}
            htmlContent={
              <div className="card header">
                <div className="card-image-container">
                  <img src={TrunfoCampori} alt="Header" className="imageHeader" />
                </div>
              </div>}
          />
          {!isAutentication ? <Card
            title="Campori Experience"
            text="Acesse o Campori Experience para agendar atividades, acompanhar pontuações e gerenciar seu clube com facilidade."
            size="mili"
            columns={false}
            onClick={(response) => handleClick(response?.title, response?.image)}
            buttons={[
              { name: "Log In", onclick: { title: "Campori Experience Login", image: LogoCampori } },
              { name: "Criar conta", onclick: { title: "Campori Experience Sing In", image: LogoCampori } }
            ]}
          /> :
            <Card
              title="Campori Experience"
              text="Você já está logado no Campori Experience! Aproveite para agendar atividades, acompanhar pontuações e gerenciar os dados do seu clube com mais facilidade."
              size="mili"
              columns={false}
            />
          }
          <Card
            size="medium"
            columns={false}
            buttonHeaders={true}
            htmlContent={[
              <EventsWidgets />,
              <AtividadesWidgets onClick={(response) => handleClick(response?.title, response?.image)}/>,
              <NoticeWidgets isSlider={true} />,
              <ContactsWidgets />
            ]}
            buttons={[
              { name: 'FaCalendarAlt', Title: 'Programações', onclick: { title: "Campori Experience Login", image: LogoCampori } },
              { name: 'FaTasks', Title: 'Atividades' },
              { name: 'FaBullhorn', Title: 'Anúncios' },
              { name: 'FaAddressBook', Title: 'Contatos' }
            ]}
          />
          <Card
            key="countdown"
            image={LogoCampori}
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
      {modalOpen && <YouTubeModal videoId={"UzyQXWoNMFE"} onClose={closeModal} />}
    </div>
  );
};

export default App;
