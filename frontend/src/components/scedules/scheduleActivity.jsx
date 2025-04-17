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
  getDoc,
} from "firebase/firestore";

function formatarDataCompleta(dataString) {
  const data = new Date(dataString + "T00:00:00");
  const opcoes = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formatada = data.toLocaleDateString("pt-BR", opcoes);
  return formatada.replace(/\b\p{L}/gu, (letra) => letra.toUpperCase());
}

function formatVagasValue(evento) {
  if (!evento) return 0;
  return (evento.maxVagas - (evento.inscritosTotal || 0)) > evento.maxClubVagas? evento.maxClubVagas: (evento.maxVagas - (evento.inscritosTotal || 0));
}

function validateIncrition(evento, renderer, action) {
  var validate = false;
  if (evento.maxVagas == evento.inscritosTotal) {
    if (renderer) {
      alert('esse evento já atingiu o limite de vagas!')
    }
    if (action) {
      action(null);
    }
    validate = false
  } else {
    validate = true
  }
  return validate;
}

const Event = memo(({ event, handleClick, admin, isMaster }) => (
  <div className={`activity-description ${event.classe}`}>
    <div className="activity-title">{formatarDataCompleta(event.date)}</div>
    <div className="activity-title">
      {event.hora} - {event.nome}
    </div>
    <p>
      {event.inscritosTotal || 0}/{event.maxVagas} inscritos
    </p>

    {admin && !isMaster && validateIncrition(event) && (
      <p>
        <button className="location-button" onClick={handleClick}>
          Reservar
        </button>
      </p>
    )}
  </div>
));

const EventScheduler = ({ clube, admin, username, isMaster, activeTab }) => {
  const [microEvents, setMicroEvents] = useState([]);
  const [editingMicroEventIndex, setEditingMicroEventIndex] = useState(null);
  const [valueVagas, setValueVagas] = useState(1);

  const editingMicroEvent =
    editingMicroEventIndex !== null
      ? microEvents[editingMicroEventIndex]
      : null;

  useEffect(() => {
    const q = query(
      collection(db, "eventos"),
      where("atividade", "==", activeTab),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMicroEvents(events);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const handleEditMicroEvent = (index) => {
    setEditingMicroEventIndex(index);
    setValueVagas(1);
  };

  const handleUpdateMicroEvent = async () => {
    if (editingMicroEventIndex === null || validateIncrition(microEvents[editingMicroEventIndex], true, handleEditMicroEvent)) {
      return;
    }

    const evento = microEvents[editingMicroEventIndex];

    try {
      const microEventRef = doc(db, "eventos", evento.id);

      const microEventSnap = await getDoc(microEventRef);
      const microEventData = microEventSnap.data();

      const inscritosAtuais = microEventData.inscritos || [];

      const novosInscritos = inscritosAtuais.includes(clube)
        ? inscritosAtuais
        : [...inscritosAtuais, clube];

      const totalAtual = microEventData.inscritosTotal || 0;
      const novoTotal = totalAtual + valueVagas;

      await updateDoc(microEventRef, {
        responsável: clube,
        inscritos: novosInscritos,
        inscritosTotal: novoTotal,
      });

      setEditingMicroEventIndex(null);
      alert("Atividade atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar atividade", error);
    }
  };

  function validateQuantity(value) {
    const valorDigitado = parseInt(value);
    const maximo = formatVagasValue(editingMicroEvent);

    if (isNaN(valorDigitado)) return;

    if (valorDigitado < 1 || valorDigitado > maximo) {
      setValueVagas(maximo);
      alert(
        `Por favor, insira um valor entre 1 e ${maximo}.`
      );
      return;
    }

    setValueVagas(valorDigitado);
  }
  isMaster = false

  return (
    <div>
      <h2>Reservar Vagas de {activeTab}</h2>

      {editingMicroEvent && validateIncrition(microEvents[editingMicroEventIndex], true, handleEditMicroEvent) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="guide-card">
              <div className="event-form">
                <div className="activity-title">
                  {formatarDataCompleta(editingMicroEvent.date)}
                </div>
                <div className="activity-title">
                  {editingMicroEvent.hora} - {editingMicroEvent.nome}
                </div>
                <p>
                  Olá <strong>{username}</strong>, representante do clube{" "}
                  <strong>{clube}</strong>.<br />
                  Você ainda pode reservar no máximo{" "}
                  {formatVagasValue(editingMicroEvent)} vagas. Informe abaixo
                  quantas deseja reservar:
                </p>
                <input
                  type="number"
                  placeholder="Vagas Reservadas"
                  min={1}
                  max={formatVagasValue(editingMicroEvent)}
                  onChange={(e) => {validateQuantity(e.target.value)}}
                  value={valueVagas}
                />
                <div>
                  <button onClick={handleUpdateMicroEvent}>Reservar</button>
                  <button onClick={() => setEditingMicroEventIndex(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {microEvents.map((event, index) => (
        <Event
          key={event.id}
          event={event}
          handleClick={() => handleEditMicroEvent(index)}
          reserved={true}
          admin={admin}
          isMaster={isMaster}
        />
      ))}
    </div>
  );
};

export default EventScheduler;
