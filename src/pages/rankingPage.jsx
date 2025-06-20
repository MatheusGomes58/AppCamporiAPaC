// pages/RankingPage.jsx
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../components/firebase/firebase";
import { useNavigate } from "react-router-dom";
import StarProgressBar from "../components/scores/starProgress";

export default function RankingPage() {
    const [ranking, setRanking] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "scores"), (snapshot) => {
            const pontuacoes = {};

            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                if (!data.club || typeof data.pontuacao !== "number") return;

                if (!pontuacoes[data.club]) {
                    pontuacoes[data.club] = 0;
                }

                pontuacoes[data.club] += data.pontuacao;
            });

            const rankingArray = Object.entries(pontuacoes)
                .map(([club, total]) => ({ club, total }))
                .sort((a, b) => b.total - a.total);

            setRanking(rankingArray);
        });

        return () => unsubscribe();
    }, []);

    const handleRowClick = (clubName) => {
        const encodedClub = encodeURIComponent(clubName);
        navigate(`/scoresclubs?clube=${encodedClub}`);
    };

    return (
        <div>
            <h1 className="dashboard-title">Ranking Geral de Clubes</h1>
            <div className="card">
                <div className="tableScrool">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Posição</th>
                                <th>Clube</th>
                                <th>Pontuação</th>
                                <th>Progresso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map(({ club, total }, index) => (
                                <tr
                                    key={club}
                                    onClick={() => handleRowClick(club)}
                                    style={{ cursor: "pointer", backgroundColor: "#f9f9f9" }}
                                >
                                    <td>{index + 1}º</td>
                                    <td>{club}</td>
                                    <td>{total}</td>
                                    <td>
                                        <StarProgressBar totalScore={total} ranking={true} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
