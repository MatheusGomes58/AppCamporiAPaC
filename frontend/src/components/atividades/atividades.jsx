import React, { useEffect, useState } from "react";
import atividadesData from "../../data/atividadeEspeciaisMenu.json";

const AtividadesWidget = () => {
    const [atividades, setAtividades] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const porPagina = 3;

    useEffect(() => {
        setAtividades(atividadesData);
    }, []);

    const totalPaginas = Math.ceil(atividades.length / porPagina);
    const inicio = (paginaAtual - 1) * porPagina;
    const fim = inicio + porPagina;
    const atividadesPaginadas = atividades.slice(inicio, fim);

    const mudarPagina = (direcao) => {
        if (direcao === "anterior" && paginaAtual > 1) {
            setPaginaAtual(paginaAtual - 1);
        } else if (direcao === "proxima" && paginaAtual < totalPaginas) {
            setPaginaAtual(paginaAtual + 1);
        }
    };

    return (
        <div className="widget-container">
            <div className="atividades-grid minimal">
                {atividadesPaginadas.map((item, index) => (
                    <div key={index} className="atividade-card minimal">
                        <h3 className="atividade-titulo">{item.atividade}</h3>
                        <p className="atividade-descricao">{item.descricao}</p>
                    </div>
                ))}
            </div>

            <div className="chat-slider-controls">
                <button
                    onClick={() => mudarPagina("anterior")}
                    disabled={paginaAtual === 1}
                >
                    &lt;
                </button>
                <span className="pagina-info">
                    Página {paginaAtual} de {totalPaginas}
                </span>
                <button
                    onClick={() => mudarPagina("proxima")}
                    disabled={paginaAtual === totalPaginas}
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default AtividadesWidget;
