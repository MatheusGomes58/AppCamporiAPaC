import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import mapa from '../img/mapaCampori.png';
import '../css/mapPage.css';

import pontosJSON from '../data/mapData.json';

import {
  faBuilding, faShoppingCart, faMicrophone, faUtensils, faShower,
  faToilet, faFileAlt, faDumbbell, faCampground, faInfoCircle,
  faChurch, faStore, faBed, faFlag, faUsers, faLandmark
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

const centerLat = -22.503611;
const centerLng = -47.163056;
const centerX = 512;
const centerY = 384;

function latLngToXY(lat, lng) {
  const scale = 10000;
  const dx = (lng - centerLng) * scale;
  const dy = (lat - centerLat) * scale;
  return { x: centerX + dx, y: centerY - dy };
}

export default function MapaSVG() {
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const query = queryParams.get('localizacao') || '';
  const [zoom, setZoom] = useState(3);
  const ranInitialQuery = useRef(false);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const wrapperRef = useRef(null);

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

  const pontos = useMemo(() => grupos.flatMap(g => g.pontos), [grupos]);


  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Aguardar render e aplicar scroll centralizado
    const centralizarScroll = () => {
      const larguraImagem = 1024 * zoom;
      const alturaImagem = 768 * zoom;
      const larguraWrapper = wrapper.clientWidth;
      const alturaWrapper = wrapper.clientHeight;

      // Só centraliza se os tamanhos forem válidos
      if (larguraWrapper === 0 || alturaWrapper === 0) {
        requestAnimationFrame(centralizarScroll);
        return;
      }

      wrapper.scrollLeft = (larguraImagem - larguraWrapper) / 2;
      wrapper.scrollTop = (alturaImagem - alturaWrapper) / 2;
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(centralizarScroll);
    });
  }, []);


  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition(latLngToXY(latitude, longitude));
      },
      (error) => console.error("Erro ao obter localização:", error),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ... código antes igual ...

  useEffect(() => {
    if (!ranInitialQuery.current && query) {
      ranInitialQuery.current = true;
      const pontoEncontrado = pontos.find(
        (p) =>
          p.nome.toLowerCase().includes(query.toLowerCase()) ||
          p.id.toLowerCase().includes(query.toLowerCase())
      );
      if (pontoEncontrado) {
        setHighlightedId(pontoEncontrado.id);
        setSelectedId(null);
        setSearch('');
        // REMOVIDO: centralização e zoom automático
      } else {
        setSearch(query);
      }

      const url = new URL(window.location);
      url.searchParams.delete('localizacao');
      window.history.replaceState({}, '', url);
    }
  }, [query, pontos]);

  useEffect(() => {
    if (search.trim() === '') {
      setHighlightedId(null);
      return;
    }

    const termo = search.toLowerCase();
    const resultados = pontos.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.id.toLowerCase().includes(termo)
    );

    if (resultados.length === 1) {
      const ponto = resultados[0];
      setHighlightedId(ponto.id);
      // NÃO mexer em zoom ou scroll aqui
    } else {
      setHighlightedId(null);
    }
  }, [search]);


  const pontosFiltrados = useMemo(() => {
    if (selectedId) return pontos.filter((p) => p.id === selectedId);
    if (search.trim() === '') return pontos.filter((p) => zoom >= p.minZoom && zoom <= p.maxZoom);
    const termo = search.toLowerCase();
    return pontos.filter((p) =>
      p.nome.toLowerCase().includes(termo) || p.id.toLowerCase().includes(termo)
    );
  }, [zoom, search, selectedId, pontos]);

  const handleMapaClick = (event) => {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = 1024 / rect.width;
    const scaleY = 768 / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    console.log(`"y": ${Math.round(y)},\n"x": ${Math.round(x)},\n`);
    setSearch('');
    setSelectedId(null);
    setHighlightedId(null);
  };

  const zoomInOuOutComFoco = (novoZoom, idCentralizar = null) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;

    // Se tiver id para centralizar, busca o ponto específico
    let pontoCentralizar = null;
    if (idCentralizar) {
      pontoCentralizar = pontos.find(p => p.id === idCentralizar);
    }

    if (!pontoCentralizar) {
      // Sem ponto específico, centraliza no ponto mais próximo do centro atual (comportamento original)
      const scrollLeftAntes = wrapper.scrollLeft;
      const scrollTopAntes = wrapper.scrollTop;

      const centroXAtual = (scrollLeftAntes + width / 2) / zoom;
      const centroYAtual = (scrollTopAntes + height / 2) / zoom;

      const pontosVisiveis = pontos.filter(p => novoZoom >= p.minZoom && novoZoom <= p.maxZoom);

      let pontoMaisProximo = null;
      let menorDistancia = Infinity;

      for (const p of pontosVisiveis) {
        const dx = centroXAtual - p.x;
        const dy = centroYAtual - p.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          pontoMaisProximo = p;
        }
      }

      pontoCentralizar = pontoMaisProximo;
    }

    setZoom(novoZoom);

    if (!pontoCentralizar) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const novoCentroX = pontoCentralizar.x * novoZoom;
        const novoCentroY = pontoCentralizar.y * novoZoom;
        wrapper.scrollLeft = novoCentroX - width / 2;
        wrapper.scrollTop = novoCentroY - height / 2;
      });
    });
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

      <div className="mapa-zoom-wrapper" ref={wrapperRef}>
        <div className="mapa-inner" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
          <svg viewBox="0 0 1024 768" className="mapa-svg" onClick={handleMapaClick}>
            <image href={mapa} x="0" y="0" width="1024" height="768" />

            {pontosFiltrados.map((p) => {
              const isSelected = selectedId === p.id;
              const isHighlighted = highlightedId === p.id && !isSelected;

              const pontoBase = p.tamanho || 1.0;
              const inverseZoom = isSelected ? 2 / zoom : 1.0 / (zoom !== 1 ? zoom / 2 : 1);
              const scale = pontoBase * (isHighlighted ? 1.5 : inverseZoom);

              const iconSize = 12 * scale;
              const tooltipWidth = 150 * scale;
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
                    setSearch('');
                    setHighlightedId(null);
                  }}
                  cursor="pointer"
                >
                  <g
                    transform={`translate(${p.x - iconSize / 2}, ${p.y - iconSize / 2}) scale(${iconSize / (p.icon.icon[0] || 512)})`}
                  >
                    <path d={p.icon.icon[4]} fill={p.cor} />
                  </g>

                  <text
                    x={p.x}
                    y={p.y - 20 * scale}
                    fill="black"
                    fontSize={fontSize * 1.2}
                    textAnchor="middle"
                    style={{ pointerEvents: 'none' }}
                  >
                    {p.nome}
                  </text>

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

            {/*userPosition && (
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
            )*/}
          </svg>
        </div>
      </div>

      <div className="zoom-controls">
        <button onClick={() => zoomInOuOutComFoco(Math.min(zoom + 1, 30))}>+</button>
        <button onClick={() => zoomInOuOutComFoco(1)}>{zoom < 10 ? "0" + zoom : zoom}X</button>
        <button onClick={() => zoomInOuOutComFoco(Math.max(zoom - 1, 1))}>-</button>
      </div>
    </div>
  );
}
