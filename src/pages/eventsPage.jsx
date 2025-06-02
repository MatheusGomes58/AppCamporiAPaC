import { useEffect, useState } from "react";
import {
    collection,
    addDoc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
    doc,
} from "firebase/firestore";
import { db } from "../components/firebase/firebase";
import "../css/eventsPage.css";

export default function EventosManager() {
    const [eventos, setEventos] = useState([]);
    const [formJson, setFormJson] = useState("{}");
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const eventosRef = collection(db, "eventos");

    useEffect(() => {
        const q = query(eventosRef, orderBy("nome"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setEventos(data);
        });

        return () => unsubscribe(); // limpa o listener quando o componente desmontar
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();

        let parsed;
        try {
            parsed = JSON.parse(formJson);
        } catch (error) {
            alert("JSON inválido! Verifique a formatação.");
            return;
        }

        try {
            if (editId) {
                const docRef = doc(db, "eventos", editId);
                await updateDoc(docRef, parsed);
            } else {
                await addDoc(eventosRef, parsed);
            }

            setFormJson("{}");
            setEditId(null);
            setShowModal(false);
        } catch (error) {
            alert("Erro ao salvar no Firestore.");
        }
    };

    const handleEdit = (evento) => {
        const { id, ...rest } = evento;
        setFormJson(JSON.stringify(rest, null, 2));
        setEditId(id);
        setShowModal(true);
    };

    const handleCopy = (evento) => {
        const { id, nome, ...rest } = evento;
        const baseName = nome || "Evento";
        const regex = new RegExp(`^${baseName} - (\\d+)$`);

        const copias = eventos
            .filter(ev => ev.nome && (ev.nome === baseName || regex.test(ev.nome)))
            .map(ev => {
                const match = ev.nome.match(regex);
                return match ? parseInt(match[1], 10) : 0;
            });

        const nextSuffix = copias.length ? Math.max(...copias) + 1 : 1;
        const newName = `${baseName} - ${nextSuffix}`;

        const newData = {
            ...rest,
            nome: newName,
        };

        setFormJson(JSON.stringify(newData, null, 2));
        setEditId(null);
        setShowModal(true);
    };


    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = eventos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(eventos.length / itemsPerPage);

    return (
        <div className="schedule-page">
            <h2 className="titulo-grid">Eventos Criados</h2>
            <div className="botao-novo">
                <button onClick={() => {
                    setFormJson('');
                    setEditId(null);
                    setShowModal(true)
                }}>Novo Evento</button>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="titulo-form">
                            {editId ? "Editar Evento" : "Novo Evento"}
                        </h2>
                        <form onSubmit={handleSubmit} className="formulario-evento">
                            <div className="campo-form">
                                <label className="label-form">JSON do Evento</label>
                                <textarea
                                    className="input-form"
                                    rows="15"
                                    value={formJson}
                                    onChange={(e) => setFormJson(e.target.value)}
                                />
                            </div>

                            <div className="botoes-modal">
                                <button type="submit">
                                    {editId ? "Atualizar Evento" : "Criar Evento"}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="event-list-section">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Editar</th>
                            <th>Copiar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((ev) => (
                            <tr key={ev.id}>
                                <td>{ev.nome || "—"}</td>
                                <td>
                                    <button onClick={() => handleEdit(ev)} className="btn-editar">
                                        Editar
                                    </button>
                                </td>
                                <td>
                                    <button onClick={() => handleCopy(ev)} className="btn-copiar">
                                        Copiar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="paginacao">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>

                    <span>{currentPage} / {totalPages}</span>

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Próxima
                    </button>
                </div>

            </div>
        </div>
    );
}
