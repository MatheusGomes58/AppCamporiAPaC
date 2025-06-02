import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { useNavigate } from 'react-router-dom';
import {
    collection,
    doc,
    query,
    where,
    getDoc,
    updateDoc,
    setDoc,
    deleteField,
    onSnapshot,
} from "firebase/firestore";
import "./inscricao.css";

const InscricaoForm = ({ clube, admin, ismaster }) => {
    const navigate = useNavigate();
    const [torneios, setTorneios] = useState([]);
    const [nomeClube, setNomeClube] = useState("");

    useEffect(() => {
        const q = query(collection(db, "eventos"), where("isApresentação", "==", true));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    clubes: data.clubes || [] // garante que seja array
                };
            });

            const eventosOrdenados = lista.sort((a, b) => {
                const dataA = new Date(`${a.date}T${a.hora.replace('h', ':')}:00`);
                const dataB = new Date(`${b.date}T${b.hora.replace('h', ':')}:00`);
                return dataA - dataB;
            });

            setTorneios(eventosOrdenados);
        });

        setNomeClube(clube);

        return () => unsubscribe();
    }, [clube]);

    const torneiosInscritos = torneios.filter((t) => t.inscritos?.includes(nomeClube));
    const limiteDeInscricoes = 1;
    const atingiuLimite = torneiosInscritos.length >= limiteDeInscricoes;

    function formatarDataCompleta(dataString) {
        const data = new Date(dataString + 'T00:00:00');
        const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return data.toLocaleDateString('pt-BR', opcoes).replace(/\b\p{L}/gu, letra => letra.toUpperCase());
    }

    const handleInscricaoDireta = async (torneioId) => {
        if (!nomeClube.trim()) {
            alert("Informe o nome do clube.");
            return;
        }

        if (atingiuLimite) {
            alert("Seu clube já está inscrito no número máximo de Apresentações permitidas.");
            return;
        }

        const confirmar = window.confirm(`Deseja realmente inscrever o clube "${nomeClube}" no torneio selecionado?`);
        if (!confirmar) return;

        const torneioRef = doc(db, "eventos", torneioId);
        const torneioDoc = await getDoc(torneioRef);

        if (!torneioDoc.exists()) {
            alert("Torneio não encontrado.");
            return;
        }

        const { inscritos = [], maxVagas } = torneioDoc.data();

        if (inscritos.includes(nomeClube.trim())) {
            alert("O seu clube já está inscrito nesse torneio.");
            return;
        }

        if (inscritos.length >= maxVagas) {
            alert("Número máximo de inscritos atingido.");
            return;
        }

        await updateDoc(torneioRef, {
            inscritos: [...inscritos, nomeClube.trim()],
        });

        alert("Clube inscrito com sucesso!");
    };

    const handleCancelarInscricao = async (torneioId) => {
        const confirmar = window.confirm("Deseja realmente cancelar sua inscrição?");
        if (!confirmar) return;

        const torneioRef = doc(db, "eventos", torneioId);
        const torneioDoc = await getDoc(torneioRef);
        if (!torneioDoc.exists()) return;

        const { inscritos = [] } = torneioDoc.data();
        const atualizados = inscritos.filter((nome) => nome !== nomeClube);

        await updateDoc(torneioRef, {
            inscritos: atualizados,
        });

        const inscricaoRef = doc(db, "inscricoes", torneioId);
        await setDoc(inscricaoRef, {
            [nomeClube]: deleteField(),
        }, { merge: true });

        alert("Inscrição cancelada com sucesso.");
    };

    return (
        <div className="event-list-section">
            <h2>Reservar Apresentações Especiais</h2>

            {torneiosInscritos.length > 0 && (
                torneiosInscritos.map((t) => (
                    <div key={t.id} className={`activity-description ${t.classe}`}>
                        <div className="activity-title">{formatarDataCompleta(t.date)}</div>
                        <div className="activity-title">{t.hora} - {t.nome}</div>
                        <div className="membros-area">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <th colSpan={2}>Detalhes</th>
                                    </tr>
                                    <tr>
                                        <td>Total de Clubes:</td>
                                        <td>{t.inscritos?.length || 0} Inscritos</td>
                                    </tr>
                                    {(ismaster || t.inscritos?.some(c => c.clube === clube)) && (
                                        <>
                                            <tr>
                                                <th colSpan={2}>Clubes Inscritos</th>
                                            </tr>
                                            {Array.isArray(t.inscritos) && t.inscritos.map((c, idx) => (
                                                (ismaster || c.clube === clube) && (
                                                    <tr key={idx}>
                                                        <td colSpan={2}>{c}</td>
                                                    </tr>
                                                )
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                            <button className="delete" onClick={() => handleCancelarInscricao(t.id)}>
                                Cancelar inscrição
                            </button>
                        </div>
                    </div>
                ))
            )}

            {torneiosInscritos.length < limiteDeInscricoes && (
                <div className="teste">
                    <div className="torneios-lista">
                        {torneios.map((t) => (
                            !t.inscritos?.includes(nomeClube) && (
                                <div key={t.id} className={`activity-description ${t.classe}`}>
                                    <div className="activity-title">{formatarDataCompleta(t.date)}</div>
                                    <div className="activity-title">{t.hora} - {t.nome}</div>
                                    <div>
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <th colSpan={2}>Detalhes</th>
                                                </tr>
                                                <tr>
                                                    <td>Total de Vagas:</td>
                                                    <td>{t.maxVagas || 0} disponíveis</td>
                                                </tr>
                                                <tr>
                                                    <td>Total de Clubes:</td>
                                                    <td>{t.inscritos?.length || 0} Inscritos</td>
                                                </tr>
                                                {(ismaster || t.inscritos?.some(c => c.clube === clube)) && (
                                                    <>
                                                        <tr>
                                                            <th colSpan={2}>Clubes Inscritos</th>
                                                        </tr>
                                                        {Array.isArray(t.inscritos) && t.inscritos.map((c, idx) => (
                                                            (ismaster || c.clube === clube) && (
                                                                <tr key={idx}>
                                                                    <td colSpan={2}>{c}</td>
                                                                </tr>
                                                            )
                                                        ))}
                                                    </>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {admin && !ismaster && (t.inscritos?.length < t.maxVagas) && (
                                        <button
                                            type="button"
                                            disabled={t.inscritos?.length >= t.maxVagas}
                                            onClick={() => handleInscricaoDireta(t.id)}
                                        >
                                            Confirmar inscrição do clube <strong>{nomeClube}</strong>
                                        </button>
                                    )}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InscricaoForm;
