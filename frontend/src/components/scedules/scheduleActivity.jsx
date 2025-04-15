import { db } from "../firebase/firebase";
import clubs from "../../data/clubes.json";
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  query, where,
  orderBy,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

const EventScheduler = ({ clube, admin, reserved, username, isMaster, activeTab }) => {
  const [showForm, setShowForm] = useState(false);
  const [eventName, setEventName] = useState("");
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(activeTab);
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [interval, setInterval] = useState(0);
  const [microEvents, setMicroEvents] = useState([]);
  const [editingMicroEvent, setEditingMicroEvent] = useState(null);
  const [selectedMicroEvents, setSelectedMicroEvents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [club, setClub] = useState(clube);
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  var atividades = []
  useEffect(() => {
    const q = query(
      collection(db, "eventos"),
      where("atividade", "==", activeTab),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMicroEvents(events);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const checkDuplicateReservation = () => {
    return microEvents.some((ev) => ev.date === eventDate && ev.clube === clube);
  };

  const handleCreateMicroEvents = async () => {
    if (!eventName || !eventDate || !startTime || !endTime || !atividadeSelecionada) {
      alert("Preencha todos os campos e selecione uma atividade.");
      return;
    }

    if (checkDuplicateReservation()) {
      alert("Você já reservou uma atividade para esse dia.");
      return;
    }

    const start = new Date(`${eventDate}T${startTime}`);
    const end = new Date(`${eventDate}T${endTime}`);

    if (start >= end) {
      alert("O horário de início deve ser antes do horário de fim.");
      return;
    }

    try {
      let current = new Date(start);
      while (current < end) {
        const hours = current.getHours().toString().padStart(2, "0");
        const minutes = current.getMinutes();
        const formattedTime = minutes === 0 ? `${hours}h` : `${hours}h${minutes}`;

        await addDoc(collection(db, "eventos"), {
          title: eventName,
          date: eventDate,
          timestamp: current,
          hora: formattedTime,
          atividade: atividadeSelecionada,
          classe: "atividades",
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
        await deleteDoc(doc(db, "eventos", microEventId));
      }
      setSelectedMicroEvents([]);
      setSelectAll(false);
      alert("Atividades excluídas com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir atividades", error);
    }
  };

  const handleEditMicroEvent = (microEvent) => {
    setEditingMicroEvent(microEvent);
  };

  const handleUpdateMicroEvent = async () => {
    if (!editingMicroEvent) return;

    try {
      const microEventRef = doc(db, "eventos", editingMicroEvent.id);
      await updateDoc(microEventRef, isMaster ? { ...editingMicroEvent, clube: clube } : { ...editingMicroEvent, clube });

      setEditingMicroEvent(null);
      alert("Atividade atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar atividade", error);
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
    setIsDropdownOpen(false);
  };

  return (
    <div>
      {(isMaster && admin) && (
        <button onClick={() => setShowForm(!showForm)} disabled={showForm}>
          Criar Eventos
        </button>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="event-form">
              <input type="text" placeholder="Atividade do Evento" value={activeTab} onChange={(e) => setAtividadeSelecionada(e.target.value)} />
              <input type="text" placeholder="Nome do Evento" value={eventName} onChange={(e) => setEventName(e.target.value)} />
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              <input type="number" value={interval} onChange={(e) => setInterval(e.target.value)} />
              <button onClick={handleCreateMicroEvents}>Criar Microeventos</button>
              <button className="delete" onClick={() => setShowForm(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {editingMicroEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="event-form">
              <h3>{`${editingMicroEvent.title} - ${editingMicroEvent.timestamp?.seconds ? new Date(editingMicroEvent.timestamp.seconds * 1000).toLocaleTimeString() : "Horário não disponível"}`}</h3>
              {`Olá ${username}, representante do clube ${clube}, você deseja realmente reservar essa data para seu clube?`}

              {isDropdownOpen && (
                <div className="customSelect">
                  <input
                    className="inputLogin"
                    type="text"
                    placeholder="Pesquise seu clube"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  <div className="selectTitle" onClick={() => handleSelectClub("")}>Selecione seu clube</div>
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

              <button onClick={handleUpdateMicroEvent}>{!reserved ? "Editar" : "Reservar"}</button>
              <button onClick={() => setEditingMicroEvent(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {microEvents.map((event) => (
        <div key={event.id} className="event-item">
          {(isMaster && admin && !event.clube) && (
            <input
              type="checkbox"
              onChange={() => toggleMicroEventSelection(event.id)}
              checked={selectedMicroEvents.includes(event.id)}
            />
          )}
          <span>
            {event.title} - {event.timestamp?.seconds ? new Date(event.timestamp.seconds * 1000).toLocaleTimeString() : "Horário não disponível"}
          </span>
          {!event.clube && <button onClick={() => handleEditMicroEvent(event)}>{!reserved ? "Editar" : "Reservar"}</button>}
        </div>
      ))}

      {(admin && microEvents.length > 0) && (
        <button onClick={handleDeleteSelectedMicroEvents}>Excluir Selecionados</button>
      )}

    </div>
  );

};

export default EventScheduler;