import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { db } from "../firebase/firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

export default function RegisterScore({ autorized, avaliacoes, clubs, uid, closeModal, present }) {
    const [club, setClub] = useState('');
    const [search, setSearch] = useState('');
    const [activity, setActivity] = useState("");
    const [activityScore, setActivityScore] = useState("");
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState("");
    const [isDropdownSelectOpen, setIsDropdownSelectOpen] = useState(false);
    const [scoresRegistrados, setScoresRegistrados] = useState([]);

    const navigate = useNavigate();

    const avaliacaoUnicas = [...new Set(avaliacoes.map((data) => data.avaliacao))];

    const avaliacoesFiltradas = avaliacaoSelecionada
        ? avaliacoes.filter((data) => data.avaliacao === avaliacaoSelecionada)
        : [];

    const avaliacoesNaoRegistradas = avaliacoesFiltradas.filter(
        (data) => !scoresRegistrados.includes(data.item)
    );

    const handleRegisterClub = (nome) => {
        setClub(nome);
        setSearch(nome);
        setIsDropdownSelectOpen(false);
    };

    useEffect(() => {
        if (club) {
            const unsubscribe = onSnapshot(
                collection(db, "scores"),
                (snapshot) => {
                    const dados = snapshot.docs
                        .map(doc => doc.data())
                        .filter(score => score.club === club)
                        .map(score => score.item);
                    setScoresRegistrados(dados);
                }
            );
            return () => unsubscribe();
        } else {
            setScoresRegistrados([]);
        }
    }, [club]);

    const addScore = async () => {
        if (!autorized) {
            alert('Você não tem permissões para registrar pontuações!');
            navigate('/menu');
            return;
        }

        if (!uid) {
            alert("Usuário não autenticado. Faça login novamente.");
            return;
        }

        const selectedAvaliacao = avaliacoesFiltradas[activity];

        if (!selectedAvaliacao || !club || !setActivity || !setActivityScore) {
            alert("Preencha todos os campos para cadastrar a pontuação!");
            return;
        }

        const { item } = selectedAvaliacao;

        if (scoresRegistrados.includes(item)) {
            alert("Este item já foi registrado para este clube!");
            return;
        }

        const { avaliacao } = selectedAvaliacao;

        await addDoc(collection(db, "scores"), {
            club,
            avaliacao,
            item,
            pontuacao: Number(activityScore),
            ...(present ? { isActivitie: true } : {}),
            uid,
            timestamp: new Date()
        });

        setActivity("");
        setActivityScore("")
        setIsDropdownSelectOpen(false);
        alert("Pontuação registrada com sucesso!");
    };

    return (
        <div className="modal-overlay" onClick={() => closeModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="tituloCartao">Registrar {present ? "Presença" : "Pontuação"}</h2>
                <div className="grupoEntrada">
                    {!isDropdownSelectOpen && (
                        <input
                            className="campoEntrada"
                            type="text"
                            placeholder="Nome do Clube"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsDropdownSelectOpen(true)}
                        />
                    )}

                    {isDropdownSelectOpen && (
                        <div className="customSelect">
                            <input
                                className="campoEntrada"
                                type="text"
                                placeholder="Pesquise seu clube"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <div className="selectTitle" onClick={() => handleRegisterClub('')}>Selecione seu clube</div>
                            {clubs
                                .filter((c) => c.CLUBE.toLowerCase().includes(search.toLowerCase()))
                                .map((c, index) => (
                                    <div key={index} className="optionItem" onClick={() => handleRegisterClub(c.CLUBE)}>
                                        <div>{`Clube: ${c.CLUBE}`}</div>
                                        <div>{`Igreja: ${c.IGREJA}`}</div>
                                        <div>{`Distrito: ${c.DISTRITO}`}</div>
                                    </div>
                                ))}
                        </div>
                    )}

                    <select
                        className="campoEntrada"
                        value={avaliacaoSelecionada}
                        onChange={(e) => {
                            setAvaliacaoSelecionada(e.target.value);
                            setActivity("");
                        }}
                    >
                        <option value="">Selecione uma atividade</option>
                        {avaliacaoUnicas.map((avaliacao, index) => (
                            <option key={index} value={avaliacao}>
                                {avaliacao}
                            </option>
                        ))}
                    </select>

                    {avaliacoesNaoRegistradas.length > 0 ? (
                        <select
                            className="campoEntrada"
                            value={activity}
                            onChange={(e) => setActivity(e.target.value)}
                        >
                            <option value="">Selecione um item</option>
                            {avaliacoesNaoRegistradas.map((data, index) => (
                                <option key={index} value={avaliacoesFiltradas.indexOf(data)}>
                                    {data.item}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="campoEntrada">
                            Todos os itens dessa atividade já foram registrados para este clube.
                        </div>
                    )}

                    {avaliacoesFiltradas[activity]?.pontuacao?.length > 0 ? (
                        <select
                            className="campoEntrada"
                            value={activityScore}
                            onChange={(e) => setActivityScore(e.target.value)}
                        >
                            <option value="">Selecione uma opção</option>
                            {avaliacoesFiltradas[activity]?.pontuacao.map((data, index) => (
                                <option key={index} value={data.value}>
                                    {data.title}
                                </option>
                            ))}
                            <option value={0}>Não Executou</option>
                        </select>
                    ) : (
                        <select
                            className="campoEntrada"
                            value={activityScore}
                            onChange={(e) => setActivityScore(e.target.value)}
                        >
                            <option value="">Selecione uma opção</option>
                            <option value={avaliacoesFiltradas[activity]?.pontuacao}>Executou com Sucesso</option>
                            <option value={0}>Não Executou</option>
                        </select>
                    )}

                    <input
                        className="campoEntrada"
                        placeholder="Pontos"
                        type="number"
                        value={activityScore}
                        disabled
                    />

                    <button
                        className="botaoSubmeter"
                        onClick={addScore}
                        disabled={!club || activity === "" || !avaliacoesFiltradas[activity]}
                    >
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    );
}
