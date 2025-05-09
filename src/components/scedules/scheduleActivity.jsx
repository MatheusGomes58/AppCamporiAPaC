import { db } from "../firebase/firebase";
import React, { useState, useEffect, memo } from "react";
import { useNavigate } from 'react-router-dom';
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
  deleteField
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

async function cancelReserv(clube, atividade, eventoId) {
  const dataId = getTodayDateId();
  const auditRef = doc(db, "audit", dataId);

  const eventoRef = doc(db, "eventos", eventoId);
  const eventoSnap = await getDoc(eventoRef);

  if (eventoSnap.exists()) {
    const evento = eventoSnap.data();

    const novosInscritos = (evento.inscritos || []).filter(c => c !== clube);
    const novosClubes = (evento.clubes || []).filter(c => c.clube !== clube);

    const clubeCancelado = (evento.clubes || []).filter(c => c.clube === clube);
    const vagasCanceladas = (clubeCancelado[0]?.valueVagas || 0);
    const novoTotal = (evento.inscritosTotal || 0) - vagasCanceladas;

    await updateDoc(eventoRef, {
      inscritos: novosInscritos,
      inscritosTotal: novoTotal < 0 ? 0 : novoTotal,
      clubes: novosClubes
    });

    // ❗ Remove o campo do clube na collection "inscricoes"
    const inscricaoRef = doc(db, "inscricoes", eventoId);
    await setDoc(inscricaoRef, {
      [clube]: deleteField(),
    }, { merge: true });
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



const Event = memo(({ event, handleClick, admin, isMaster, hasReserved, clube, activeTab, isClubeInscrito, membross }) => {
  const navigate = useNavigate();
  const isSameAtividade = event.atividade === activeTab;
  const WhereClubeInscrito = (event.inscritos || []).includes(clube)
  const [membros, setMembros] = useState(membross);
  const [novoMembro, setNovoMembro] = useState("");

  const handleAdicionarMembro = async (torneioId) => {
    if (!novoMembro.trim()) return;

    const inscricaoRef = doc(db, "inscricoes", torneioId);
    const docSnap = await getDoc(inscricaoRef);
    const dadosExistentes = docSnap.exists() ? docSnap.data() : {};

    const membrosAtuais = dadosExistentes[clube] || [];

    await setDoc(
      inscricaoRef,
      {
        ...dadosExistentes,
        [clube]: [...membrosAtuais, novoMembro.trim()],
      },
      { merge: true }
    );

    setMembros((prev) => ({
      ...prev,
      [torneioId]: [...(prev[torneioId] || []), novoMembro.trim()],
    }));
    setNovoMembro("");
  };

  const handleRemoverMembro = async (torneioId, membroRemover) => {
    const confirmar = window.confirm(`Deseja remover o membro "${membroRemover}" da corrida?`);
    if (!confirmar) return;

    const inscricaoRef = doc(db, "inscricoes", torneioId);
    const docSnap = await getDoc(inscricaoRef);
    if (!docSnap.exists()) return;

    const dados = docSnap.data();
    const membrosAtuais = dados[clube] || [];

    const atualizados = membrosAtuais.filter((m) => m !== membroRemover);

    await updateDoc(inscricaoRef, {
      [clube]: atualizados,
    });

    setMembros((prev) => ({
      ...prev,
      [torneioId]: atualizados,
    }));

  };

  return (
    <div className={`activity-description ${event.classe}`}>
      <div className="activity-title">{formatarDataCompleta(event.date)}</div>
      <div className="activity-title">
        {event.hora} - {event.nome}
      </div>
      <table className="table">
        <tbody>
          <tr>
            <th colSpan={2}>Detalhes</th>
          </tr>
          <tr>
            <td>Total de Vagas:</td>
            <td>{event.maxVagas || 0} disponíveis</td>
          </tr>
          <tr>
            <td>Total de Vagas Ocupadas:</td>
            <td>{event.inscritosTotal || 0} Inscritos</td>
          </tr>
          <tr>
            <td>Total de Clubes:</td>
            <td>{event.inscritos?.length || 0} Inscritos</td>
          </tr>
          {(admin && !isMaster) && (WhereClubeInscrito && isSameAtividade) && <tr>
            <td>Total de membros do clube:</td>
            <td>{membros[event.id]?.length || 0} Inscritos</td>
          </tr>}
          {(isMaster || event.clubes?.some(c => c.clube === clube)) && (
            <>
              <tr>
                <th colSpan={2}>Clubes Inscritos</th>
              </tr>
              {event.clubes.map((c, idx) => (
                (isMaster || c.clube === clube) && (
                  <tr key={idx}>
                    <td>{c.clube}</td>
                    <td>{c.valueVagas}</td>
                  </tr>
                )
              ))}
            </>
          )}
          {(admin && !isMaster) && (WhereClubeInscrito && isSameAtividade) && (membros[event.id] || []) && <tr>
            <th colSpan={2}>Membos Inscritos</th>
          </tr>}
          {(admin && !isMaster) && (WhereClubeInscrito && isSameAtividade) ? ((membros[event.id]?.length) ? (membros[event.id] || []).map((m, i) => (
            <tr key={i}>
              <td>{m}</td>
              <td>
                <button className="remover-membro-btn" onClick={() => handleRemoverMembro(event.id, m)}>
                  Remover
                </button>
              </td>
            </tr>
          )) :
            <tr>
              <td colSpan={2}>Ainda não hé membros inscritos nessa atividade!</td>
            </tr>
          ) : ""}
          {(admin && !isMaster) && (WhereClubeInscrito && isSameAtividade) && <tr>
            <th colSpan={2}>Ações</th>
          </tr>}

          {((admin && !isMaster) && (WhereClubeInscrito && isSameAtividade)) &&
            ((event.clubes?.find(c => c.clube === clube)?.valueVagas || 0) > (membros[event.id]?.length || 0)) && (
              <tr>
                <td>
                  <input
                    type="text"
                    placeholder="Nome do membro"
                    className="inputLogin"
                    value={novoMembro}
                    onChange={(e) => setNovoMembro(e.target.value)}
                  />
                </td>
                <td>
                  <button className="confirm-btn" onClick={() => handleAdicionarMembro(event.id)}>
                    Adicionar membro
                  </button>
                </td>
              </tr>
            )
          }
        </tbody>
      </table>

      {(admin && !isMaster) && (!isClubeInscrito && validateInscrition(event)) && (!hasReserved) && (
        <button className="location-button" onClick={handleClick}>
          Reservar
        </button>
      )}
      {(admin && !isMaster) && (WhereClubeInscrito && isSameAtividade) && (
        <button
          className="delete"
          onClick={async () => {
            const confirm = window.confirm("Tem certeza que deseja cancelar a reserva?");
            if (confirm) {
              await cancelReserv(clube, event.atividade, event.id);
              alert("Reserva cancelada com sucesso!");
            }
          }}
        >
          Cancelar reserva
        </button>
      )}

      {isMaster && (
        <button onClick={() => navigate(`/chaveamento/${event.nome}`)}>
          Consultar Lista de Inscritos
        </button>
      )}
    </div >
  );
});

const EventScheduler = ({ clube, admin, username, isMaster, activeTab }) => {
  const [microEvents, setMicroEvents] = useState([]);
  const [editingMicroEventIndex, setEditingMicroEventIndex] = useState(null);
  const [valueVagas, setValueVagas] = useState(1);
  const [hasReserved, setHasReserved] = useState(false);
  const [buttonBlocked, setButtonBlocked] = useState(false);
  const [isClubeInscrito, setIsClubeInscrito] = useState(false);
  const [membros, setMembros] = useState({});

  const editingMicroEvent = editingMicroEventIndex !== null ? microEvents[editingMicroEventIndex] : null;

  useEffect(() => {
    if (!clube || !activeTab) return;
  
    const eventosQuery = query(
      collection(db, "eventos"),
      where("atividade", "==", activeTab)
    );
  
    const dataId = getTodayDateId();
    const auditRef = doc(db, "audit", dataId);
  
    let unsubscribeInscricoes = [];
    let unsubscribeAudit = null;
  
    const unsubscribeEventos = onSnapshot(eventosQuery, async (snapshot) => {
      const eventos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      setMicroEvents(eventos);
  
      // Limpar escutas antigas
      unsubscribeInscricoes.forEach((unsub) => unsub());
      unsubscribeInscricoes = [];
  
      const inscritosMap = {};
      const membrosTemp = {};
  
      await Promise.all(eventos.map(async (evento) => {
        const isInscrito = evento.inscritos?.includes(clube);
        if (!isInscrito) return;
  
        inscritosMap[evento.id] = true;
  
        const inscricaoRef = doc(db, "inscricoes", evento.id);
        const docSnap = await getDoc(inscricaoRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data();
          membrosTemp[evento.id] = data[clube] || [];
        }
  
        const unsubscribe = onSnapshot(inscricaoRef, (snap) => {
          const data = snap.exists() ? snap.data() : {};
          setMembros((prev) => ({
            ...prev,
            [evento.id]: data[clube] || [],
          }));
        });
  
        unsubscribeInscricoes.push(unsubscribe);
      }));
  
      setMembros(membrosTemp);
      setIsClubeInscrito(Object.keys(inscritosMap).length > 0);
    });
  
    unsubscribeAudit = onSnapshot(auditRef, (snapshot) => {
      const data = snapshot.data();
      const clubes = data?.clubes || [];
      setHasReserved(clubes.includes(clube));
    });
  
    return () => {
      unsubscribeEventos();
      unsubscribeInscricoes.forEach((unsub) => unsub());
      if (unsubscribeAudit) unsubscribeAudit();
    };
  }, [activeTab, clube]);
  


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

    if (valueVagas < 1) {
      alert("Número de vagas inválido. O mínimo permitido é 1.");
      return;
    }

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

      if (novoTotal > microEventData.maxVagas) {
        alert("Erro: excedeu o número máximo de vagas.");
        setButtonBlocked(false);
        return;
      }

      await updateDoc(microEventRef, {
        inscritos: novosInscritos,
        inscritosTotal: novoTotal,
        clubes: novosClubesInscritos
      });

      await createReserv(clube, activeTab);

      setButtonBlocked(false);
      setEditingMicroEventIndex(null);
      alert("Atividade reservada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar atividade", error);
      setButtonBlocked(false);
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
    <div className="event-list-section">
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
                    <button disabled={buttonBlocked} onClick={() => setEditingMicroEventIndex(null)}>
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
          isClubeInscrito={isClubeInscrito}
          membross={membros}
        />
      ))}
    </div>
  );
};

export default EventScheduler;
