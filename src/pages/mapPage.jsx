import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  faLandmark
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
  grupo: faUsers,
  museu: faLandmark
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

const centerLat = -22.503611;
const centerLng = -47.163056;
const centerX = 512;
const centerY = 384;

function latLngToXY(lat, lng) {
  const scale = 10000;
  const dx = (lng - centerLng) * scale;
  const dy = (lat - centerLat) * scale;

  return {
    x: centerX + dx,
    y: centerY - dy
  };
}

export default function MapaSVG() {
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const query = queryParams.get('localizacao') || '';
  const [zoom, setZoom] = useState(1);
  const ranInitialQuery = useRef(false);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [userPosition, setUserPosition] = useState(null);

  // Correção aqui: acessar a propriedade "grupos" do JSON
  const grupos = useMemo(() =>
    pontosJSON.grupos.map((g) => ({
      ...g,
      pontos: g.itens.map((p) => ({
        ...p,
        icon: iconMap[p.icon] || faBuilding,
        cor: g.cor,
        grupo: g.nome,
        minZoom: p.zoomMin ?? 1,
        maxZoom: p.zoomMax ?? 20
      }))
    })), [pontosJSON]
  );

  // Flatmap para todos os pontos
  const pontos = useMemo(() => grupos.flatMap(g => g.pontos), [grupos]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = latLngToXY(latitude, longitude);
        setUserPosition(coords);
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (!ranInitialQuery.current && query) {
      ranInitialQuery.current = true;
      setSearch(query.toUpperCase());
      const pontoEncontrado = pontos.find(
        (p) => p.id.toLowerCase() === query.toLowerCase() || p.nome.toUpperCase() === query.toUpperCase()
      );
      if (pontoEncontrado) {
        setSelectedId(pontoEncontrado.id);
      }
      const url = new URL(window.location);
      url.searchParams.delete('localizacao');
      window.history.replaceState({}, '', url);
    }
  }, [query, pontos]);

  const pontosFiltrados = useMemo(() => {
    if (search.trim() === "") {
      // Filtra pelos pontos visíveis no zoom atual
      return pontos.filter((p) => zoom >= p.minZoom && zoom <= p.maxZoom);
    } else {
      // Busca: ignora filtro de zoom e retorna todos que batem na busca
      const termo = search.toLowerCase();
      return pontos.filter(
        (p) =>
          p.nome.toLowerCase().includes(termo) || p.id.toLowerCase().includes(termo)
      );
    }
  }, [zoom, search]);

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
              const scale = (p.tamanho || 1) * (isSelected ? 2.4 : 1);
              const baseRadius = 28;
              const iconSize = 24 * scale;

              return (
                <g
                  key={p.id}
                  className={`mapa-ponto ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(!selectedId ? p.id : null);
                    setSearch(!search ? p.nome : "");
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

            {userPosition && (
              <g>
                <circle
                  cx={userPosition.x}
                  cy={userPosition.y}
                  r={12}
                  fill="blue"
                  stroke="white"
                  strokeWidth={2}
                />
                <text
                  x={userPosition.x}
                  y={userPosition.y - 15}
                  fill="white"
                  fontSize={14}
                  textAnchor="middle"
                >
                  Você
                </text>
              </g>
            )}
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
