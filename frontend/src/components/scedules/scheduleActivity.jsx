import { db } from "../firebase/firebase";
import React, { useState, useEffect, memo } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

function formatarDataCompleta(dataString) {
  const data = new Date(dataString + 'T00:00:00');
  const opcoes = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const formatada = data.toLocaleDateString('pt-BR', opcoes);

  // Capitaliza a primeira letra de cada palavra relevante
  return formatada.replace(/\b\p{L}/gu, letra => letra.toUpperCase());
}

// Componente de atividade individual
const Event = memo(({ event, handleClick, reserved }) => (
  <div className={`activity-description ${event.classe}`}>
    <div className="activity-title">
      {formatarDataCompleta(event.date)}
    </div>
    <div className="activity-title">
      {event.hora} - {event.nome}
    </div>
    <div>
      {event.descrição && <p>{event.descrição}</p>}
      {event.responsável && (
        <p className="responsible-info">
          <strong>{event.responsável}</strong>
        </p>
      )}
        {/*
      <p> 
        <button
          className="location-button"
          onClick={() => handleClick(event)}
        >
          Reservar
        </button>
      </p>
      */}
    </div>
  </div>
));

const EventScheduler = ({ clube, admin, reserved, username, isMaster, activeTab }) => {
  const [microEvents, setMicroEvents] = useState([]);
  const [editingMicroEvent, setEditingMicroEvent] = useState(null);

  // Buscar eventos do Firestore com base no filtro de atividade
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

  // Função de edição (chamada ao clicar em um local)
  const handleEditMicroEvent = (microEvent) => {
    setEditingMicroEvent(microEvent);
  };

  // Atualiza o evento no Firestore
  const handleUpdateMicroEvent = async () => {
    if (!editingMicroEvent) return;

    try {
      const microEventRef = doc(db, "eventos", editingMicroEvent.id);
      await updateDoc(microEventRef, {
        ...editingMicroEvent,
        responsável: clube,
      });

      setEditingMicroEvent(null);
      alert("Atividade atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar atividade", error);
    }
  };

  return (
    <div>
      <h2>Reservar Vagas de {activeTab}</h2>

      {/* Modal de confirmação de reserva */}
      {editingMicroEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="event-form">
              <h3>
                {editingMicroEvent.atividade} - {editingMicroEvent.horário}
              </h3>
              <p>
                Olá <strong>{username}</strong>, representante do clube <strong>{clube}</strong>.<br />
                Você deseja realmente reservar essa data para seu clube?
              </p>
{/*              
              <button onClick={handleUpdateMicroEvent}>
                {!reserved ? "Editar" : "Reservar"}
              </button>
              <button onClick={() => setEditingMicroEvent(null)}>Cancelar</button>
*/}
            </div>
          </div>
        </div>
      )}

      {/* Lista de eventos */}
      {microEvents.map((event) => (
        <Event
          event={event}
          handleClick={() => handleEditMicroEvent(event)}
          reserved={true}
        />
      ))}
    </div>
  );
};

export default EventScheduler;
