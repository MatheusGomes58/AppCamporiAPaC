import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import "../css/mapPage.css";
import mapImage from "../img/mapaCampori.png";
import mapData from "../data/mapData.json";

export default function MapComponent() {
    const [areas, setAreas] = useState([]);
    const [search, setSearch] = useState("");
    const [zoom, setZoom] = useState(1.5);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [userPosition, setUserPosition] = useState(null);
    const [searchParams] = useSearchParams();
    const mapWrapperRef = useRef(null);

    useEffect(() => {
        setAreas(mapData);

        const paramItem = searchParams.get("item");
        if (paramItem) {
            setSearch(paramItem);
            buscarItem(paramItem);
        }
    }, [searchParams]);

    const buscarItem = (term) => {
        setSearch(term);
        if (!term){ 
            setSelectedLocation(null)
            return;
        }

        let found = null;

        for (const area of mapData) {
            if (area.name.toLowerCase().includes(term.toLowerCase())) {
                found = { ...area, type: "area" };
                break;
            }

            for (const loc of area.locais || []) {
                if (loc.name.toLowerCase().includes(term.toLowerCase())) {
                    found = { ...loc, type: "local" };
                    break;
                }
            }

            if (found) break;
        }

        if (found) {
            setSelectedLocation(found);
            console.log("Destino encontrado:", found);
        } else {
            setSelectedLocation(null);
            console.log("Nada encontrado");
        }
    };

    const handleMapClick = (e) => {
        const rect = mapWrapperRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setUserPosition({ x, y });

        console.log( x, y)

        if (search) {
            buscarItem(search);
        }
    };

    const getRoute = (from, to) => {
        if (!from || !to) return [];
        return [from, to];
    };

    const route = getRoute(userPosition, selectedLocation);

    const zoomIn = () => setZoom(z => Math.min(z + 0.2, 10));
    const zoomOut = () => setZoom(z => Math.max(z - 0.2, 1));

    return (
        <div className="map-container">
            <div className="floating-controls">
                <input
                    type="text"
                    placeholder="Pesquisar área ou local..."
                    value={search}
                    onChange={(e) => buscarItem(e.target.value)}
                />
                <div>
                    <button onClick={zoomIn}>➕</button>
                    <button onClick={zoomOut}>➖</button>
                </div>
            </div>

            <div className="map-wrapper" onClick={handleMapClick} ref={mapWrapperRef}>
                <div
                    className="map-image-wrapper"
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: "center",
                        transition: "transform 0.3s ease",
                        position: "relative"
                    }}
                >
                    <img src={mapImage} alt="Mapa Campori" className="map-image" />

                    {/* Modo com item filtrado: mostrar só o destino */}
                    {selectedLocation && (
                        <div
                            className={selectedLocation.type === "area" ? "area-marker" : "marker"}
                            style={{ left: `${selectedLocation.x}%`, top: `${selectedLocation.y}%` }}
                            title={selectedLocation.name}
                        >
                            {selectedLocation.type === "area" ? (
                                selectedLocation.name
                            ) : (
                                <>
                                    <div className="pin">📍</div>
                                    <div className="tooltip">{selectedLocation.name}</div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Se não há filtro, mostrar tudo */}
                    {!selectedLocation && (
                        <>
                            {zoom <= 1.5 &&
                                areas.map(area => (
                                    <div
                                        key={area.id}
                                        className="area-marker"
                                        style={{ left: `${area.x}%`, top: `${area.y}%` }}
                                        title={area.name}
                                    >
                                        {area.name}
                                    </div>
                                ))}

                            {zoom > 1.5 &&
                                areas.flatMap(area =>
                                    area.locais?.map(loc => (
                                        <div
                                            key={loc.id}
                                            className="marker"
                                            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                                            title={loc.name}
                                        >
                                            <div className="pin">📍</div>
                                            <div className="tooltip">{loc.name}</div>
                                        </div>
                                    ))
                                )}
                        </>
                    )}

                    {/* Usuário */}
                    {userPosition && (
                        <div
                            className="user-position"
                            style={{ left: `${userPosition.x}%`, top: `${userPosition.y}%` }}
                            title="Sua posição"
                        >
                            🧍
                        </div>
                    )}

                    {/* Rota */}
                    {route.length === 2 && (
                        <svg className="route-line">
                            <line
                                x1={`${route[0].x}%`}
                                y1={`${route[0].y}%`}
                                x2={`${route[1].x}%`}
                                y2={`${route[1].y}%`}
                                stroke="blue"
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}
