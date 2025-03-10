import React, { useEffect, useState } from 'react';
import '../css/guidePage.css';
import guideData from '../data/guideData.json';

function GuidePage() {
    const [guides, setGuides] = useState([]);
    const [currentGuide, setCurrentGuide] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setGuides(guideData);
    }, []);

    // Abrir um guia no modal
    const openGuide = (index) => {
        setCurrentGuide(guides[index]);
        setCurrentIndex(index);
    };

    // Fechar modal
    const closeGuide = () => {
        setCurrentGuide(null);
    };

    // Navegação
    const nextGuide = () => {
        if (currentIndex < guides.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentGuide(guides[currentIndex + 1]);
        }
    };

    const prevGuide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setCurrentGuide(guides[currentIndex - 1]);
        }
    };

    return (
        <div className="guide">
            <h2 className="guide-title">Guia de Orientações Gerais do Evento</h2>

            {/* Lista de guias no formato de cards */}
            <div className="guide-columns">
                {guides.map((guide, index) => (
                    <div key={index} className="guide-card" onClick={() => openGuide(index)}>
                        <div className="guide-card-content">
                            <h3>{guide.title}</h3>
                            <p>{guide.description[0].slice(0, 50)}...</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal para exibir detalhes do guia */}
            {currentGuide && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className='guide-card'>
                            <span className="close-button" onClick={closeGuide}>&times;</span>
                            <h3 className="guide-title">{currentGuide.title}</h3>
                            <div className="guideData">
                                {currentGuide.description.map((desc, i) => (
                                    <p key={i} className="guideDescription">{desc}</p>
                                ))}
                            </div>

                            {/* Botões de navegação */}
                            <div className="guide-columns-buttons">
                                <button className="guide-button" onClick={prevGuide} disabled={currentIndex === 0}>
                                    ← Anterior
                                </button>
                                <button className="guide-button" onClick={nextGuide} disabled={currentIndex === guides.length - 1}>
                                    Próximo →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GuidePage;
