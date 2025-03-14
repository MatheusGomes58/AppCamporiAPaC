import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'react-icons/fa';
import '../css/schedulePage.css';
import imageSchedulePage from '../img/imageSchedulePage.jpg';
import eventsData from '../data/scheduleData.json';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from '../components/firebase/firebase'; // Assumindo que você tenha a configuração do Firebase em firebaseConfig.js

const Event = memo(({ event, handleLocationClick }) => (
    <>
        {event.atividades ? event.atividades.map((atividade, activityIndex) => (
            <div
                key={activityIndex}
                className={`activity-description ${atividade.classe}`}
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

function SchedulePage({ isAutenticated, clube }) {
    const navigate = useNavigate();
    const [activeDate, setActiveDate] = useState(getInitialActiveDate(eventsData));
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const handleLocationClick = useCallback((location) => {
        navigate(`/map?location=${encodeURIComponent(location)}`);
    }, [navigate]);

    const handleDateClick = (date) => {
        setActiveDate(date);
    };

    const fetchMicroEvents = async (clube) => {
        try {
            const db = getFirestore(app);
            const microEventsRef = collection(db, "microevents");
            const q = query(microEventsRef, where("clube", "==", clube));
            const snapshot = await getDocs(q);

            const microEventsList = snapshot.docs.map(doc => {
                const eventData = doc.data();
                const object = {
                    title: eventData.title || "Evento sem título",
                    date: eventData.date || "0000-00-00",
                    atividades: [{
                        horário: eventData.hora,
                        atividade: eventData.title,
                        local: eventData.local,
                        descrição: eventData.descrição,
                        clube: eventData.clube,
                        responsável: eventData.responsável,
                        classe: eventData.classe
                    }]
                };
                console.log(object)
                return object
            });

            return microEventsList;
        } catch (error) {
            console.error("Erro ao buscar microevents:", error);
            return [];
        }
    };



    const loadEvents = async () => {
        let finalEvents = [];

        if (isAutenticated) {
            const microEvents = await fetchMicroEvents(clube);
            const combinedEvents = [...eventsData, ...microEvents];

            const groupedEvents = combinedEvents.reduce((acc, event) => {
                const key = event.date;

                if (!acc[key]) {
                    acc[key] = { title: event.title, date: event.date, atividades: [] };
                }

                if (event.atividades) {
                    event.atividades.forEach(activity => {
                        const activityExists = acc[key].atividades.some(existingActivity =>
                            existingActivity.horário === activity.horário &&
                            existingActivity.atividade === activity.atividade
                        );

                        if (!activityExists) {
                            acc[key].atividades.push(activity);
                        }
                    });
                }

                return acc;
            }, {});

            finalEvents = Object.values(groupedEvents).sort((a, b) => new Date(a.date) - new Date(b.date));

            finalEvents.forEach(event => {
                if (event.atividades.length > 0) {
                    event.atividades.sort((a, b) => convertToMinutes(a.horário) - convertToMinutes(b.horário));
                }
            });
        } else {
            finalEvents = eventsData;
        }

        setEvents(finalEvents);
        setActiveDate(finalEvents.length > 0 ? finalEvents[0].date : null);
        setLoading(false);
    };


    function convertToMinutes(timeString) {
        const [hour, minute] = timeString.includes('h')
            ? timeString.split('h').map(part => parseInt(part, 10))
            : [parseInt(timeString, 10), 0]; // Caso não tenha "h", assume 0 minutos

        const minutes = isNaN(minute) ? 0 : minute;
        return (hour * 60) + minutes;
    }


    function formatDate(dateString) {
        const date = new Date(dateString);

        // Adiciona um dia à data
        date.setDate(date.getDate() + 1);

        const options = {
            weekday: 'long', // Dia da semana completo
            month: 'long',   // Mês completo
            day: 'numeric',  // Dia numérico
        };

        return date.toLocaleDateString('pt-BR', options); // Localidade brasileira
    }

    return (
        <div className="schedule-page">
            <div className='event-card'>
                <img alt="Imagem do evento" className='event-image' src={imageSchedulePage} />
                <div className='date-panel-container'>
                    {/* Renderiza as datas únicas */}
                    {events.length > 0 && Array.from(new Set(events.map(event => event.date))).map(date => (
                        <button
                            key={date}
                            className={`date-panel ${activeDate === date ? 'active' : ''}`}
                            onClick={() => handleDateClick(date)}
                        >
                            {formatDate(date)}
                        </button>
                    ))}
                </div>
                <div className='event-list-section'>
                    {loading ? (
                        <p>Carregando eventos...</p>
                    ) : (
                        events.filter(event => event.date === activeDate).map((event, eventIndex) => (
                            <Event
                                key={eventIndex}
                                event={event}
                                eventIndex={eventIndex}
                                handleLocationClick={handleLocationClick}
                            />
                        ))
                    )}
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
