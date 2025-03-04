import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'react-icons/fa';
import '../css/schedulePage.css';
import imageSchedulePage from '../img/imageSchedulePage.jpg';
import eventsData from '../data/scheduleData.json';

const Event = memo(({ event, eventIndex, handleLocationClick }) => (
    <>
        {event.atividades ? event.atividades.map((atividade, activityIndex) => (
            <div
                key={activityIndex}
                className='activity-description'
            >
                <div className='activity-title'>
                    {atividade.horário} - {atividade.atividade}
                </div>
                <div>
                    {atividade.descrição && <p>{atividade.descrição}</p>}
                    {atividade.responsável && <p className='responsible-info'><strong>
                        <Icons.FaUserAlt style={{ marginRight: '8px' }} />{atividade.responsável}</strong></p>}
                    {atividade.local && <p><button className='location-button' onClick={() => handleLocationClick(atividade.local)}> <Icons.FaMapMarkerAlt style={{ marginRight: '8px' }} /> {atividade.local}</button></p>}
                </div>
            </div>
        )) : ""}
    </>
));

function SchedulePage() {
    const navigate = useNavigate();
    const [activeDate, setActiveDate] = useState(getInitialActiveDate(eventsData));

    const handleLocationClick = useCallback((location) => {
        navigate(`/map?location=${encodeURIComponent(location)}`);
    }, [navigate]);

    const handleDateClick = (date) => {
        setActiveDate(date);
    };

    return (
        <div className="schedule-page">
            <div className='event-card'>
                <img alt="Imagem do evento" className='event-image' src={imageSchedulePage} />
                <div className='date-panel-container'>
                    {eventsData.map(event => (
                        <button
                            key={event.date}
                            className={`date-panel ${activeDate === event.date ? 'active' : ''}`}
                            onClick={() => handleDateClick(event.date)}
                        >
                            {event.title}
                        </button>
                    ))}
                </div>
                <div className='event-list-section'>
                    {eventsData.find(event => event.date === activeDate)?.atividades.map((atividade, eventIndex) => (
                        <Event
                            key={eventIndex}
                            event={{ atividades: [atividade], title: atividade.atividade }}
                            eventIndex={eventIndex}
                            handleLocationClick={handleLocationClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function getInitialActiveDate(events) {
    const today = new Date().toISOString().split('T')[0];
    const todayEvent = events.find(event => event.date === today);
    if (todayEvent) {
        return todayEvent.date;
    }

    if (events.length > 0) {
        return events[0].date;
    }
    return null;
}

export default SchedulePage;