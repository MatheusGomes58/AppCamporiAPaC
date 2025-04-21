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
        const q = query(
            collection(db, "eventos"),
            where("isTorneio", "==", true)
        );

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

    const clubeJaInscrito = torneios.find((t) => t.inscritos?.includes(nomeClube));
    const inscricaoAtual = clubeJaInscrito ? clubeJaInscrito.id : null;

    function formatarDataCompleta(dataString) {
        const data = new Date(dataString + 'T00:00:00');
        const opcoes = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const formatada = data.toLocaleDateString('pt-BR', opcoes);

        // Capitaliza a primeira letra de cada palavra relevante
        return formatada.replace(/\b\p{L}/gu, letra => letra.toUpperCase());
    }

    const handleInscricao = async (e) => {
        e.preventDefault();

        if (!torneioSelecionado || !nomeClube.trim()) {
            alert("Selecione um torneio e informe o nome do clube.");
            return;
        }

        if (clubeJaInscrito) {
            alert("Seu clube já está inscrito em um torneio. Cancele a inscrição atual antes de prosseguir.");
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

    const handleCancelarInscricao = async () => {
        if (!inscricaoAtual) return;

        const confirmar = window.confirm("Deseja realmente cancelar sua inscrição?");
        if (!confirmar) return;

        const torneioRef = doc(db, "eventos", inscricaoAtual);
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
                inscritos: []
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
            {clubeJaInscrito && (
                <div className="activity-description atividades">
                    <label key={clubeJaInscrito.id}>
                        <div className="activity-title">
                            {formatarDataCompleta(clubeJaInscrito.date)}
                        </div>
                        <div className="activity-title">
                            {clubeJaInscrito.hora} - {clubeJaInscrito.nome}
                        </div>
                        <p className="aviso">
                            Olá! Administrador do clube <strong>{nomeClube}</strong>, o seu clube já está inscrito no torneio <strong>{clubeJaInscrito.nome}</strong>.<br />
                            {clubeJaInscrito.inscritos?.length || 0}/{clubeJaInscrito.maxVagas} inscritos
                        </p>
                    </label>
                </div>
            )}

            {!clubeJaInscrito && (
                <div className="teste">
                    <div className="torneios-lista">
                        {torneios.map((t) => (
                            <div className="activity-description atividades">
                                <label key={t.id}>
                                    {admin && !ismaster && (
                                        <input
                                            type="radio"
                                            name="torneioSelecionado"
                                            value={t.id}
                                            checked={torneioSelecionado === t.id}
                                            onChange={(e) => setTorneioSelecionado(e.target.value)}
                                        />
                                    )}
                                    <div className="activity-title">
                                        {formatarDataCompleta(t.date)}
                                    </div>
                                    <div className="activity-title">
                                        {t.hora} - {t.nome}
                                    </div>
                                    <p>
                                        {t.inscritos?.length || 0}/{t.maxVagas} inscritos
                                    </p>
                                </label>
                            </div>
                        ))}
                    </div>
                    {admin && !ismaster && (
                        <button className="cancelar-btn" type="submit" disabled={!torneioSelecionado} onClick={handleInscricao}>
                            Confirmar inscrição do clube <strong>{nomeClube}</strong> no torneio {torneioSelecionado}
                        </button>
                    )}
                </div>
            )}

            {clubeJaInscrito && admin && !ismaster && (
                <button className="cancelar-btn" onClick={handleCancelarInscricao}>
                    Cancelar inscrição
                </button>
            )}

            {/* Área de criação de múltiplos torneios */}

            {/*
            <h3>Criar novos torneios</h3>
            {novosTorneios.map((torneio, index) => (
                <div key={index} className="novo-torneio-bloco">
                    <input
                        type="text"
                        placeholder="Categoria do torneio"
                        value={torneio.atividade}
                        onChange={(e) => {
                            const atualizados = [...novosTorneios];
                            atualizados[index].atividade = e.target.value;
                            setNovosTorneios(atualizados);
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Nome do torneio"
                        value={torneio.nome}
                        onChange={(e) => {
                            const atualizados = [...novosTorneios];
                            atualizados[index].nome = e.target.value;
                            setNovosTorneios(atualizados);
                        }}
                    />
                    <input
                        type="text"
                        placeholder="data do torneio"
                        value={torneio.date}
                        onChange={(e) => {
                            const atualizados = [...novosTorneios];
                            atualizados[index].date = e.target.value;
                            setNovosTorneios(atualizados);
                        }}
                    />
                    <input
                        type="text"
                        placeholder="hora do torneio"
                        value={torneio.hora}
                        onChange={(e) => {
                            const atualizados = [...novosTorneios];
                            atualizados[index].hora = e.target.value;
                            setNovosTorneios(atualizados);
                        }}
                    />
                    <input
                        type="number"
                        placeholder="Máximo de inscritos"
                        value={torneio.maxVagas}
                        min={2}
                        max={64}
                        onChange={(e) => {
                            const atualizados = [...novosTorneios];
                            atualizados[index].maxVagas = parseInt(e.target.value);
                            setNovosTorneios(atualizados);
                        }}
                    />
                    <input
                        type="number"
                        placeholder="Máximo de vagas por clube"
                        value={torneio.maxClubVagas}
                        min={2}
                        max={64}
                        onChange={(e) => {
                            const atualizados = [...novosTorneios];
                            atualizados[index].maxClubVagas = parseInt(e.target.value);
                            setNovosTorneios(atualizados);
                        }}
                    />
                </div>
            ))}

            <div className="botoes-torneio">
                <button
                    type="button"
                    onClick={() => {
                        const ultimo = novosTorneios[novosTorneios.length - 1];
                        const novo = { ...ultimo }; // Faz uma cópia do último
                        setNovosTorneios([...novosTorneios, novo]);
                    }}
                >
                    Adicionar mais
                </button>
                <button type="button" onClick={handleCriarTorneios}>
                    Criar Todos
                </button>
            </div>
            */}
        </div>
    );
};

export default InscricaoForm;
