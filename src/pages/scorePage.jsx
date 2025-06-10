import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { db } from "../components/firebase/firebase";
import { collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from "firebase/firestore";
import "../css/ScoreDashboard.css";
import clubs from '../data/clubes.json';
import ProgressStars from '../components/scores/starProgress'
import ScoreCircle from '../components/scores/scoreCircle'


export default function ScoreDashboard({ isMaster, isclub, register, uid, autorized }) {
    const [scores, setScores] = useState([]);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [club, setClub] = useState('');
    const [points, setPoints] = useState("");
    const [activity, setActivity] = useState("");
    const [filterClub, setFilterClub] = useState(!isMaster ? isclub : '');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDropdownSelectOpen, setIsDropdownSelectOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedPointIndex, setSelectedPointIndex] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [filterMyRecords, setFilterMyRecords] = useState(false);
    const [isInclude, setInclude] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState([]);
    const navigate = useNavigate();
    const rowsPerPage = 10;

    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d0ed57", "#a4de6c"];
    const avaliacaoUnicas = [...new Set(avaliacoes.map((data) => data.avaliacao))];
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState("");

    const toggleExpanded = (atividade) => {
        setExpandedGroups((prev) =>
            prev.includes(atividade)
                ? prev.filter((a) => a !== atividade)
                : [...prev, atividade]
        );
    };

    const avaliacoesFiltradas = avaliacaoSelecionada
        ? avaliacoes.filter((data) => data.avaliacao === avaliacaoSelecionada)
        : avaliacoes;


    useEffect(() => {
        if (isclub || isMaster) {
            const unsubscribe = onSnapshot(collection(db, "scores"), (querySnapshot) => {
                const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setScores(data);
            });

            const unsubscribeAvaliacoes = onSnapshot(collection(db, "pontuacao"), (querySnapshot) => {
                const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setAvaliacoes(data);
            });

            return unsubscribe, unsubscribeAvaliacoes;
        } else {
            alert('Faça o login para acessar essa funcionalidade!');
            navigate('/menu');
        }
    }, []);

    const addScore = async () => {
        if (!autorized) {
            alert('Você não tem permissões para registrar pontuações!');
            navigate('/menu');
            return;
        }

        const selectedAvaliacao = avaliacoesFiltradas[activity];

        if (club && selectedAvaliacao) {
            const { avaliacao, item, pontuacao } = selectedAvaliacao;

            await addDoc(collection(db, "scores"), {
                club,
                avaliacao,
                item,
                pontuacao: Number(pontuacao),
                uid,
                timestamp: new Date() // opcional: para controle de data/hora
            });

            setClub("");
            setPoints("");
            setActivity("");
            setAvaliacaoSelecionada("");
            setSearch("");
        } else {
            alert("Preencha todos os campos para cadastrar a pontuação!");
        }
    };

    const deleteScore = async (clubId, activityName) => {
        if (window.confirm("Você realmente deseja excluir este registro?")) {
            const clubDoc = scores.find(s => s.id === clubId);
            if (clubDoc) {
                if (clubDoc.activities.length === 1) {
                    // Se for a única atividade do clube, exclui o documento inteiro
                    await deleteDoc(doc(db, "scores", clubId));
                } else {
                    // Se houver mais atividades, filtra a atividade a ser excluída
                    await updateDoc(doc(db, "scores", clubId), {
                        activities: clubDoc.activities.filter(act => act.name !== activityName)
                    });
                }
            }
        }
    };

    const filteredScores = filterClub
        ? scores.filter((s) => s.club.toLowerCase().includes(filterClub.toLowerCase()))
        : scores;

    const myRecordsFilteredScores = filterMyRecords ? filteredScores.map(club => ({
        ...club,
        activities: club.activities.filter(activity => activity.uid === uid)
    })).filter(club => club.activities.length > 0) : filteredScores

    const totalScore = myRecordsFilteredScores.reduce(
        (sum, s) => sum + (s.pontuacao || 0),
        0
    );

    const activityScores = myRecordsFilteredScores.map(s => ({
        name: s.item,
        pontuacao: s.pontuacao
    }));

    const activityData = activityScores.reduce((acc, act) => {
        const existingActivity = acc.find(a => a.name === act.name);
        if (existingActivity) {
            existingActivity.pontuacao += act.pontuacao;
        } else {
            acc.push({ ...act });
        }
        return acc;
    }, []);

    const totalRows = myRecordsFilteredScores.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const paginatedData = myRecordsFilteredScores.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    ).map(s => ({
        club: s.club,
        activity: s.item,
        avaliation: s.avaliacao,
        points: s.pontuacao,
        clubId: s.id,
        uid: s.uid
    }));


    const paginatedDataGrouped = useMemo(() => {
        const grupos = {};

        paginatedData.forEach((score) => {
            const atividade = score.avaliation;
            if (!grupos[atividade]) grupos[atividade] = [];
            grupos[atividade].push(score);
        });

        return Object.entries(grupos).map(([atividade, entries]) => ({
            atividade,
            entries,
        }));
    }, [paginatedData]);

    const handleSelectClub = (clube) => {
        setFilterClub(clube);
        setIsDropdownOpen(false); // Fecha o dropdown após selecionar o clube
    };

    const handleRegisterClub = (clube) => {
        setClub(clube);
        setIsDropdownSelectOpen(false); // Fecha o dropdown após selecionar o clube
    };

    const handlePointClick = (index, score) => {
        if (score.uid === uid) {
            if (selectedPointIndex === index) {
                setSelectedPointIndex(null);
                setSelectedPoint(null);
            } else {
                setSelectedPointIndex(index);
                setSelectedPoint(score);
            }
        }
    };

    const handleEditScore = () => {
        if (selectedPoint) {
            const newPoints = prompt("Digite a nova pontuação:", selectedPoint.points);
            if (newPoints !== null) {
                updateScore(selectedPoint.clubId, selectedPoint.activity, newPoints);
            }
        }
    };

    const updateScore = async (clubId, activityName, newPoints) => {
        if (selectedPoint && selectedPoint.uid === uid) {
            const clubDoc = scores.find(s => s.id === clubId);
            if (clubDoc) {
                await updateDoc(doc(db, "scores", clubId), {
                    activities: clubDoc.activities.map(act =>
                        act.name === activityName ? { ...act, points: Number(newPoints) } : act
                    )
                });
            }
            setSelectedPoint(null);
        } else {
            alert("Você só pode editar seus próprios pontos!");
        }
    };

    const handleConfirmDelete = () => {
        if (selectedPoint) {
            deleteScore(selectedPoint.clubId, selectedPoint.activity);
        }
        setSelectedPointIndex(null);
        setSelectedPoint(null);
    };

    return (
        <div className="painelPontuacao">
            {isInclude && isMaster && register && <div className="cartaoEntradaPontuacao">
                <h2 className="tituloCartao">Registrar Pontuação</h2>
                <div className="grupoEntrada">
                    {!isDropdownSelectOpen && <input
                        className="campoEntrada"
                        type="text"
                        placeholder="Nome do Clube"
                        value={club}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setIsDropdownSelectOpen(true)}
                    />}

                    {isDropdownSelectOpen && (
                        <div className="customSelect">
                            <input
                                className="campoEntrada"
                                type="text"
                                placeholder="Pesquise seu clube"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setIsDropdownOpen(true)} // Abre o dropdown ao focar no campo
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
                        onChange={(e) => setAvaliacaoSelecionada(e.target.value)}
                    >
                        <option value="">Selecione uma atividade</option>
                        {avaliacaoUnicas.map((avaliacao, index) => (
                            <option key={index} value={avaliacao}>
                                {avaliacao}
                            </option>
                        ))}
                    </select>

                    <select
                        className="campoEntrada"
                        value={activity}
                        onChange={(e) => {
                            setActivity(e.target.value)
                            setAvaliacaoSelecionada(avaliacoesFiltradas[e.target.value]?.avaliacao)
                        }}
                    >
                        <option value="">Selecione um item</option>
                        {avaliacoesFiltradas.map((data, index) => (
                            <option key={index} value={index}>
                                {data.item}
                            </option>
                        ))}
                    </select>

                    <input
                        className="campoEntrada"
                        placeholder="Pontos"
                        type="number"
                        value={avaliacoesFiltradas[activity]?.pontuacao}
                        disabled={true}
                    />

                    <button className="botaoSubmeter" onClick={addScore}>
                        Adicionar
                    </button>
                    <button className="botaoCancelar" onClick={() => setInclude(false)}>
                        Cancelar
                    </button>
                </div>
            </div>}

            {!isInclude && isMaster && <div className="cartaoFiltro">
                <h2 className="tituloCartao">Filtrar por Clube</h2>

                {!isDropdownOpen && <input
                    className="campoEntrada"
                    type="text"
                    placeholder="Selecione o seu clube"
                    value={filterClub}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setIsDropdownOpen(true)}
                />}

                {isDropdownOpen && (
                    <div className="customSelect">
                        <input
                            className="campoEntrada"
                            type="text"
                            placeholder="Pesquise seu clube"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsDropdownOpen(true)} // Abre o dropdown ao focar no campo
                        />
                        <div className="selectTitle" onClick={() => handleSelectClub('')}>Selecione seu clube</div>
                        {clubs
                            .filter((c) => c.CLUBE.toLowerCase().includes(search.toLowerCase()))
                            .map((c, index) => (
                                <div key={index} className="optionItem" onClick={() => handleSelectClub(c.CLUBE)}>
                                    <div>{`Clube: ${c.CLUBE}`}</div>
                                    <div>{`Igreja: ${c.IGREJA}`}</div>
                                    <div>{`Distrito: ${c.DISTRITO}`}</div>
                                </div>
                            ))}
                    </div>
                )}
                <div className="filter-my-records">
                    <input
                        type="checkbox"
                        id="filterMyRecords"
                        checked={filterMyRecords}
                        onChange={() => setFilterMyRecords(!filterMyRecords)}
                    />
                    <label htmlFor="filterMyRecords">Filtrar meus registros</label>
                </div>
            </div>}

            {/* Card de pontuação total */}
            {!isInclude && !register && <div className="cartaoPontuacaoTotal">
                <h1 className="tituloCartao">Pontuação Atual</h1>
                <ScoreCircle activityData={activityData} totalScore={totalScore}/>
            </div>}

            {/* Card de pontuação total */}
            {!isInclude && !register && <div className="cartaoPontuacaoTotal">
                <ProgressStars totalScore={totalScore} />
            </div>}

            {!isInclude && (
                <div className="cartaoTabelaPontuacao">
                    <h2 className="tituloCartao">Pontuação por Clube</h2>
                    {register && autorized && (
                        <button onClick={() => setInclude(true)}>Incluir Pontos</button>
                    )}
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Atividade</th>
                                <th>Clube</th>
                                <th>Pontos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedDataGrouped.map(({ atividade, entries }, groupIndex) => (
                                <React.Fragment key={groupIndex}>
                                    {/* Cabeçalho da atividade (colapsável) */}
                                    <tr
                                        className="linhaGrupo"
                                        onClick={() => toggleExpanded(atividade)}
                                        style={{ cursor: "pointer", background: "#f1f1f1" }}
                                    >
                                        <td colSpan={3}>
                                            {atividade}
                                        </td>
                                    </tr>

                                    {/* Linhas de pontuação colapsáveis */}
                                    {expandedGroups.includes(atividade) &&
                                        entries.map((score, index) => {
                                            const compositeIndex = `${groupIndex}-${index}`;
                                            return (
                                                <React.Fragment key={compositeIndex}>
                                                    <tr onClick={() => handlePointClick(compositeIndex, score)}>
                                                        <td>{score.activity}</td>
                                                        <td>{score.club}</td>
                                                        <td>{score.points}</td>
                                                    </tr>
                                                    {selectedPointIndex === compositeIndex && (
                                                        <tr>
                                                            <td colSpan="3" style={{ textAlign: "center" }}>
                                                                <button onClick={() => handleEditScore(score)}>Editar</button>
                                                                <button onClick={() => handleConfirmDelete(score)}>Deletar</button>
                                                                <button onClick={() => setSelectedPointIndex(null)}>Cancelar</button>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    {/* Controles de Paginação */}
                    <div className="paginacao">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Anterior
                        </button>
                        <span>
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
