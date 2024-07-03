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
const Event = memo(({ event, eventIndex, activeEventIndex, activeActivityIndex, handleEventToggle, handleActivityToggle, handleLocationClick }) => (
    <details key={eventIndex} className='event' open={activeEventIndex === eventIndex} onToggle={(e) => handleEventToggle(eventIndex, e.target.open)}>
        <summary className='eventTitle'>
            {event.title}
        </summary>
        <div className='eventData'>
            {event.atividades ? event.atividades.map((atividade, activityIndex) => (
                <details 
                    key={activityIndex} 
                    className='eventDescription' 
                    open={activeEventIndex === eventIndex && activeActivityIndex === activityIndex} 
                    onToggle={(e) => handleActivityToggle(eventIndex, activityIndex, e.target.open)}
                >
                    <summary>
                        {atividade.horário} - {atividade.atividade}
                    </summary>
                    <div>
                        {atividade.descrição && <p>{atividade.descrição}</p>}
                        {atividade.responsável && <p><strong>{atividade.responsável}</strong></p>}
                        {atividade.local && <p><strong><span className='location' onClick={() => handleLocationClick(atividade.local)}>{atividade.local}</span></strong></p>}
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

    const handleEventToggle = useCallback((eventIndex, isOpen) => {
        if (isOpen) {
            setActiveEventIndex(eventIndex);
            setActiveActivityIndex(null);
        } else {
            setActiveEventIndex(null);
        }
    }, []);

    const handleActivityToggle = useCallback((eventIndex, activityIndex, isOpen) => {
        if (isOpen) {
            setActiveEventIndex(eventIndex);
            setActiveActivityIndex(activityIndex);
        } else {
            setActiveActivityIndex(null);
        }
    }, []);

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
                            handleEventToggle={handleEventToggle} 
                            handleActivityToggle={handleActivityToggle} 
                            handleLocationClick={handleLocationClick} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SchedulePage;
