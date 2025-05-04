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
} from "firebase/firestore";
import "./inscricao.css";

const InscricaoForm = ({ clube, admin, ismaster, activeTab }) => {
    const [torneios, setTorneios] = useState([]);
    const [torneioSelecionado, setTorneioSelecionado] = useState("");
    const [nomeClube, setNomeClube] = useState("");
    const [novosTorneios, setNovosTorneios] = useState([{ nome: "", date: "", hora: "", atividade: "", maxVagas: 60, maxClubVagas: 16 }]);

    useEffect(() => {
        const q = query(collection(db, "eventos"), where("isTorneio", "==", true));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTorneios(lista);
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

    const handleInscricao = async (e) => {
        e.preventDefault();

        if (!torneioSelecionado || !nomeClube.trim()) {
            alert("Selecione um torneio e informe o nome do clube.");
            return;
        }

        if (atingiuLimite) {
            alert("Seu clube já está inscrito no número máximo de torneios permitidos (2).");
            return;
        }

        const confirmar = window.confirm(`Deseja realmente inscrever o clube "${nomeClube}" no torneio selecionado?`);
        if (!confirmar) return;

        const torneioRef = doc(db, "eventos", torneioSelecionado);
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

        alert("Inscrição cancelada com sucesso.");
    };

    const handleCriarTorneios = async () => {
        const criados = [];

        for (const torneio of novosTorneios) {
            if (!torneio.nome.trim()) continue;

            const ref = doc(db, "eventos", torneio.nome.trim());

            await setDoc(ref, {
                ...torneio,
                classe: "atividades",
                title: torneio.nome.trim(),
                timestamp: "",
                inscritos: [],
                isTorneio: true
            });

            criados.push(torneio.nome.trim());
        }

        if (criados.length > 0) {
            alert(`Torneio(s) criado(s): ${criados.join(", ")}`);
        } else {
            alert("Nenhum torneio válido para criar.");
        }

        setNovosTorneios([{ nome: "", maxVagas: 16 }]);
    };

    return (
        <div className="event-list-section">
            <h2>Reservar Vagas de Torneios</h2>

            {torneiosInscritos.length > 0 && (
                torneiosInscritos.map((t) => (
                    <div key={t.id} className={`activity-description ${t.classe}`}>
                        <div className="activity-title">{formatarDataCompleta(t.date)}</div>
                        <div className="activity-title">{t.hora} - {t.nome}</div>
                        <p className="aviso">
                            Olá! Administrador do clube <strong>{nomeClube}</strong>, seu clube está inscrito no torneio <strong>{t.nome}</strong>.<br />
                            {t.inscritos?.length || 0}/{t.maxVagas} inscritos
                        </p>
                        {admin && !ismaster && (
                            <button className="cancelar-btn" onClick={() => handleCancelarInscricaoIndividual(t.id)}>
                                Cancelar inscrição
                            </button>
                        )}
                    </div>
                ))
            )}

            {torneiosInscritos.length < limiteDeInscricoes && (
                <div className="teste">
                    <div className="torneios-lista">
                        {torneios.map((t) => (
                            !t.inscritos?.includes(nomeClube) && (
                                <div key={t.id} className={`activity-description ${t.classe}`}>
                                    <label>
                                        {admin && !ismaster && (
                                            <input
                                                type="radio"
                                                name="torneioSelecionado"
                                                value={t.id}
                                                checked={torneioSelecionado === t.id}
                                                onChange={(e) => setTorneioSelecionado(e.target.value)}
                                            />
                                        )}
                                        <div className="activity-title">{formatarDataCompleta(t.date)}</div>
                                        <div className="activity-title">{t.hora} - {t.nome}</div>
                                        <p>{t.inscritos?.length || 0}/{t.maxVagas} inscritos</p>
                                    </label>
                                </div>
                            )
                        ))}
                    </div>
                    {admin && !ismaster && (
                        <button className="cancelar-btn" type="submit" disabled={!torneioSelecionado} onClick={handleInscricao}>
                            Confirmar inscrição do clube <strong>{nomeClube}</strong>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default InscricaoForm;
