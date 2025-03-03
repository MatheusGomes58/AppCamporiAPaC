import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import eventsData from '../../data/scheduleData.json';
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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Zera as horas para comparar apenas a data

    let nextEvent = null;
    let followingEvent = null;

    // Itera sobre os eventos e encontra o próximo evento e o evento seguinte
    for (const [eventIndex, event] of events.entries()) {
        // Comparando a data diretamente em formato ISO
        const eventDate = new Date(event.date);

        if (eventDate >= today) {
            const sortedActivities = event.atividades
                ?.map((atividade, index) => {
                    const time24h = convertTimeStringTo24h(atividade.horário);
                    if (!time24h) return null;

                    // Criando um objeto de hora baseado na data do evento e hora da atividade
                    const activityTime = new Date(eventDate);
                    const [hours, minutes] = time24h.split(":").map(Number);
                    activityTime.setHours(hours, minutes, 0, 0);

                    return { ...atividade, index, time: activityTime };
                })
                .filter(atividade => atividade && atividade.time >= now)
                .sort((a, b) => a.time - b.time);

            if (sortedActivities.length > 0) {
                const eventWithActivity = { event, eventIndex, nextActivity: sortedActivities[0] };

                // Se o próximo evento ainda não foi encontrado, define-o
                if (!nextEvent) {
                    nextEvent = eventWithActivity;
                } else if (!followingEvent && eventWithActivity.event.date !== nextEvent.event.date) {
                    // Se o evento seguinte ainda não foi encontrado, define-o
                    followingEvent = eventWithActivity;
                }
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
                        <p>
                            {nextActivity.horário} - {nextActivity.atividade}
                        </p>
                    )}
                    {nextActivity.descrição && <p>{nextActivity.descrição}</p>}
                    {nextActivity.responsável && <p><strong>{nextActivity.responsável}</strong></p>}
                    {nextActivity.local && (
                        <p>
                            <strong>
                                <span className='location' onClick={() => handleLocationClick(nextActivity.local)}>
                                    {nextActivity.local}
                                </span>
                            </strong>
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
