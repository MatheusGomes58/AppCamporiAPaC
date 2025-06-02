import atividadesEspeciaisJson from '../data/atividadeEspeciaisMenu.json';
import atividadesJson from '../data/atividadeMenu.json';
import InscricaoTorneio from "../components/inscricao/inscricaoTorneio";
import InscricaoTrilha from "../components/inscricao/inscricaoTrilha";
import InscricaoCorrida from "../components/inscricao/inscricaoCorrida";
import InscricaoApresentacao from "../components/inscricao/inscricaoApresentacao";
import ScheduleForm from "../components/scedules/scheduleActivity";
import React, { useState } from "react";
import '../css/schedulePage.css';

const EventScheduler = ({ clube, admin, reserved, username, isMaster, isEspecial }) => {
  const [atividades, setatividades] = useState(isEspecial ? atividadesEspeciaisJson : atividadesJson);
  const [activeTab, setActiveTab] = useState(atividades[0]?.atividade || "");

  function renderTab() {
    if (activeTab == 'Torneios') {
      return <InscricaoTorneio
        clube={clube}
        admin={admin}
        ismaster={isMaster}
        activeTab={activeTab}
      />
    } else if (activeTab == 'Corridas') {
      return <InscricaoCorrida
        clube={clube}
        admin={admin}
        ismaster={isMaster}
      />
    } else if (activeTab == 'Trilha Noturna') {
      return <InscricaoTrilha
        clube={clube}
        admin={admin}
        ismaster={isMaster}
      />
    }  else if (activeTab == 'Apresentações Especiais') {
      return <InscricaoApresentacao
        clube={clube}
        admin={admin}
        ismaster={isMaster}
      />
    } else {
      return <ScheduleForm
        clube={clube}
        admin={admin}
        reserved={reserved}
        username={username}
        isMaster={isMaster}
        activeTab={activeTab}
      />
    }
  }

  return (
    <div className="schedule-page">
      <div className='event-card'>
        <div className="date-panel-container">
          {atividades.map((atv, i) => (
            <button
              key={i}
              className={atv.atividade === activeTab ? "date-panel active" : "date-panel"}
              onClick={() => setActiveTab(atv.atividade)}
            >
              {atv.atividade}
            </button>
          ))}
        </div>
        {/*
        <button onClick={() => window.location.href="/activities?text=Atividades%20Especiais"}>Leia as instruções das Atividades especiais</button>
        */}
        {renderTab()}
      </div>
    </div>
  );
};

export default EventScheduler;
