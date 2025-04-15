import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { db } from "../components/firebase/firebase";
import { collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from "firebase/firestore";
import "../css/ScoreDashboard.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Label } from "recharts";
import clubs from '../data/clubes.json';

export default function ScoreDashboard({ isMaster, isclub, register, admin, uid }) {
    const [scores, setScores] = useState([]);
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
    const navigate = useNavigate();
    const rowsPerPage = 10;

    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d0ed57", "#a4de6c"];

    useEffect(() => {
        if (isclub || isMaster) {
            const unsubscribe = onSnapshot(collection(db, "scores"), (querySnapshot) => {
                const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setScores(data);
            });

            return unsubscribe;
        } else {
            alert('Faça o login para acessar essa funcionalidade');
            navigate('/menu');
        }
    }, []);

    const addScore = async () => {
        if (club && points && activity) {
            const existingClub = scores.find((s) => s.club === club);

            if (existingClub) {
                const existingActivity = existingClub.activities.find((act) => act.name === activity);

                if (existingActivity) {
                    const updatedPoints = existingActivity.points + Number(points);
                    await updateDoc(doc(db, "scores", existingClub.id), {
                        activities: existingClub.activities.map(act =>
                            act.name === activity ? { ...act, points: updatedPoints } : act
                        )
                    });
                } else {
                    await updateDoc(doc(db, "scores", existingClub.id), {
                        activities: [...existingClub.activities, { name: activity, points: Number(points), uid }]
                    });
                }
            } else {
                await addDoc(collection(db, "scores"), {
                    club,
                    activities: [{ name: activity, points: Number(points), uid }]
                });
            }

            setClub("");
            setPoints("");
            setActivity("");
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
        (sum, s) => sum + s.activities.reduce((actSum, act) => actSum + act.points, 0),
        0
    );

    const dataForBarChart = myRecordsFilteredScores.flatMap(s =>
        s.activities.map((act, index) => ({
            club: s.club,
            activity: act.name,
            points: act.points,
            color: COLORS[index % COLORS.length]
        }))
    );

    const activityScores = myRecordsFilteredScores.flatMap(s =>
        s.activities.map(act => ({
            name: act.name,
            points: act.points
        }))
    );

    const activityData = activityScores.reduce((acc, act) => {
        const existingActivity = acc.find(a => a.name === act.name);
        if (existingActivity) {
            existingActivity.points += act.points;
        } else {
            acc.push(act);
        }
        return acc;
    }, []);

    const totalRows = myRecordsFilteredScores.reduce((sum, s) => sum + s.activities.length, 0);
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const paginatedData = myRecordsFilteredScores.flatMap(s => s.activities.map(act => ({
        club: s.club,
        activity: act.name,
        points: act.points,
        clubId: s.id,
        uid: act.uid
    }))).slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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

                    <input
                        className="campoEntrada"
                        placeholder="Pontos"
                        type="number"
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                    />
                    <input
                        className="campoEntrada"
                        placeholder="Nome da Atividade"
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
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
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart
                        isAnimationActive={false}
                        cursor="default"
                        style={{ pointerEvents: 'none' }} // Adicionando pointer-events: none
                    >
                        <Pie
                            data={activityData}
                            dataKey="points"
                            nameKey="name"
                            outerRadius={100}
                            innerRadius={70}
                            labelLine={false}
                            label
                            activeShape={null}
                        >
                            {activityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <Label
                                value={`${totalScore} Pt`}
                                position="center"
                                fontSize={24}
                                fontWeight="bold"
                                fill="#333"
                            />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>}

            {/* Gráfico de Pontuação */}
            {!isInclude && !register && <div className="cartaoGrafico">
                <h2 className="tituloCartao">Gráfico de Pontuação</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataForBarChart}>
                        <XAxis dataKey="activity" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="points" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>}

            {!isInclude && <div className="cartaoTabelaPontuacao">
                <h2 className="tituloCartao">Pontuação por Clube</h2>
                {register && <button onClick={() => setInclude(true)}>Incluir Pontos</button>}
                <table className="tabelaPontuacao">
                    <thead>
                        <tr>
                            <th>Clube</th>
                            <th>Atividade</th>
                            <th>Pontos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((score, index) => (
                            <React.Fragment key={index}>
                                <tr onClick={() => handlePointClick(index, score)}>
                                    <td>{score.club}</td>
                                    <td>{score.activity}</td>
                                    <td>{score.points}</td>
                                </tr>
                                {selectedPointIndex === index && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center' }}>
                                            <button onClick={() => handleEditScore(selectedPoint)}>Editar</button>
                                            <button onClick={() => handleConfirmDelete(selectedPoint)}>Deletar</button>
                                            <button onClick={() => setSelectedPointIndex(null)}>Cancelar</button>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {/* Controles de Paginação */}
                <div className="paginacao">
                    <button
                        disabled={currentPage == 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button
                        disabled={currentPage == totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Próxima
                    </button>
                </div>
            </div>}
        </div>
    );
}