import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'react-icons/fa';
import eventsData from './scheduleData.json';
import './eventsWidgets.css';

const convertTimeStringTo24h = (timeString) => {
    const match = timeString.match(/^(\d{1,2})h(\d{2})?$/);
    if (!match) return null;

    const hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const getNextAndFollowingEventAndActivity = (events) => {
    const now = new Date();

    // Subtraímos um dia para considerar a data de hoje como ontem
    now.setDate(now.getDate() - 1);

    // Ordenar eventos por data
    const sortedEvents = events
        .map((event, eventIndex) => ({
            ...event,
            eventIndex,
            dateObj: new Date(event.date),
        }))
        .sort((a, b) => a.dateObj - b.dateObj);

    let nextEvent = null;
    let followingEvent = null;

    for (const event of sortedEvents) {
        const eventDate = event.dateObj;

        // Ordena atividades dentro do evento
        const sortedActivities = event.atividades
            ?.map((atividade, index) => {
                const time24h = convertTimeStringTo24h(atividade.horário);
                if (!time24h) return null;

                const activityTime = new Date(eventDate);
                const [hours, minutes] = time24h.split(":").map(Number);
                activityTime.setHours(hours, minutes, 0, 0);

                return { ...atividade, index, time: activityTime };
            })
            .filter(Boolean)
            .sort((a, b) => a.time - b.time);

        if (sortedActivities.length > 0) {
            // Pega a primeira atividade futura ou a primeira do evento
            let upcomingActivity = sortedActivities.find(atividade => atividade.time > now) || sortedActivities[0];

            if (!nextEvent && upcomingActivity.time > now) {
                // Se o evento ainda não ocorreu, é o próximo
                nextEvent = { event, nextActivity: upcomingActivity };
            } else if (nextEvent && !followingEvent) {
                // O evento seguinte ao próximo
                followingEvent = { event, nextActivity: upcomingActivity };
                break; // Encontramos os dois eventos, podemos parar
            }
        }
    }
    return { nextEvent, followingEvent };
};


const Event = memo(({ event, nextActivity, handleLocationClick }) => (
    <div className='eventWidget'>
        <div className='title'>{event.title}</div>
        <div className='eventData'>
            {nextActivity && (
                <div>
                    {nextActivity.horário && nextActivity.atividade && (
                        <p className='title'>
                            {nextActivity.horário} - {nextActivity.atividade}
                        </p>
                    )}
                    {nextActivity.descrição && <p>{nextActivity.descrição}</p>}
                    {nextActivity.responsável && (
                        <p className='responsavel'>
                            <Icons.FaUserAlt style={{ marginRight: '8px' }} />
                            <strong>Responsável: {nextActivity.responsável}</strong>
                        </p>
                    )}
                    {nextActivity.local && (
                        <p>
                            <button
                                className='locationButton'
                                onClick={() => handleLocationClick(nextActivity.local)}
                            >
                                <Icons.FaMapMarkerAlt style={{ marginRight: '8px' }} /> {/* Ícone de localização */}
                                {nextActivity.local}
                            </button>
                        </p>
                    )}
                </div>
            )}
        </div>
    </div>
));

function SchedulePage() {
    const navigate = useNavigate();
    const [nextEventData, setNextEventData] = useState({ nextEvent: null, followingEvent: null });

    useEffect(() => {
        setNextEventData(getNextAndFollowingEventAndActivity(eventsData));
    }, []);

    const handleLocationClick = useCallback((location) => {
        navigate(`/map?location=${encodeURIComponent(location)}`);
    }, [navigate]);

    return (
        <div>
            {nextEventData.nextEvent ? (
                <div>
                    <Event
                        event={nextEventData.nextEvent.event}
                        nextActivity={nextEventData.nextEvent.nextActivity}
                        handleLocationClick={handleLocationClick}
                    />
                    {nextEventData.followingEvent && (
                        <Event
                            event={nextEventData.followingEvent.event}
                            nextActivity={nextEventData.followingEvent.nextActivity}
                            handleLocationClick={handleLocationClick}
                        />
                    )}
                </div>
            ) : (
                <p>Fique ligado! A programação e os eventos serão lançados em breve!</p>
            )}
        </div>
    );
}

export default SchedulePage;
