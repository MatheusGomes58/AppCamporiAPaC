import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../components/firebase/firebase";
import { collection, query, where, doc, onSnapshot, deleteDoc } from "firebase/firestore";
import "../css/ScoreDashboard.css";
import clubs from '../data/clubes.json';
import ProgressStars from '../components/scores/starProgress';
import ScoreCircle from '../components/scores/scoreCircle';
import RegisterScore from '../components/scores/registerScore';

export default function ScoreDashboard({ isMaster, isclub, register, uid, autorized, admin, present }) {
    const [searchParams] = useSearchParams();
    const urlClub = decodeURIComponent(searchParams.get("clube") || "");
    const isClubFromUrl = !!urlClub;

    const [showModal, setShowModal] = useState(false);
    const [scores, setScores] = useState([]);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [filterClub, setFilterClub] = useState(!isMaster ? isclub : urlClub);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedPointIndex, setSelectedPointIndex] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [filterMyRecords, setFilterMyRecords] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState([]);

    const toggleExpanded = (atividade) => {
        setExpandedGroups((prev) =>
            prev.includes(atividade)
                ? prev.filter((a) => a !== atividade)
                : [...prev, atividade]
        );
    };

    useEffect(() => {
        const pontoRef = collection(db, "pontuacao");
        const scoresRef = collection(db, "scores");

        const q = present ? query(pontoRef, where("isActivitie", "==", true)) : query(pontoRef);
        const q2 = present ? query(scoresRef, where("isActivitie", "==", true)) : query(scoresRef);

        const unsubscribe = onSnapshot(q2, (querySnapshot) => {
            const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setScores(data);
        });

        const unsubscribeAvaliacoes = onSnapshot(q, (querySnapshot) => {
            const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setAvaliacoes(data);
        });

        return () => {
            unsubscribe();
            unsubscribeAvaliacoes();
        };
    }, [present]);

    const deleteScore = async (clubId) => {
        if (window.confirm("Você realmente deseja excluir este registro?")) {
            const clubDoc = scores.find(s => s.id === clubId);
            if (clubDoc) {
                await deleteDoc(doc(db, "scores", clubId));
            }
        }
    };

    const filteredScores = filterClub
        ? scores.filter((s) => s.club?.toLowerCase().includes(filterClub.toLowerCase()))
        : scores;

    const myRecordsFilteredScores = filterMyRecords
        ? filteredScores.filter((s) => s.uid?.toLowerCase().includes(uid))
        : filteredScores;

    const totalScore = myRecordsFilteredScores.reduce(
        (sum, s) => sum + (Number(s.pontuacao) || 0),
        0
    );

    const allData = myRecordsFilteredScores.map(s => ({
        club: s.club,
        activity: s.item,
        avaliation: s.avaliacao,
        points: Number(s.pontuacao) || 0,
        clubId: s.id,
        uid: s.uid
    }));

    const paginatedDataGrouped = useMemo(() => {
        const grupos = {};
        allData.forEach((score) => {
            const atividade = score.avaliation;
            if (!grupos[atividade]) grupos[atividade] = [];
            grupos[atividade].push(score);
        });
        return Object.entries(grupos).map(([atividade, entries]) => ({
            atividade,
            entries,
        }));
    }, [allData]);

    const handleSelectClub = (clube) => {
        setFilterClub(clube);
        setIsDropdownOpen(false);
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

    const handleConfirmDelete = () => {
        if (selectedPoint) {
            deleteScore(selectedPoint.clubId, selectedPoint.activity);
        }
        setSelectedPointIndex(null);
        setSelectedPoint(null);
    };

    return (
        <div className="painelPontuacao">
            {showModal && (
                <RegisterScore
                    present={present}
                    avaliacoes={avaliacoes}
                    autorized={autorized}
                    clubs={clubs}
                    closeModal={setShowModal}
                    uid={uid}
                />
            )}

            {isMaster && !isClubFromUrl && (
                <div className="cartaoFiltro">
                    <h2 className="tituloCartao">Filtrar por Clube</h2>

                    {!isDropdownOpen && (
                        <input
                            className="campoEntrada"
                            type="text"
                            placeholder="Selecione o seu clube"
                            value={filterClub}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsDropdownOpen(true)}
                        />
                    )}

                    {isDropdownOpen && (
                        <div className="customSelect">
                            <input
                                className="campoEntrada"
                                type="text"
                                placeholder="Pesquise seu clube"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setIsDropdownOpen(true)}
                            />
                            <div className="selectTitle" onClick={() => handleSelectClub('')}>
                                Selecione seu clube
                            </div>
                            {clubs
                                .filter((c) =>
                                    c.CLUBE.toLowerCase().includes(search.toLowerCase())
                                )
                                .map((c, index) => (
                                    <div
                                        key={index}
                                        className="optionItem"
                                        onClick={() => handleSelectClub(c.CLUBE)}
                                    >
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

                    {register && autorized && (
                        <button onClick={() => setShowModal(true)}>
                            {present ? "Registrar Presença" : "Incluir Pontos"}
                        </button>
                    )}
                </div>
            )}

            {!register && (
                <>
                    <div className="cartaoPontuacaoTotal">
                        <h1 className="tituloCartao">Pontuação Atual</h1>
                        <ScoreCircle paginatedDataGrouped={paginatedDataGrouped} totalScore={totalScore} />
                    </div>
                    <div className="cartaoPontuacaoTotal">
                        <ProgressStars totalScore={totalScore} />
                    </div>
                </>
            )}

            <div className="cartaoTabelaPontuacao">
                <h2 className="tituloCartao">
                    {(present ? "Presença do " : "Pontuação por ") + "Clube"}
                </h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Atividade</th>
                            <th>Clube</th>
                            {autorized && <td>{present ? "Fiscal" : "Avaliador"}</td>}
                            {!present && <th>Pontos</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedDataGrouped.map(({ atividade, entries }, groupIndex) => (
                            <React.Fragment key={groupIndex}>
                                <tr
                                    className="linhaGrupo"
                                    onClick={() => toggleExpanded(atividade)}
                                    style={{ cursor: "pointer", background: "#f1f1f1" }}
                                >
                                    <td colSpan={autorized ? 3 : 2}>{atividade}</td>
                                    {!present && (
                                        <td>
                                            {entries.reduce(
                                                (total, entry) => total + (Number(entry.points) || 0),
                                                0
                                            )} pts
                                        </td>
                                    )}
                                </tr>

                                {expandedGroups.includes(atividade) &&
                                    entries.map((score, index) => {
                                        const compositeIndex = `${groupIndex}-${index}`;
                                        return (
                                            <React.Fragment key={compositeIndex}>
                                                <tr onClick={() => handlePointClick(compositeIndex, score)}>
                                                    <td>{score.activity}</td>
                                                    <td>{score.club}</td>
                                                    {autorized && <td>{score.uid}</td>}
                                                    {!present && <td>{Number(score.points) || 0}</td>}
                                                </tr>
                                                {selectedPointIndex === compositeIndex && admin && isMaster && (
                                                    <tr>
                                                        <td colSpan={autorized && !present ? 4 : 3} style={{ textAlign: "center" }}>
                                                            <button onClick={() => handleConfirmDelete(score)}>Deletar</button>
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
            </div>
        </div>
    );
}
