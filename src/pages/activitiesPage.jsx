import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import data from '../data/activitiesData.json';
import '../css/activitiesPage.css';

// Importa todas as imagens
import LogoCampori from '../img/logoCampori.jpg';
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
  LogoCampori: LogoCampori,
};

const useActivity = (text) => {
  const [activity, setActivity] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const selectedActivity = data.find(item => item.text === text);
    if (selectedActivity) {
      // Verifica se o tipo de item é "link" e redireciona
      const linkItem = selectedActivity.items.find(item => item.type === 'link');
      if (linkItem) {
        navigate(linkItem.content);
      } else {
        setActivity(selectedActivity);
      }
    }
  }, [text, navigate]);


  return activity;
};

const ActivityItem = React.memo(({ item, activityText }) => {
  if (item.type === 'text') {
    return <p className="activityText">{item.content}</p>;
  } else if (item.type === 'title') {
    return <p className="title">{item.content}</p>;
  } else if (item.type === 'details') {
    return <p className="details">{item.content}</p>;
  } else if (item.type === 'image') {
    const imageSrc = imageMap[item.content];
    return <img className="image" src={imageSrc} alt={`Imagem de ${activityText}`} />;
  } else if (item.type === 'button') {
    return (
      <button className="button" onClick={() => window.location.href = item.url}>
        {item.content}
      </button>
    );
  } else {
    return null;
  }
});

const Activities = () => {
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const text = queryParams.get('text');
  const headerImage = queryParams.get('headerImage');
  const activity = useActivity(text);

  if (!activity) {
    return (
      <div className="activitieCard">
        <h1>Activities</h1>
        <p className="activityText">Activity not found.</p>
      </div>
    );
  }

  const headerImageSrc = imageMap[headerImage];

  return (
    <div className="ActivitiesPage">
      <div className="activitieCard">
        {headerImageSrc && <img className="headerImage" src={headerImageSrc} alt={`Header de ${activity.text}`} />}
        <h2>{activity.text}</h2>
        <div className='activitieSection'>
          {activity.items.map((item, index) => (
            <ActivityItem key={index} item={item} activityText={activity.text} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activities;
