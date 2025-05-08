import React, { useEffect, useState } from "react";
import { db } from "../components/firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import "../css/activityDashboard.css";

const COLORS = [
    "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#EC4899",
    "#F97316", "#14B8A6", "#3B82F6", "#8B5CF6", "#22C55E", "#D946EF",
];

export default function ScoreDashboard() {
    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "eventos"), (snapshot) => {
            const data = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                .filter((doc) => !doc.isCorrida && !doc.isTorneio);
            setEventos(data);
        });

        return () => unsubscribe();
    }, []);

    const atividadeMap = new Map();
    const clubeMaxReservaMap = new Map();

    eventos.forEach((evento) => {
        const { atividade, inscritosTotal = 0, maxVagas = 0, clubes = [] } = evento;

        if (!atividadeMap.has(atividade)) {
            atividadeMap.set(atividade, { atividade, inscritos: 0, vagas: 0 });
        }

        const entry = atividadeMap.get(atividade);
        entry.inscritos += inscritosTotal;
        entry.vagas += maxVagas;

        clubes.forEach(({ clube, valueVagas = 0 }) => {
            if (!clubeMaxReservaMap.has(clube)) {
                clubeMaxReservaMap.set(clube, valueVagas);
            } else {
                const currentMax = clubeMaxReservaMap.get(clube);
                clubeMaxReservaMap.set(clube, Math.max(currentMax, valueVagas));
            }
        });
    });

    const totalVagasPorEvento = Array.from(atividadeMap.values()).sort((a, b) => {
        const atividadeA = a?.atividade ?? '';
        const atividadeB = b?.atividade ?? '';
        return atividadeA.localeCompare(atividadeB);
    });

    const totalVagasGeral = totalVagasPorEvento.reduce(
        (sum, item) => sum + item.vagas,
        0
    );

    const distribuicaoClubesData = totalVagasPorEvento.map((item) => {
        const totalVagasReservadas = eventos
            .filter((e) => e.atividade === item.atividade)
            .flatMap((e) => e.clubes || [])
            .reduce((sum, c) => sum + (c.valueVagas || 0), 0);

        return {
            atividade: item.atividade,
            total: totalVagasReservadas,
        };
    });

    const clubesLista = Array.from(clubeMaxReservaMap.entries()).map(
        ([clube, total]) => ({ clube, total })
    );

    const totalGeralClubes = clubesLista.reduce((sum, c) => sum + c.total, 0);

    const clubesTabela = [
        { clube: "TOTAL", total: totalGeralClubes },
        ...clubesLista.sort((a, b) => a.clube.localeCompare(b.clube)),
    ];

    const renderDonutLabel = () => {
        return (
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="donut-center-label"
            >
                {totalVagasGeral} Vagas
            </text>
        );
    };

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Dashboard de Participações</h2>

            <div className="card">
                <h3 className="card-title">Distribuição de Vagas por Atividade</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={totalVagasPorEvento}
                            dataKey="vagas"
                            nameKey="atividade"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={70}
                            labelLine={false}
                            label={false}
                        >
                            {totalVagasPorEvento.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        {/* Texto no centro da rosquinha */}
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="donut-center-label"
                        >
                            {totalGeralClubes} DBV's
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="card">
                <h3 className="card-title">Vagas vs Inscritos por Atividade</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={totalVagasPorEvento}>
                        <XAxis dataKey="atividade" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="inscritos" fill="#4F46E5" name="Inscritos" />
                        <Bar dataKey="vagas" fill="#10B981" name="Total de Vagas" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="card">
                <h3 className="card-title">Distribuição Total de Vagas por Atividade</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={distribuicaoClubesData}>
                        <XAxis dataKey="atividade" />
                        <YAxis />
                        <Tooltip content={({ payload }) => null} />
                        <Bar dataKey="total" fill="#F59E0B" name="Vagas Reservadas" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="card">
                <h3 className="card-title">Totalizadores por Atividade</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Atividade</th>
                            <th>Inscritos</th>
                            <th>Vagas</th>
                            <th>Vagas Restantes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {totalVagasPorEvento.map((item, i) => (
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{item.atividade}</td>
                                <td>{item.inscritos}</td>
                                <td>{item.vagas}</td>
                                <td>{item.vagas - item.inscritos}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h3 className="card-title">
                    Clubes com Maior Reserva Individual (Total)
                </h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Clube</th>
                            <th>Total (Maior Reserva)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clubesTabela.map((item, i) => (
                            <tr key={i}>
                                <td>{i}</td>
                                <td>{item.clube}</td>
                                <td>{item.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
