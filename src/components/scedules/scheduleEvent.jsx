import { db } from "../firebase/firebase";
import { useNavigate } from 'react-router-dom';
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  deleteField
} from "firebase/firestore";
import { useEffect } from "react";

const Event = (({ event, handleClick, admin, isMaster, hasReserved, clube, activeTab, isClubeInscrito, membros, handleRemoverMembro, handleAdicionarMembro, setNovoMembro, novoMembro }) => {
  const navigate = useNavigate();
  const isSameAtividade = event.atividade === activeTab;
  const WhereClubeInscrito = (event.inscritos || []).includes(clube)

  console.log(membros)

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

  return (
    <div className={`activity-description ${event.classe}`}>
      <div className="activity-title">{formatarDataCompleta(event.date)}</div>
      <div className="activity-title">
        {event.hora} - {event.nome}
      </div>
      <table className="table">
        <tbody>
          {!event.iscarroussel && <tr>
            <th colSpan={2}>Detalhes</th>
          </tr>}
          {!event.iscarroussel &&<tr>
            <td>Total de Vagas:</td>
            <td>{event.maxVagas || 0} Vagas</td>
          </tr>}
          {!event.iscarroussel && isMaster && <tr>
            <td>Total de Vagas Ocupadas:</td>
            <td>{event.inscritosTotal || 0} Inscritos</td>
          </tr>}
          {!event.iscarroussel && isMaster && <tr>
            <td>Total de Clubes:</td>
            <td>{event.inscritos?.length || 0} Inscritos</td>
          </tr>}
          {(admin && !isMaster) && (WhereClubeInscrito && isSameAtividade) && !event.iscarroussel && <tr>
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
                    {c.valueVagas
                      ? (
                        <>
                          <td>{c.clube}</td>
                          <td>{c.valueVagas}</td>
                        </>
                      ) : (
                        <td colSpan={2}>{c.clube}</td>
                      )
                    }
                  </tr>
                )
              ))}
            </>
          )}
          {(admin && !isMaster) && (WhereClubeInscrito && isSameAtividade) && !event.iscarroussel && (membros[event.id] || []) && <tr>
            <th colSpan={2}>Membos Inscritos</th>
          </tr>}
          {(admin && !isMaster) && (WhereClubeInscrito && isSameAtividade) && !event.iscarroussel ? ((membros[event.id]?.length) ? (membros[event.id] || []).map((m, i) => (
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
          {(admin && !isMaster) && !event.iscarroussel && (WhereClubeInscrito && isSameAtividade) && <tr>
            <th colSpan={2}>Ações</th>
          </tr>}

          {((admin && !isMaster) && !event.iscarroussel && (WhereClubeInscrito && isSameAtividade)) &&
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

      {(admin && !isMaster) && (!isClubeInscrito && validateInscrition(event)) && (!hasReserved) && activeTab == 'MAB - Sábado' && (
        <button className="location-button" onClick={handleClick}>
          Reservar
        </button>
      )}
      {(admin && !isMaster) && activeTab == 'MAB - Sábado' && (WhereClubeInscrito && isSameAtividade) && (
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

      {isMaster && !event.iscarroussel && (
        <button onClick={() => navigate(`/chaveamento/${event.nome}`)}>
          Consultar Lista de Inscritos
        </button>
      )}
    </div >
  );
});

export default Event;