import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import mapa from '../img/mapaCampori.png';
import '../css/mapPage.css';

import pontosJSON from '../data/mapData.json';

import {
  faBuilding,
  faShoppingCart,
  faMicrophone,
  faUtensils,
  faShower,
  faToilet,
  faFileAlt,
  faDumbbell,
  faCampground,
  faInfoCircle,
  faChurch,
  faStore,
  faBed,
  faFlag,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

// Mapeia string do JSON para ícones FontAwesome
const iconMap = {
  building: faBuilding,
  'shopping-cart': faShoppingCart,
  microphone: faMicrophone,
  utensils: faUtensils,
  shower: faShower,
  toilet: faToilet,
  file: faFileAlt,
  atividades: faDumbbell,
  campground: faCampground,
  info: faInfoCircle,
  igreja: faChurch,
  loja: faStore,
  hospedagem: faBed,
  secretaria: faFileAlt,
  bandeira: faFlag,
  grupo: faUsers
};


// Componente para desenhar o ícone FontAwesome direto dentro do SVG
function IconSVG({ icon, x, y, size = 24, color = 'white' }) {
  if (!icon) return null;

  // icon.icon é um array, o 5º item (index 4) é o path SVG (string)
  const svgPath = icon.icon[4];
  const width = icon.icon[0];
  const height = icon.icon[1];

  return (
    <g transform={`translate(${x},${y}) scale(${size / width})`} fill={color}>
      <path d={svgPath} />
    </g>
  );
}

export default function MapaSVG() {
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const query = queryParams.get('localizacao') || '';

  const pontos = pontosJSON.map((p) => ({
    ...p,
    icon: iconMap[p.icon] || faBuilding,
  }));

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (query) {
      setSearch(query.toUpperCase());
      const pontoEncontrado = pontos.find(
        (p) => p.id.toLowerCase() === query.toLowerCase() || p.nome.toUpperCase() === query.toUpperCase()
      );
      if (pontoEncontrado) {
        setSelectedId(pontoEncontrado.id);
      }
    }
  }, [query, pontos]);

  const pontosFiltrados = pontos.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleMapaClick = (event) => {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();

    const scaleX = 1024 / rect.width;
    const scaleY = 768 / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    console.log(`Coordenadas no mapa:\nX: ${Math.round(x)}, Y: ${Math.round(y)}`);
  };

  return (
    <div className="mapa-container">
      <input
        type="text"
        placeholder="Pesquisar local..."
        className="search-bar"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setSelectedId(null);
        }}
      />
      <svg
        viewBox="0 0 1024 768"
        className="mapa-svg"
        preserveAspectRatio="xMidYMid meet"
        onClick={handleMapaClick} // <-- Clique geral no mapa
      >
        <image href={mapa} x="0" y="0" width="1024" height="768" />

        {pontosFiltrados.map((p) => (
          <g
            key={p.id}
            className={`mapa-ponto ${selectedId === p.id ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(p.id);
              setSearch(p.nome);
            }}
            cursor="pointer"
          >
            <circle cx={p.x} cy={p.y} r="28" fill={p.cor} />
            <IconSVG icon={p.icon} x={p.x - 12} y={p.y - 12} size={24} color="white" />
            <text
              x={p.x}
              y={p.y - 40}
              fontSize="24"
              textAnchor="middle"
              fill="white"
              fontWeight="600"
              pointerEvents="none"
              style={{ userSelect: 'none', fontFamily: 'Arial, sans-serif' }}
            >
              {p.nome}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
