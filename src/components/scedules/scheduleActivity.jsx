import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase"; // Importe sua configuração do Firebase
import { collection, addDoc, deleteDoc, query, where, getDocs, orderBy, doc } from "firebase/firestore";
import './schedule.css'

const EventScheduler = () => {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [interval, setInterval] = useState(30); // Intervalo em minutos para microeventos
  const [microEvents, setMicroEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchMicroEvents = async () => {
    const snapshot = await getDocs(query(collection(db, "microevents"), orderBy("timestamp", "asc")));
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMicroEvents(events);
  };

  useEffect(() => {
    fetchMicroEvents();
  }, []);

  const handleCreateOrEditEvent = async () => {
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
      // Formatação do título como "Quarta-Feira, 30 de Abril"
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      const title = start.toLocaleDateString('pt-BR', options);

      // Salvando o evento principal na coleção "events"
      const eventRef = collection(db, "events");
      const mainEvent = await addDoc(eventRef, {
        title,
        date: eventDate,
        startTime: startTime,
        endTime: endTime,
        repeat,
        name: eventName,
        atividade: true
      });

      // Criando microeventos com o formato desejado
      if (repeat) {
        let current = new Date(start);
        while (current < end) {
          const microeventTitle = title; // O título será o mesmo para todos os microevents
          const microeventTime = current.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(":", "h").replace("h00", "h");

          // Definindo a estrutura de cada microevento
          const atividade = {
            horário: microeventTime,
            atividade: eventName,
            atividades: 'atividades'
          };

          // Adicionando o microevent no Firestore
          await addDoc(collection(db, "microevents"), {
            eventId: mainEvent.id,
            title: microeventTitle,
            date: eventDate,
            atividades: [atividade],
            timestamp: new Date(current)
          });

          // Avançando para o próximo intervalo
          current.setMinutes(current.getMinutes() + interval);
        }
      } else {
        // Caso o evento não seja repetido, criar um único microevento
        const microeventTitle = title;
        const microeventTime = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const atividade = {
          horário: microeventTime,
          atividade: eventName,
          responsável: "Diretoria do Clube",
          descrição: "Descrição do evento"
        };

        await addDoc(collection(db, "microevents"), {
          eventId: mainEvent.id,
          title: microeventTitle,
          date: eventDate,
          atividades: [atividade],
          timestamp: new Date(start)
        });
      }

      alert(editingEvent ? "Evento atualizado com sucesso!" : "Evento cadastrado com sucesso!");
      fetchMicroEvents();
      setShowForm(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Erro ao salvar evento", error);
    }
  };

  const handleEditClick = async (event) => {
    try {
      const eventQuery = query(collection(db, "events"), where("__name__", "==", event.eventId));
      const snapshot = await getDocs(eventQuery);

      if (!snapshot.empty) {
        const eventData = snapshot.docs[0].data();
        setEventName(eventData.name);
        setEventDate(eventData.date);
        setStartTime(eventData.startTime);
        setEndTime(eventData.endTime);
        setRepeat(eventData.repeat);
        setEditingEvent({ id: event.eventId, ...eventData });
        setShowForm(true);
      }
    } catch (error) {
      console.error("Erro ao buscar evento para edição", error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      // Excluindo o evento principal da coleção "events"
      const eventRef = doc(db, "events", eventId);
      await deleteDoc(eventRef);

      // Excluindo os microeventos associados ao evento principal
      const microEventsQuery = query(collection(db, "microevents"), where("eventId", "==", eventId));
      const snapshot = await getDocs(microEventsQuery);

      // Excluindo cada microevento
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Atualizando o estado local
      fetchMicroEvents();

      alert("Evento e seus microeventos excluídos com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir evento e microeventos", error);
      alert("Erro ao excluir evento.");
    }
  };

  return (
    <div className="event-scheduler">
      <h2>Eventos</h2>
      <div className="event-form">
        <button onClick={() => setShowForm(!showForm)}>Incluir Evento</button>
      </div>
      {showForm && (
        <div className="event-form">
          <input
            type="text"
            placeholder="Nome do Evento"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              checked={repeat}
              onChange={() => setRepeat(!repeat)}
            />
            Repetições
          </label>
          {repeat && (
            <input
              type="number"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              placeholder="Intervalo (minutos)"
            />
          )}
          <button onClick={handleCreateOrEditEvent}>{editingEvent ? "Atualizar Evento" : "Criar Evento"}</button>
        </div>
      )}
      <div className="events-list">
        {microEvents.map((event) => (
          <div key={event.id} className="event-item">
            <span>{event.atividades[0].atividade} - {new Date(event.timestamp.seconds * 1000).toLocaleTimeString()}</span>
            <button onClick={() => handleEditClick(event)}>Editar</button>
            <button onClick={() => handleDeleteEvent(event.eventId)}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventScheduler;
