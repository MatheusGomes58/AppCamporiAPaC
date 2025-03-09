import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import data from '../data/activitiesData.json';
import '../css/activitiesPage.css';

// Importação das imagens
import image1 from '../img/activities/1.jpg';
import image2 from '../img/activities/2.jpg';
import image3 from '../img/activities/3.jpg';
import image4 from '../img/activities/4.jpg';
import elenco1 from '../img/elenco/1.jpeg';
import elenco2 from '../img/elenco/2.jpeg';
import elenco3 from '../img/elenco/3.jpeg';
import elenco4 from '../img/elenco/4.jpeg';
import elenco5 from '../img/elenco/5.jpeg';
import elenco6 from '../img/elenco/6.jpeg';
import elenco7 from '../img/elenco/7.jpeg';
import elenco8 from '../img/elenco/8.jpeg';
import elenco9 from '../img/elenco/9.jpeg';

// Mapeia identificadores para imagens importadas
const imageMap = {
  image1, image2, image3, image4,
  elenco1, elenco2, elenco3, elenco4,
  elenco5, elenco6, elenco7, elenco8, elenco9
};

const useActivity = (text) => {
  const [activity, setActivity] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const selectedActivity = data.find(item => item.text === text);
    if (selectedActivity) {
      const linkItem = selectedActivity.items.find(item => item.type === 'link');
      linkItem ? navigate(linkItem.content) : setActivity(selectedActivity);
    }
  }, [text, navigate]);

  return activity;
};

const ActivityItem = ({ item }) => {
  switch (item.type) {
    case 'text':
      return <p className="activityText">{item.content}</p>;
    case 'title':
      return <h3 className="title">{item.content}</h3>;
    case 'details':
      return <p className="details">{item.content}</p>;
    case 'image':
      return <img className="image" src={imageMap[item.content]} alt={item.content} />;
    case 'slider':
      return <img className="image" src={imageMap[item.content]} alt={item.content} />;
    case 'button':
      return (
        <button className="button" onClick={() => window.location.href = item.url}>
          {item.content}
        </button>
      );
    default:
      return null;
  }
};

const Activities = () => {
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const text = queryParams.get('text');
  const headerImageKey = queryParams.get('headerImage');
  const activity = useActivity(text);

  // Estado para o índice da imagem no slider
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageItems = activity?.items?.filter(item => item.type === 'slider') || [];
  const hasImages = imageItems.length > 0;

  // Resetar índice caso a atividade mude
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activity]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageItems.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageItems.length) % imageItems.length);
  };

  if (!activity) {
    return (
      <div className="activitieCard">
        <h1>Activities</h1>
        <p className="activityText">Activity not found.</p>
      </div>
    );
  }

  return (
    <div className="ActivitiesPage">
      {headerImageKey && <img className="headerImage" src={imageMap[headerImageKey]} alt={activity.text} />}
      <h2>{activity.text}</h2>
      <div className="activitieSection">
        {hasImages && (
          <div className="imageSlider">
            <button className="sliderButton prev" onClick={prevImage}>&lt;</button>
            <div className="sliderImage">
              <ActivityItem item={imageItems[currentImageIndex]} />
            </div>
            <button className="sliderButton next" onClick={nextImage}>&gt;</button>
          </div>
        )}
        {activity.items.filter(item => item.type !== 'slider').map((item, index) => (
          <div key={index} className="activityItem">
            <ActivityItem item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;
