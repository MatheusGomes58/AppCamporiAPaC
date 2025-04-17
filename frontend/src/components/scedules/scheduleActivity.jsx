import { db } from "../firebase/firebase";
import React, { useState, useEffect, memo } from "react";
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  setDoc,
  arrayUnion,
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

function getTodayDateId() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function formatVagasValue(evento) {
  if (!evento) return 0;
  return (evento.maxVagas - (evento.inscritosTotal || 0)) > evento.maxClubVagas
    ? evento.maxClubVagas
    : (evento.maxVagas - (evento.inscritosTotal || 0));
}

function validateInscrition(evento, renderer, action) {
  let validate = false;
  if (evento.maxVagas === evento.inscritosTotal) {
    if (renderer) alert("Esse evento já atingiu o limite de vagas!");
    if (action) action(null);
    validate = false;
  } else {
    validate = true;
  }
  return validate;
}

async function createReserv(clube, atividade) {
  const dataId = getTodayDateId();
  const auditRef = doc(db, "audit", dataId);
  const auditSnap = await getDoc(auditRef);

  if (!auditSnap.exists()) {
    await setDoc(auditRef, {
      clubes: [clube],
      atividades: {
        [atividade]: [clube],
      },
    });
  } else {
    const data = auditSnap.data();
    const atividades = data.atividades || {};
    const clubesAtividade = atividades[atividade] || [];

    if (!clubesAtividade.includes(clube)) {
      atividades[atividade] = [...clubesAtividade, clube];
    }

    await updateDoc(auditRef, {
      clubes: arrayUnion(clube),
      atividades: atividades,
    });
  }
}

async function cancelReserv(clube, atividade, eventoId, vagasCanceladas) {
  const dataId = getTodayDateId();
  const auditRef = doc(db, "audit", dataId);

  const eventoRef = doc(db, "eventos", eventoId);
  const eventoSnap = await getDoc(eventoRef);

  if (eventoSnap.exists()) {
    const evento = eventoSnap.data();

    const novosInscritos = (evento.inscritos || []).filter(c => c !== clube);
    const novoTotal = (evento.inscritosTotal || 0) - vagasCanceladas;

    const novosClubes = (evento.clubes || []).filter(c => c.clube !== clube);

    await updateDoc(eventoRef, {
      inscritos: novosInscritos,
      inscritosTotal: novoTotal < 0 ? 0 : novoTotal,
      clubes: novosClubes
    });
  }

  const auditSnap = await getDoc(auditRef);
  if (auditSnap.exists()) {
    const data = auditSnap.data();
    let atividades = data.atividades || {};
    let clubes = data.clubes || [];

    if (atividades[atividade]) {
      atividades[atividade] = atividades[atividade].filter(c => c !== clube);
    }

    clubes = clubes.filter(c => c !== clube);

    await updateDoc(auditRef, {
      [`atividades.${atividade}`]: atividades[atividade],
      clubes: clubes,
    });
  }
}


const Event = memo(({ event, handleClick, admin, isMaster, hasReserved, clube, activeTab }) => {
  const isClubeInscrito = (event.inscritos || []).includes(clube);
  const isSameAtividade = event.atividade === activeTab;

  return (
    <div className={`activity-description ${event.classe}`}>
      <div className="activity-title">{formatarDataCompleta(event.date)}</div>
      <div className="activity-title">
        {event.hora} - {event.nome}
      </div>
      <p>
        {event.inscritosTotal || 0}/{event.maxVagas} inscritos
      </p>
      {admin && !isMaster && validateInscrition(event) && !hasReserved && (
        <p>
          <button className="location-button" onClick={handleClick}>
            Reservar
          </button>
        </p>
      )}
      {event.clubes && event.clubes.map((clubes) => (
        <div className="membro-item" key={clubes.clube}>
          {clubes.clube} - {clubes.valueVagas} Inscrito(s)
        </div>
      ))}
      {admin && !isMaster && isClubeInscrito && isSameAtividade && (
        <p>
          <button
            className="cancel-button"
            onClick={async () => {
              const confirm = window.confirm("Tem certeza que deseja cancelar a reserva?");
              if (confirm) {
                await cancelReserv(clube, event.atividade, event.id, 1);
                alert("Reserva cancelada com sucesso!");
              }
            }}
          >
            Cancelar reserva
          </button>
        </p>
      )}
    </div>
  );
});

const EventScheduler = ({ clube, admin, username, isMaster, activeTab }) => {
  const [microEvents, setMicroEvents] = useState([]);
  const [editingMicroEventIndex, setEditingMicroEventIndex] = useState(null);
  const [valueVagas, setValueVagas] = useState(1);
  const [hasReserved, setHasReserved] = useState(false);
  const [buttonBlocked, setButtonBlocked] = useState(false);

  const editingMicroEvent =
    editingMicroEventIndex !== null
      ? microEvents[editingMicroEventIndex]
      : null;

  useEffect(() => {
    const q1 = query(
      collection(db, "eventos"),
      where("atividade", "==", activeTab)
    );

    const unsubscribe = onSnapshot(q1, (snapshot) => {
      const events = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMicroEvents(events);
    });

    return () => unsubscribe();
  }, [activeTab]);

  useEffect(() => {
    const dataId = getTodayDateId();
    const auditRef = doc(db, "audit", dataId);

    const unsubscribe = onSnapshot(auditRef, (snapshot) => {
      if (!snapshot.exists()) {
        setHasReserved(false);
        return;
      }

      const data = snapshot.data();
      const clubes = data.clubes || {};
      setHasReserved(clubes?.includes(clube));
    });

    return () => unsubscribe();
  }, [clube, activeTab]);

  const handleEditMicroEvent = (index) => {
    if (hasReserved) {
      alert("Você já fez uma reserva hoje para essa atividade!");
      return;
    }
    setEditingMicroEventIndex(index);
    setValueVagas(1);
  };

  const handleUpdateMicroEvent = async () => {
    if (editingMicroEventIndex === null) return;

    setButtonBlocked(true);
    const evento = microEvents[editingMicroEventIndex];

    try {
      const microEventRef = doc(db, "eventos", evento.id);
      const microEventSnap = await getDoc(microEventRef);
      const microEventData = microEventSnap.data();

      const inscritosAtuais = microEventData.inscritos || [];
      const novosInscritos = inscritosAtuais.includes(clube)
        ? inscritosAtuais
        : [...inscritosAtuais, clube];


      const clubesInscritos = microEventData.clubes || [];
      const novosClubesInscritos = clubesInscritos.find(c => c.clube === clube)
        ? clubesInscritos
        : [...clubesInscritos, { clube, valueVagas }];


      const totalAtual = microEventData.inscritosTotal || 0;
      const novoTotal = totalAtual + valueVagas;

      await updateDoc(microEventRef, {
        inscritos: novosInscritos,
        inscritosTotal: novoTotal,
        clubes: novosClubesInscritos
      });

      await createReserv(clube, activeTab);

      setButtonBlocked(false);
      setEditingMicroEventIndex(null);
      alert("Atividade reservada com sucesso com sucesso!");
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
      alert(`Por favor, insira um valor entre 1 e ${maximo}.`);
      return;
    }

    setValueVagas(valorDigitado);
  }

  return (
    <div>
      <h2>Reservar Vagas de {activeTab}</h2>

      {editingMicroEvent &&
        validateInscrition(
          microEvents[editingMicroEventIndex],
          true,
          handleEditMicroEvent
        ) && (
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
                    onChange={(e) => validateQuantity(e.target.value)}
                    value={valueVagas}
                  />
                  <div>
                    <button onClick={handleUpdateMicroEvent} disabled={buttonBlocked}>
                      {buttonBlocked ? "Reservando..." : "Reservar"}
                    </button>
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
          admin={admin}
          isMaster={isMaster}
          hasReserved={hasReserved}
          clube={clube}
          activeTab={activeTab}
        />
      ))}
    </div>
  );
};

export default EventScheduler;
