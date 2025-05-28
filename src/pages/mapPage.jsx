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

function IconSVG({ icon, x, y, size = 24, color = 'white' }) {
  if (!icon) return null;
  const svgPath = icon.icon[4];
  const width = icon.icon[0];
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
  const [zoom, setZoom] = useState(1);

  // Mapeia ícones para os pontos
  const pontos = pontosJSON.map((p) => ({
    ...p,
    icon: iconMap[p.icon] || faBuilding,
  }));

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Ao carregar a página, se query existe, seta a busca e seleciona ponto
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

  // Quando a busca muda e não é vazia, reseta o zoom para 1
  useEffect(() => {
    if (search.trim() !== '') {
      setZoom(1);
    }
  }, [search]);

  // Filtra pontos: se busca vazia, mostra todos, senão só os filtrados
  const pontosFiltrados = search.trim() === ''
    ? pontos
    : pontos.filter(
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

      <div className="mapa-zoom-wrapper">
        <div className="mapa-inner" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
          <svg
            viewBox="0 0 1024 768"
            className="mapa-svg"
            onClick={handleMapaClick}
          >
            <image href={mapa} x="0" y="0" width="1024" height="768" />

            {pontosFiltrados.map((p) => {
              const isSelected = selectedId === p.id;
              const scale = (p.tamanho || 1) * (isSelected && zoom === 1 ? 2.4 : 1);
              const baseRadius = 28;
              const iconSize = 24 * scale;

              return (
                <g
                  key={p.id}
                  className={`mapa-ponto ${isSelected && zoom === 1 ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(p.id);
                    setSearch(p.nome);
                  }}
                  cursor="pointer"
                >
                  <circle cx={p.x} cy={p.y} r={baseRadius * scale} fill={p.cor} />
                  <IconSVG
                    icon={p.icon}
                    x={p.x - iconSize / 2}
                    y={p.y - iconSize / 2}
                    size={iconSize}
                    color="white"
                  />
                  <text
                    x={p.x}
                    y={p.y - baseRadius * scale - 5}
                    fontSize={18 * scale}
                    textAnchor="middle"
                    fill="white"
                    fontWeight="600"
                    pointerEvents="none"
                    style={{ userSelect: 'none', fontFamily: 'Arial, sans-serif' }}
                  >
                    {p.nome}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="zoom-controls">
        <button onClick={() => setZoom((z) => Math.min(z + 0.2, 20))}>+</button>
        <button onClick={() => setZoom((z) => Math.max(z - 0.2, 1))}>-</button>
      </div>
    </div>
  );
}
