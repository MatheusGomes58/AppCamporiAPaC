import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/schedulePage.css';
import imageSchedulePage from '../img/imageSchedulePage.jpg';
import eventsData from '../data/scheduleData.json';

// Custom hook to fetch events
const useEvents = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        setEvents(eventsData);
    }, []);

    return events;
};

// Memoized Event component for better performance
const Event = memo(({ event, eventIndex, activeEventIndex, activeActivityIndex, handleEventClick, handleActivityClick, handleLocationClick }) => (
    <details key={eventIndex} className='event' open={activeEventIndex === eventIndex}>
        <summary className='eventTitle' onClick={() => handleEventClick(eventIndex)}>
            {event.title}
        </summary>
        <div className='eventData'>
            {event.atividades ? event.atividades.map((atividade, activityIndex) => (
                <details 
                    key={activityIndex} 
                    className='eventDescription' 
                    open={activeEventIndex === eventIndex && activeActivityIndex === activityIndex}
                >
                    <summary onClick={() => handleActivityClick(activityIndex)}>
                        {atividade.horário} - {atividade.atividade}
                    </summary>
                    <div>
                        {atividade.descrição && <p>{atividade.descrição}</p>}
                        {atividade.responsável && <p><strong>Responsável:</strong> {atividade.responsável}</p>}
                        {atividade.local && <p><strong>Local:</strong> <span className='location' onClick={() => handleLocationClick(atividade.local)}>{atividade.local}</span></p>}
                    </div>
                </details>
            )) : ""}
        </div>
    </details>
));

function SchedulePage() {
    const navigate = useNavigate();
    const events = useEvents();
    const [activeEventIndex, setActiveEventIndex] = useState(null);
    const [activeActivityIndex, setActiveActivityIndex] = useState(null);

    const handleEventClick = useCallback((eventIndex) => {
        setActiveEventIndex(eventIndex === activeEventIndex ? null : eventIndex);
        setActiveActivityIndex(null); // Reseta a atividade ativa ao trocar de evento
    }, [activeEventIndex]);

    const handleActivityClick = useCallback((activityIndex) => {
        setActiveActivityIndex(activityIndex === activeActivityIndex ? null : activityIndex);
    }, [activeActivityIndex]);

    const handleLocationClick = useCallback((location) => {
        navigate(`/map?location=${encodeURIComponent(location)}`);
    }, [navigate]);

    return (
        <div className="SchedulePage">
            <div className='eventCard'>
                <img alt="Imagem do evento" className='eventImage' width="100%" height="200px" src={imageSchedulePage} />
                <div className='eventsSection'>
                    <h2>PROGRAMAÇÃO</h2>
                    {events.map((event, eventIndex) => (
                        <Event 
                            key={eventIndex} 
                            event={event} 
                            eventIndex={eventIndex} 
                            activeEventIndex={activeEventIndex} 
                            activeActivityIndex={activeActivityIndex} 
                            handleEventClick={handleEventClick} 
                            handleActivityClick={handleActivityClick} 
                            handleLocationClick={handleLocationClick} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SchedulePage;
