import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
    collection,
    doc,
    query,
    where,
    getDoc,
    updateDoc,
    setDoc,
    onSnapshot,
    deleteField,
} from "firebase/firestore";
import "./inscricao.css";

const InscricaoForm = ({ clube, admin, ismaster }) => {
    const [torneios, setTorneios] = useState([]);
    const [nomeClube, setNomeClube] = useState("");
    const [membros, setMembros] = useState({});
    const [novoMembro, setNovoMembro] = useState("");
    const [inscritosMap, setInscritosMap] = useState({});

    useEffect(() => {
        const q = query(collection(db, "eventos"), where("isCorrida", "==", true));

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

            setInscritosMap(map);
            setMembros(membrosTemp);
        });

        setNomeClube(clube);

        return () => unsubscribe();
    }, [clube]);

    const atualizarTotalInscritos = async (torneioId) => {
        const inscricaoRef = doc(db, "inscricoes", torneioId);
        const docSnap = await getDoc(inscricaoRef);
        if (!docSnap.exists()) return;

        const dados = docSnap.data();
        let total = 0;

        Object.values(dados).forEach(lista => {
            if (Array.isArray(lista)) {
                total += lista.length;
            }
        });

        const torneioRef = doc(db, "eventos", torneioId);
        await updateDoc(torneioRef, {
            inscritosTotal: total,
        });
    };

    const handleInscricaoDireta = async (torneioId) => {
        const confirmar = window.confirm(`Deseja inscrever o clube "${nomeClube}" nessa corrida?`);
        if (!confirmar) return;

        const torneioRef = doc(db, "eventos", torneioId);
        const torneioDoc = await getDoc(torneioRef);
        if (!torneioDoc.exists()) {
            alert("Torneio não encontrado.");
            return;
        }

        const { inscritos = [] } = torneioDoc.data();

        if (inscritos.includes(nomeClube)) {
            alert("Seu clube já está inscrito.");
            return;
        }

        await updateDoc(torneioRef, {
            inscritos: [...inscritos, nomeClube],
        });

        alert("Inscrição realizada com sucesso!");

        setInscritosMap((prev) => ({ ...prev, [torneioId]: true }));
        setMembros((prev) => ({ ...prev, [torneioId]: [] }));
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

        await atualizarTotalInscritos(torneioId);
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

        await atualizarTotalInscritos(torneioId);
    };

    const handleCancelarInscricao = async (torneioId) => {
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
        }, { merge: true }); // <- CORREÇÃO AQUI

        setInscritosMap((prev) => {
            const copy = { ...prev };
            delete copy[torneioId];
            return copy;
        });

        setMembros((prev) => {
            const copy = { ...prev };
            delete copy[torneioId];
            return copy;
        });

        await atualizarTotalInscritos(torneioId);

        alert("Inscrição cancelada com sucesso.");
    };

    function formatarDataCompleta(dataString) {
        const data = new Date(dataString + 'T00:00:00');
        const opcoes = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const formatada = data.toLocaleDateString('pt-BR', opcoes);

        return formatada.replace(/\b\p{L}/gu, letra => letra.toUpperCase());
    }

    return (
        <div className="event-list-section">
            <h2>Reservar Vagas de Corridas</h2>
            <div className="torneios-lista">
                {torneios.map((t) => {
                    const inscrito = inscritosMap[t.id];
                    return (
                        <div className="activity-description atividades" key={t.id}>
                            <div>
                                <div className="activity-title">
                                    {formatarDataCompleta(t.date)}
                                </div>
                                <div className="activity-title">
                                    {t.hora} - {t.nome}
                                </div>
                                {!inscrito && (
                                    <div>
                                        <p>Total de membros inscritos: {t.inscritosTotal || 0}</p>
                                        <p>{t.inscritos?.length || 0} Clube(s) Inscrito(s)</p>
                                    </div>
                                )}

                                {inscrito && (
                                    <div className="membros-area">
                                        <p>
                                            Olá! Administrador do clube <strong>{nomeClube}</strong>, o seu clube já está inscrito nessa corrida.
                                        </p>
                                        <p>Total de membros inscritos do clube: {membros[t.id]?.length || 0}</p>
                                        <p>{t.inscritos?.length || 0} Inscritos</p>

                                        <div>
                                            {(membros[t.id] || []).map((m, i) => (
                                                <div key={i} className="membro-item">
                                                    <span>{m}</span>
                                                    <button
                                                        className="remover-membro-btn"
                                                        onClick={() => handleRemoverMembro(t.id, m)}
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Nome do membro"
                                            value={novoMembro}
                                            onChange={(e) => setNovoMembro(e.target.value)}
                                        />
                                        <button onClick={() => handleAdicionarMembro(t.id)}>
                                            Adicionar membro
                                        </button>

                                        <button className="cancelar-btn" onClick={() => handleCancelarInscricao(t.id)}>
                                            Cancelar inscrição
                                        </button>
                                    </div>
                                )}
                                {!inscrito && admin && !ismaster && (
                                    <button onClick={() => handleInscricaoDireta(t.id)}>
                                        Inscrever clube
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InscricaoForm;
