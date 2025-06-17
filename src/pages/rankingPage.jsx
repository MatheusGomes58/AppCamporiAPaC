// pages/RankingPage.jsx
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../components/firebase/firebase";
import StarProgressBar from "../components/scores/starProgress";

export default function RankingPage() {
    const [ranking, setRanking] = useState([]);

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

    return (
        <div>
            <h1 className="dashboard-title">Ranking Geral de Clubes</h1>
            <div className="card">
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
                            <tr key={club}>
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
    );
}
