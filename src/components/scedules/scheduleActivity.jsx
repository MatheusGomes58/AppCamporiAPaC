import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, deleteDoc, query, orderBy, doc, updateDoc, onSnapshot } from "firebase/firestore";
import "./schedule.css";

const EventScheduler = () => {
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
          clube: null,
          hora: formattedTime, 
          classe:'atividades'
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
      const microEventRef = doc(db, "microevents", editingMicroEvent.id);
      await updateDoc(microEventRef, { title: editingMicroEvent.title });

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

  return (
    <div className="event-scheduler">
      <h2>Microeventos</h2>
      <button onClick={() => setShowForm(!showForm)} disabled={showForm}>
        Criar Microeventos
      </button>

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
              <h3>Editar Microevento</h3>
              <input
                type="text"
                value={editingMicroEvent.title}
                onChange={(e) => setEditingMicroEvent({ ...editingMicroEvent, title: e.target.value })}
              />
              <button onClick={handleUpdateMicroEvent}>Salvar</button>
              <button onClick={() => setEditingMicroEvent(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {microEvents.length > 0 && (
        <div>
          <input type="checkbox" onChange={handleSelectAll} checked={selectAll} />
          <label>Selecionar Todos</label>
        </div>
      )}

      {microEvents.map((event) => (
        <div key={event.id} className="event-item">
          <input type="checkbox" onChange={() => toggleMicroEventSelection(event.id)} checked={selectedMicroEvents.includes(event.id)} />
          <span>
            {event.title} - {event.timestamp?.seconds ? new Date(event.timestamp.seconds * 1000).toLocaleTimeString() : "Horário não disponível"}
          </span>
          <button onClick={() => handleEditMicroEvent(event)}>Editar</button>
        </div>
      ))}

      {selectedMicroEvents.length > 0 && (
        <button onClick={handleDeleteSelectedMicroEvents}>Excluir Selecionados</button>
      )}
    </div>
  );
};

export default EventScheduler;
