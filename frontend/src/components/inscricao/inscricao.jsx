import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
    collection,
    doc,
    getDoc,
    updateDoc,
    setDoc,
    onSnapshot,
} from "firebase/firestore";
import "./inscricao.css";

const InscricaoForm = ({ clube, admin, ismaster }) => {
    const [torneios, setTorneios] = useState([]);
    const [torneioSelecionado, setTorneioSelecionado] = useState("");
    const [nomeClube, setNomeClube] = useState("");
    const [novoTorneio, setNovoTorneio] = useState({ nome: "", categoria: "", maxVagas: 16 });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "torneios"), (snapshot) => {
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

        const torneioRef = doc(db, "torneios", torneioSelecionado);
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

        const torneioRef = doc(db, "torneios", inscricaoAtual);
        const torneioDoc = await getDoc(torneioRef);

        if (!torneioDoc.exists()) return;

        const { inscritos = [] } = torneioDoc.data();

        const atualizados = inscritos.filter((nome) => nome !== nomeClube);

        await updateDoc(torneioRef, {
            inscritos: atualizados,
        });

        alert("Inscrição cancelada com sucesso.");
    };

    const handleCriarTorneio = async (e) => {
        e.preventDefault();

        if (!novoTorneio.nome.trim() || !novoTorneio.categoria.trim()) {
            alert("Preencha o nome e a categoria do novo torneio.");
            return;
        }

        await setDoc(doc(db, "torneios", novoTorneio.nome.trim()), {
            ...novoTorneio,
            inscritos: [],
        });

        setNovoTorneio({ nome: "", categoria: "", maxVagas: 16 });
        alert("Torneio criado com sucesso!");
    };

    return (
        <div className="inscricao-container">
            <h2>Inscrição no Campeonato</h2>

            <p style={{ marginTop: "1rem" }}>
                Olá! Administrador do clube <strong>{nomeClube}</strong>, se você deseja se inscrever para algum torneio leia as regras abaixo:
            </p>
            <p style={{ textAlign: "left" }}>
                - Cada clube deve se inscrever apenas em uma categoria, caso sobre vagas reabriremos para os clubes já inscritos.<br />
                - Poderão participar apenas uma dupla, sendo composta apenas por desbravadores de 10 a 15 anos. O clube deve realizar uma eliminatória para selecionar a dupla.<br />
                - As eliminatórias serão simples pois cada rodada é única, assim sendo não haverá repescagens.<br />
                - Apenas os usuários com acesso master de clube podem realizar a inscrição.<br />
                - As finais serão realizadas ao sábado a noite.<br />
            </p>
            <p>Essas regras são as mesmas para todos os torneios, em breve os clubes inscritos receberão mais informações</p>

            {clubeJaInscrito && (
                <div className="torneios-lista">
                    <label className="torneio-item">
                        <p className="aviso">
                            Olá! Administrador do clube <strong>{nomeClube}</strong>, o seu clube já está inscrito no torneio <strong>{clubeJaInscrito.nome}</strong>.
                        </p>
                    </label>
                </div>
            )}

            {!clubeJaInscrito && (
                <>
                    <div className="torneios-lista">
                        {torneios.map((t) => (
                            <label key={t.id} className="torneio-item">
                                {admin && !ismaster && <input
                                    type="radio"
                                    name="torneioSelecionado"
                                    value={t.id}
                                    checked={torneioSelecionado === t.id}
                                    onChange={(e) => setTorneioSelecionado(e.target.value)}
                                />}
                                <strong>{t.nome}</strong> ({t.categoria}) — {t.inscritos?.length || 0}/{t.maxVagas} inscritos
                            </label>
                        ))}
                    </div>

                    <form onSubmit={handleInscricao}>
                        {admin && !ismaster && <button type="submit" disabled={!torneioSelecionado}>
                            Confirmar inscrição do clube <strong>{nomeClube}</strong> no torneio {torneioSelecionado}
                        </button>} 
                    </form>
                </>
            )}

            {clubeJaInscrito && admin && !ismaster && (
                <button className="cancelar-btn" onClick={handleCancelarInscricao}>
                    Cancelar inscrição
                </button>
            )}

            {/* Área de criação de torneios */}
            {/*
            <h3>Criar novo torneio</h3>
            <form onSubmit={handleCriarTorneio}>
                <input
                    type="text"
                    placeholder="Nome do torneio"
                    value={novoTorneio.nome}
                    onChange={(e) => setNovoTorneio({ ...novoTorneio, nome: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Categoria"
                    value={novoTorneio.categoria}
                    onChange={(e) => setNovoTorneio({ ...novoTorneio, categoria: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Máximo de inscritos"
                    value={novoTorneio.maxVagas}
                    min={2}
                    max={64}
                    onChange={(e) =>
                        setNovoTorneio({ ...novoTorneio, maxVagas: parseInt(e.target.value) })
                    }
                />
                <button type="submit">Criar Torneio</button>
            </form>
            */}
        </div>
    );
};

export default InscricaoForm;
