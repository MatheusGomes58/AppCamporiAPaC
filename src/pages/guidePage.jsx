import React, { useEffect, useState } from 'react';
import '../css/guidePage.css';
import guideData from '../data/guideData.json';
import Card from '../components/cards/cards';

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
                    <Card
                        key={index}
                        title={guide.title}
                        text={guide.description[0].slice(0, 50)}
                        size={'small'}
                        onClick={() => openGuide(index)}
                    />
                ))}
            </div>

            {/* Modal para exibir detalhes do guia */}
            {currentGuide && (
                <div className="modal-overlay" onClick={closeGuide}>
                    <div className="modal-content">
                        <div className='guide-card'>
                            <h3 className="guide-title">{currentGuide.title}</h3>
                            <div className="guideData">
                                {currentGuide.description.map((desc, i) => (
                                    <p key={i} className="guideDescription">{desc}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GuidePage;
