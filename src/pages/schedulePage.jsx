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
                className={`activity-description ${atividade.atividades}`}
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
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clube, setClube] = useState('');
    const [isAutenticated, setAutenticated] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setClube(userData.clube || '');
            setAutenticated(true);
        } else {
            setAutenticated(false);
        }
    }, []);

    const handleLocationClick = useCallback((location) => {
        navigate(`/map?location=${encodeURIComponent(location)}`);
    }, [navigate]);

    const handleDateClick = (date) => {
        setActiveDate(date);
    };

    const fetchMicroEvents = async (clube) => {
        try {
            const db = getFirestore(app); // Obtendo a instância do Firestore
            console.log(clube);

            // Criando a query corretamente
            const microEventsRef = collection(db, "microevents");
            const q = query(microEventsRef, where("club", "==", clube));

            // Buscando os documentos que correspondem à query
            const snapshot = await getDocs(q);

            // Mapeando os documentos para um array de objetos
            const microEventsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

            return microEventsList;
        } catch (error) {
            console.error("Erro ao buscar microevents:", error);
            return [];
        }
    };


    const loadEvents = async () => {
        var finalEvents = [];

        if (isAutenticated) {
            const microEvents = await fetchMicroEvents(clube);

            // Combinar eventos locais com eventos micro
            const combinedEvents = [...eventsData, ...microEvents];

            // Agrupar os eventos por título e data
            const groupedEvents = combinedEvents.reduce((acc, event) => {
                const key = `${event.date}`; // Usamos uma chave única baseada no título e data do evento

                if (!acc[key]) {
                    acc[key] = { ...event, atividades: [] };
                }

                event.atividades.forEach(activity => {
                    const activityExists = acc[key].atividades.some(existingActivity =>
                        existingActivity.horário === activity.horário &&
                        existingActivity.atividade === activity.atividade
                    );

                    if (!activityExists) {
                        acc[key].atividades.push(activity);
                    }
                });

                return acc;
            }, {});

            // Transformar o objeto agrupado de volta para um array
            finalEvents = Object.values(groupedEvents);


            // Ordenar os eventos pela data
            finalEvents.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB; // Ordena pela data
            });

            finalEvents.forEach(event => {
                if (event.atividades) {
                    event.atividades.sort((a, b) => {
                        const timeA = convertToMinutes(a.horário);
                        const timeB = convertToMinutes(b.horário);
                        return timeA - timeB; // Ordena as atividades por horário
                    });
                }
            });
        } else {
            finalEvents = eventsData;
        }

        console.log(finalEvents);
        // Remover duplicatas de datas
        const uniqueDates = Array.from(new Set(finalEvents.map(event => event.date)));
        setEvents(finalEvents);
        setActiveDate(uniqueDates.length > 0 ? uniqueDates[0] : null);
        setLoading(false);
    };

    // Carregar eventos do Firestore e combinar com os eventos locais
    useEffect(() => {
        loadEvents();
    }, []);

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
