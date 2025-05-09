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
    const [membros, setMembros] = useState({});
    const [novoMembro, setNovoMembro] = useState("");

    useEffect(() => {
        const q = query(collection(db, "eventos"), where("isTorneio", "==", true));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const lista = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTorneios(lista);

            const map = {};
            const membrosTemp = {};

            for (const t of lista) {
                if (t.inscritos?.includes(clube)) {
                    map[t.id] = true;

                    const inscricaoRef = doc(db, "inscricoes", t.id);
                    const docSnap = await getDoc(inscricaoRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        membrosTemp[t.id] = data[clube] || [];
                    }
                }
            }

            setMembros(membrosTemp);
        });

        setNomeClube(clube);

        return () => unsubscribe();
    }, [clube]);

    const torneiosInscritos = torneios.filter((t) => t.inscritos?.includes(nomeClube));
    const limiteDeInscricoes = 2;
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
            alert("Seu clube já está inscrito no número máximo de torneios permitidos (2).");
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

    const handleCancelarInscricaoIndividual = async (torneioId) => {
        const confirmar = window.confirm("Deseja realmente cancelar sua inscrição e remover os membros?");
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

        setMembros((prev) => {
            const copy = { ...prev };
            delete copy[torneioId];
            return copy;
        });

        alert("Inscrição cancelada com sucesso.");
    };

    const handleAdicionarMembro = async (torneioId) => {
        if (!novoMembro.trim()) return;

        const inscricaoRef = doc(db, "inscricoes", torneioId);
        const docSnap = await getDoc(inscricaoRef);
        const dadosExistentes = docSnap.exists() ? docSnap.data() : {};

        const membrosAtuais = dadosExistentes[nomeClube] || [];

        await setDoc(
            inscricaoRef,
            {
                ...dadosExistentes,
                [nomeClube]: [...membrosAtuais, novoMembro.trim()],
            },
            { merge: true }
        );

        setMembros((prev) => ({
            ...prev,
            [torneioId]: [...(prev[torneioId] || []), novoMembro.trim()],
        }));
        setNovoMembro("");
    };

    const handleRemoverMembro = async (torneioId, membroRemover) => {
        const confirmar = window.confirm(`Deseja remover o membro "${membroRemover}" da corrida?`);
        if (!confirmar) return;

        const inscricaoRef = doc(db, "inscricoes", torneioId);
        const docSnap = await getDoc(inscricaoRef);
        if (!docSnap.exists()) return;

        const dados = docSnap.data();
        const membrosAtuais = dados[nomeClube] || [];

        const atualizados = membrosAtuais.filter((m) => m !== membroRemover);

        await updateDoc(inscricaoRef, {
            [nomeClube]: atualizados,
        });

        setMembros((prev) => ({
            ...prev,
            [torneioId]: atualizados,
        }));
    };

    return (
        <div className="event-list-section">
            <h2>Reservar Vagas de Torneios</h2>

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
                                        <td>Total de membros:</td>
                                        <td>{t.inscritosTotal || 0} inscritos</td>
                                    </tr>
                                    <tr>
                                        <td>Total de Clubes:</td>
                                        <td>{t.inscritos?.length || 0} Inscritos</td>
                                    </tr>
                                    <tr>
                                        <td>Total de membros do clube:</td>
                                        <td>{membros[t.id]?.length || 0} Inscritos</td>
                                    </tr>
                                    <tr>
                                        <th colSpan={2}>Membro do Clube</th>
                                    </tr>
                                    {membros[t.id]?.length > 0 ? (membros[t.id]).map((m, i) => (
                                        <tr key={i}>
                                            <td>
                                                <span>{m}</span>
                                            </td>
                                            {admin && (
                                                <td>
                                                    <button
                                                        className="remover-membro-btn"
                                                        onClick={() => handleRemoverMembro(t.id, m)}
                                                    >
                                                        Remover
                                                    </button>
                                                </td>
                                            )}

                                        </tr>
                                    )) :
                                        <tr>
                                            <td colSpan={2}>Nenhum membro foi inscrito ainda!</td>
                                        </tr>
                                    }
                                    <tr>
                                        <th colSpan={2}>Ações</th>
                                    </tr>
                                    {t.maxClubVagas > (membros[t.id]?.length || 0) ? <tr>
                                        <td>
                                            <input
                                                type="text"
                                                placeholder="Nome"
                                                className="inputLogin"
                                                value={novoMembro}
                                                onChange={(e) => setNovoMembro(e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button className="confirm-btn" onClick={() => handleAdicionarMembro(t.id)}>
                                                Adicionar membro
                                            </button>
                                        </td>
                                    </tr> : ""}
                                </tbody>
                            </table>
                            <button className="delete" onClick={() => handleCancelarInscricaoIndividual(t.id)}>
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
                                            </tbody>
                                        </table>
                                    </div>
                                    {admin && !ismaster && (
                                        <button
                                            type="button"
                                            disabled={t.inscritos?.length >= t.maxVagas}
                                            onClick={() => handleInscricaoDireta(t.id)}
                                        >
                                            Confirmar inscrição do clube <strong>{nomeClube}</strong>
                                        </button>
                                    )}
                                    {ismaster && (
                                        <button onClick={() => navigate(`/chaveamento/${t.nome}`)}>
                                            Consultar Lista de Inscritos
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
