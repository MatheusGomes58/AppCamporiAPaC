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
    setSearch(search ? '' : search)
    setSelectedId(selectedId ? null : selectedId);
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
              const pontoBase = p.tamanho || 1.4;

              const inverseZoom = 1.5 / (zoom != 1 ? zoom / 2 : 1); // <-- Zoom inverso: reduz com o aumento do zoom
              const scale = pontoBase * inverseZoom;

              const iconSize = 12 * scale;
              const tooltipWidth = 250 * scale;
              const tooltipHeight = 200 * scale;
              const fontSize = 5 * scale;
              const padding = 4 * scale;
              const offsetX = 20 * scale;
              const offsetY = 50 * scale;

              return (
                <g
                  key={p.id}
                  className={`mapa-ponto ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(p.id === selectedId ? null : p.id);
                    setSearch(search ? '' : p.nome);
                  }}
                  cursor="pointer"
                >
                  {/* PIN */}
                  <path
                    d="M0 -30 C15 -30 15 -10 0 0 C-15 -10 -15 -30 0 -30 Z"
                    transform={`translate(${p.x}, ${p.y}) scale(${scale})`}
                    fill={p.cor}
                  />

                  {/* Ícone */}
                  <g
                    transform={`translate(${p.x - iconSize / 2}, ${p.y - iconSize / 1.3 - 15 * scale}) scale(${iconSize / (p.icon.icon[0] || 512)})`}
                  >
                    <path
                      d={p.icon.icon[4]}
                      fill="white"
                    />
                  </g>

                  {/* Tooltip */}
                  {isSelected && (
                    <foreignObject
                      x={p.x + offsetX}
                      y={p.y - offsetY}
                      width={tooltipWidth}
                      height={tooltipHeight}
                    >
                      <div
                        xmlns="http://www.w3.org/1999/xhtml"
                        className="tooltip-box"
                        style={{
                          fontSize: `${fontSize}px`,
                          padding: `${padding}px`,
                          boxShadow: `0px 0px ${scale * 8}px ${scale * 10}px rgba(0, 0, 0, 0.06)`
                        }}

                      >
                        <strong>{p.nome}</strong>
                        <p>{p.descricao || "Sem descrição"}</p>
                        <small>
                          Coordenadas: X: {Math.round(p.x)} / Y: {Math.round(p.y)}
                        </small>
                      </div>
                    </foreignObject>
                  )}
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
        <button onClick={() => setZoom((z) => Math.min(z + 1, 40))}>+</button>
        <button onClick={() => setZoom(1)}>{zoom < 10 ? "0" + zoom : zoom}X</button>
        <button onClick={() => setZoom((z) => Math.max(z - 1, 1))}>-</button>
      </div>
    </div>
  );
}
