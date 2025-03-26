import { useState, useEffect } from "react";
import { db } from "../components/firebase/firebase";
import { collection, addDoc, updateDoc, doc, onSnapshot } from "firebase/firestore";
import "../css/ScoreDashboard.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ScoreDashboard() {
    const [scores, setScores] = useState([]);
    const [club, setClub] = useState("");
    const [points, setPoints] = useState("");
    const [activity, setActivity] = useState("");  // Nome da atividade
    const [filterClub, setFilterClub] = useState("");

    useEffect(() => {
        const fetchScores = async () => {
            const unsubscribe = onSnapshot(collection(db, "scores"), (querySnapshot) => {
                const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setScores(data);
            });

            return unsubscribe; // Retorna a função de unsubscribe para limpar a assinatura quando o componente for desmontado
        };
        fetchScores();
    }, []);
    
    const addScore = async () => {
        if (club && points && activity) {
            // Verificar se o clube já existe
            const existingClub = scores.find((s) => s.club === club); // Utilizamos 'find' aqui para pegar o clube, se existir.
    
            if (existingClub) {
                // Verificar se a atividade já existe dentro do clube
                const existingActivity = existingClub.activities.find((act) => act.name === activity);
    
                if (existingActivity) {
                    // Atualizar os pontos da atividade
                    const updatedPoints = existingActivity.points + Number(points);
                    await updateDoc(doc(db, "scores", existingClub.id), {
                        "activities.$[elem].points": updatedPoints
                    }, { arrayFilters: [{ "elem.name": activity }] });
    
                    // Atualizar o estado local
                    setScores(scores.map((s) => 
                        s.club === club 
                            ? { ...s, activities: s.activities.map(act => act.name === activity ? { ...act, points: updatedPoints } : act) }
                            : s
                    ));
                } else {
                    // Adicionar nova atividade ao clube
                    await updateDoc(doc(db, "scores", existingClub.id), {
                        activities: [...existingClub.activities, { name: activity, points: Number(points) }]
                    });
    
                    // Atualizar o estado local
                    setScores(scores.map((s) => 
                        s.club === club 
                            ? { ...s, activities: [...s.activities, { name: activity, points: Number(points) }] } 
                            : s
                    ));
                }
            } else {
                // Se o clube não existe, criar um novo clube com a atividade
                const docRef = await addDoc(collection(db, "scores"), {
                    club,
                    activities: [{ name: activity, points: Number(points) }]
                });
    
                // Atualizar o estado local com o novo clube
                setScores([...scores, { id: docRef.id, club, activities: [{ name: activity, points: Number(points) }] }]);
            }
    
            // Resetar os campos de entrada
            setClub("");
            setPoints("");
            setActivity("");
        }
    };
    

    const filteredScores = filterClub
        ? scores.filter((s) => s.club.toLowerCase().includes(filterClub.toLowerCase()))
        : scores;

    // Agregar a pontuação por atividade para cada clube
    const dataForCharts = filteredScores.flatMap((s) =>
        (s.activities || []).map((act) => ({
            club: s.club,
            activity: act.name,
            points: act.points
        }))
    );

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Dashboard de Pontuação</h1>
            <div className="card score-input-card">
                <h2 className="card-title">Registrar Pontuação</h2>
                <div className="input-group">
                    <input
                        className="input-field"
                        placeholder="Nome do Clube"
                        value={club}
                        onChange={(e) => setClub(e.target.value)}
                    />
                    <input
                        className="input-field"
                        placeholder="Pontos"
                        type="number"
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                    />
                    <input
                        className="input-field"
                        placeholder="Nome da Atividade"
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                    />
                    <button className="submit-button" onClick={addScore}>
                        Adicionar
                    </button>
                </div>
            </div>

            <div className="card filter-card">
                <h2 className="card-title">Filtrar por Clube</h2>
                <input
                    className="input-field"
                    placeholder="Digite o nome do clube"
                    value={filterClub}
                    onChange={(e) => setFilterClub(e.target.value)}
                />
            </div>

            <div className="card score-table-card">
                <h2 className="card-title">Pontuação por Clube</h2>
                <table className="score-table">
                    <thead>
                        <tr>
                            <th>Clube</th>
                            <th>Atividade</th>
                            <th>Pontos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredScores.map((s) =>
                            s.activities?.map((act) => (
                                <tr key={`${s.id}-${act.name}`}>
                                    <td>{s.club}</td>
                                    <td>{act.name}</td>
                                    <td>{act.points}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Gráfico de Pontuação Total por Atividade */}
            <div className="card chart-card">
                <h2 className="card-title">Gráfico de Pontuação por Atividade</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataForCharts}>
                        <XAxis dataKey="activity" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="points" fill="#007bff" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
