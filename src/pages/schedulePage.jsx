import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'react-icons/fa';
import '../css/schedulePage.css';
import imageSchedulePage from '../img/imageSchedulePage.jpg';
import eventsData from '../data/scheduleData.json';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from '../components/firebase/firebase';
import clubs from '../data/clubes.json';

const Event = memo(({ event, handleLocationClick }) => {
    const [openIndexes, setOpenIndexes] = useState([]);

    const toggleActivity = (index) => {
        setOpenIndexes((prev) =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    return (
        <div className="event-collapse">
            <h3 className="event-header">{event.title}</h3>
            {event.atividades?.map((atividade, index) => {
                const isOpen = openIndexes.includes(index);
                return (
                    <div
                        key={index}
                        className={`activity-description ${atividade.classe}`}
                    >
                        <label className='activity-title' onClick={() => toggleActivity(index)}>
                            {atividade.horário} - {atividade.atividade}
                        </label>

                        {isOpen && (
                            <div className="activity-details">
                                {atividade.descrição && <p>{atividade.descrição}</p>}
                                {atividade.responsável && (
                                    <p className='responsible-info'>
                                        <strong>
                                            <Icons.FaUserAlt style={{ marginRight: '8px' }} />
                                            {atividade.responsável}
                                        </strong>
                                    </p>
                                )}
                                {atividade.local && (
                                    <button className='location-button' onClick={() => handleLocationClick(atividade.local)}>
                                        <Icons.FaMapMarkerAlt style={{ marginRight: '8px' }} />
                                        {atividade.local}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
});


function SchedulePage({ isAutenticated, clube, isMaster }) {
    const navigate = useNavigate();
    const [activeDate, setActiveDate] = useState(getInitialActiveDate(eventsData));
    const [filterClub, setFilterClub] = useState(!isMaster ? clube : '');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [search, setSearch] = useState('');

    const handleLocationClick = useCallback((location) => {
        navigate(`/map?location=${encodeURIComponent(location)}`);
    }, [navigate]);

    const handleDateClick = (date) => {
        setActiveDate(date);
    };

    const fetchMicroEvents = async (clube) => {
        try {
            const db = getFirestore(app);
            const microEventsRef = collection(db, "eventos");
            let q;

            if (clube) {
              q = query(microEventsRef, where("inscritos", "array-contains", clube));
            } else {
              q = query(microEventsRef);
            }
            
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const eventData = doc.data();
                return {
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
            });
        } catch (error) {
            console.error("Erro ao buscar microeventos:", error);
            return [];
        }
    };

    const loadEvents = async () => {
        setLoading(true);

        let finalEvents = [];

        if (isAutenticated) {
            const microEvents = await fetchMicroEvents(filterClub);
            const filteredEventsData = (eventsData || []).filter(event => {
                const eventsOnSameDate = (eventsData || []).filter(e => e.date === event.date);
                return eventsOnSameDate.some(e => !e.isNotEnabled);
            });

            const combinedEvents = [...filteredEventsData, ...microEvents];


            const groupedEvents = combinedEvents.reduce((acc, event) => {
                const key = event.date;
                if (!acc[key]) {
                    acc[key] = { title: event.title, date: event.date, atividades: [] };
                }

                if (event.atividades) {
                    event.atividades.forEach(activity => {
                        const exists = acc[key].atividades.some(a =>
                            a.horário === activity.horário &&
                            a.atividade === activity.atividade
                        );
                        if (!exists) {
                            acc[key].atividades.push(activity);
                        }
                    });
                }
                return acc;
            }, {});

            finalEvents = Object.values(groupedEvents).sort((a, b) => new Date(a.date) - new Date(b.date));

            finalEvents.forEach(event => {
                event.atividades.sort((a, b) => convertToMinutes(a.horário) - convertToMinutes(b.horário));
            });
        } else {
            finalEvents = eventsData;
        }

        setEvents(finalEvents);
        setActiveDate(finalEvents.length > 0 ? finalEvents[0].date : null);
        setLoading(false);
    };

    useEffect(() => {
        if (isAutenticated) {
            loadEvents();
        } else {
            setEvents(eventsData);
            setActiveDate(getInitialActiveDate(eventsData));
            setLoading(false);
        }
    }, [filterClub, isAutenticated]);

    const handleSelectClub = (clubeSelecionado) => {
        setFilterClub(clubeSelecionado);
        setSearch(clubeSelecionado);
        setIsDropdownOpen(false);
    };

    function convertToMinutes(timeString) {
        const [hour, minute] = timeString.includes('h')
            ? timeString.split('h').map(part => parseInt(part, 10))
            : [parseInt(timeString, 10), 0];
        return (hour * 60) + (isNaN(minute) ? 0 : minute);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    }

    return (
        <div className="schedule-page">
            <div className='event-card'>
                {/*<img alt="Imagem do evento" className='event-image' src={imageSchedulePage} />*/}

                <div className='date-panel-container'>
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

                {!isDropdownOpen && isMaster && (
                    <input
                        className="campoEntrada"
                        type="text"
                        placeholder="Selecione o seu clube"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setIsDropdownOpen(true)}
                    />
                )}

                {isDropdownOpen && (
                    <div className="customSelect">
                        <input
                            className="campoEntrada"
                            type="text"
                            placeholder="Pesquise seu clube"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="selectTitle" onClick={() => handleSelectClub('')}>Selecione seu clube</div>
                        {clubs
                            .filter((c) => c.CLUBE.toLowerCase().includes(search.toLowerCase()))
                            .map((c, index) => (
                                <div key={index} className="optionItem" onClick={() => handleSelectClub(c.CLUBE)}>
                                    <div>{`Clube: ${c.CLUBE}`}</div>
                                    <div>{`Igreja: ${c.IGREJA}`}</div>
                                    <div>{`Distrito: ${c.DISTRITO}`}</div>
                                </div>
                            ))}
                    </div>
                )}

                <div className='event-list-section'>
                    {loading ? (
                        <p>Carregando eventos...</p>
                    ) : (
                        events
                            .filter(event => event.date === activeDate)
                            .map((event, index) => (
                                <Event
                                    key={index}
                                    event={event}
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
    return todayEvent ? todayEvent.date : (events[0]?.date || null);
}

export default SchedulePage;
