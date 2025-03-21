import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, deleteDoc, query, orderBy, doc, updateDoc, onSnapshot } from "firebase/firestore";
import "./schedule.css";
import clubs from '../../data/clubes.json';

const EventScheduler = ({ clube, admin }) => {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [interval, setInterval] = useState(30);
  const [microEvents, setMicroEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMicroEvent, setEditingMicroEvent] = useState(null);
  const [selectedMicroEvents, setSelectedMicroEvents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [club, setClub] = useState(clube);

  useEffect(() => {
    const q = query(collection(db, "microevents"), orderBy("timestamp", "asc"));

    // Listener para atualizações em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMicroEvents(events);
    });

    return () => unsubscribe(); // Cleanup do listener
  }, []);

  const handleCreateMicroEvents = async () => {
    if (!eventName || !eventDate || !startTime || !endTime) {
      alert("Preencha todos os campos");
      return;
    }

    const start = new Date(`${eventDate}T${startTime}`);
    const end = new Date(`${eventDate}T${endTime}`);

    if (start >= end) {
      alert("O horário de início deve ser antes do horário de fim");
      return;
    }

    try {
      let current = new Date(start);
      while (current < end) {
        const hours = current.getHours().toString().padStart(2, "0");
        const minutes = current.getMinutes();
        const formattedTime = minutes === 0 ? `${hours}h` : `${hours}h${minutes}`;

        await addDoc(collection(db, "microevents"), {
          title: eventName,
          date: eventDate,
          timestamp: current,
          hora: formattedTime,
          classe: 'atividades'
        });

        current.setMinutes(current.getMinutes() + interval);
      }
      alert("Microeventos cadastrados com sucesso!");
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao salvar microeventos", error);
    }
  };

  const handleDeleteSelectedMicroEvents = async () => {
    try {
      for (const microEventId of selectedMicroEvents) {
        await deleteDoc(doc(db, "microevents", microEventId));
      }
      setSelectedMicroEvents([]);
      setSelectAll(false);
      alert("Microeventos selecionados excluídos com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir microeventos", error);
      alert("Erro ao excluir microeventos.");
    }
  };

  const handleEditMicroEvent = (microEvent) => {
    setEditingMicroEvent(microEvent);
  };

  const handleUpdateMicroEvent = async () => {
    if (!editingMicroEvent) return;

    try {
      console.log(editingMicroEvent);
      const microEventRef = doc(db, "microevents", editingMicroEvent.id);
      await updateDoc(microEventRef, {...editingMicroEvent, clube: club});

      setEditingMicroEvent(null);
      alert("Microevento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar microevento", error);
      alert("Erro ao atualizar microevento.");
    }
  };

  const toggleMicroEventSelection = (id) => {
    setSelectedMicroEvents((prev) =>
      prev.includes(id) ? prev.filter((eventId) => eventId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMicroEvents([]);
    } else {
      setSelectedMicroEvents(microEvents.map((event) => event.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectClub = (clube) => {
    setClub(clube);
    setIsDropdownOpen(false); // Fecha o dropdown após selecionar o clube
  };

  return (
    <div className="event-scheduler">
      <h2>Microeventos</h2>
      {(clube == 'APAC' && admin) && <button onClick={() => setShowForm(!showForm)} disabled={showForm}>
        Criar Microeventos
      </button>}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="event-form">
              <input type="text" placeholder="Nome do Evento" value={eventName} onChange={(e) => setEventName(e.target.value)} />
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              <button onClick={handleCreateMicroEvents}>Criar Microeventos</button>
              <button className="delete" onClick={() => setShowForm(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingMicroEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="event-form">
              <h3>{(clube == 'APAC' && admin) ? 'Editar Atividade' : 'Reservar Atividade'}</h3>
              {(clube == 'APAC' && admin) ? <input
                type="text"
                value={editingMicroEvent.title}
                onChange={(e) => setEditingMicroEvent({ ...editingMicroEvent, title: e.target.value })}
              /> : `${editingMicroEvent.title} - ${editingMicroEvent.timestamp?.seconds ? new Date(editingMicroEvent.timestamp.seconds * 1000).toLocaleTimeString() : "Horário não disponível"}`}
              {(clube != 'APAC' && admin && !isDropdownOpen) && <input
                className="inputLogin"
                type="text"
                placeholder="Selecione o seu clube"
                value={club}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
              />}

              {isDropdownOpen && (
                <div className="customSelect">
                  <input
                    className="inputLogin"
                    type="text"
                    placeholder="Pesquise seu clube"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setIsDropdownOpen(true)} // Abre o dropdown ao focar no campo
                  />
                  <div className="selectTitle" onClick={() => handleSelectClub('')}>Selecione seu clube</div>
                  {clubs
                    .filter((c) => c.CLUBE.toLowerCase().includes(search.toLowerCase()))
                    .map((c, index) => (
                      <div key={index} className="optionItem" onClick={() => handleSelectClub(c.CLUBE)}>
                        <div>{`Clube: ${c.CLUBE}`}</div>
                        <div>{`Igreja: ${c.IGREJA}`}</div>
                        <div>{`Igreja: ${c.DISTRITO}`}</div>
                      </div>
                    ))}
                </div>
              )}
              <button onClick={handleUpdateMicroEvent}>Salvar</button>
              <button onClick={() => setEditingMicroEvent(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {(clube == 'APAC' && admin && microEvents.length > 0) && (
        <div>
          <input type="checkbox" onChange={handleSelectAll} checked={selectAll} />
          <label>Selecionar Todos</label>
        </div>
      )}

      {microEvents.map((event) => (
        <div key={event.id} className="event-item">
          {(clube == 'APAC' && admin && !event.clube) && <input type="checkbox" onChange={() => toggleMicroEventSelection(event.id)} checked={selectedMicroEvents.includes(event.id)} />}
          <span>
            {event.title} - {event.timestamp?.seconds ? new Date(event.timestamp.seconds * 1000).toLocaleTimeString() : "Horário não disponível"}
          </span>
          {!event.clube && <button onClick={() => handleEditMicroEvent(event)}>{(clube == 'APAC' && admin) ? 'Editar' : 'Reservar'}</button>}
        </div>
      ))}

      {(clube == 'APAC' && admin && microEvents.length > 0) && (
        <button onClick={handleDeleteSelectedMicroEvents}>Excluir Selecionados</button>
      )}
    </div>
  );
};

export default EventScheduler;
