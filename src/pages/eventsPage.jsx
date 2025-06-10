import { useEffect, useState } from "react";
import {
    collection,
    addDoc,
    updateDoc,
    onSnapshot,
    query,
    doc,
    getDocs,
    getFirestore
} from "firebase/firestore";
import { db } from "../components/firebase/firebase";
import "../css/eventsPage.css";

export default function EventosManager({ admin }) {
    const [eventos, setEventos] = useState([]);
    const [formJson, setFormJson] = useState("{}");
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [collections, setCollections] = useState([]);
    const [activeCollection, setActiveCollection] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const itemsPerPage = 10;

    useEffect(() => {
        if (!activeCollection || typeof activeCollection !== "object" || !activeCollection.nome) {
            setEventos([]);
            return;
        }

        const eventosRef = collection(db, activeCollection.nome);
        const q = query(eventosRef);

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setEventos(data);
                setCurrentPage(1);
            },
            (error) => {
                console.error("Erro ao escutar a coleção:", error);
                setEventos([]);
            }
        );

        return () => unsubscribe();
    }, [activeCollection]);

    useEffect(() => {
        if (admin) {
            const fetchMenuCollections = async () => {
                try {
                    const firestore = getFirestore();
                    const menuSnapshot = await getDocs(collection(firestore, "menu"));

                    if (menuSnapshot.empty) {
                        setCollections([]);
                        setActiveCollection(null);
                        return;
                    }

                    const docs = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setCollections(docs);
                } catch (error) {
                    console.error("Erro ao buscar menu:", error);
                }
            };

            fetchMenuCollections();
        }
    }, []);

    useEffect(() => {
        if (collections.length > 0) {
            setActiveCollection(collections[0]);
        } else {
            setActiveCollection(null);
        }
    }, [collections]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let parsed;
        try {
            parsed = JSON.parse(formJson);
        } catch (error) {
            alert("JSON inválido! Verifique a formatação.");
            return;
        }

        if (!activeCollection || !activeCollection.nome) {
            alert("Nenhuma coleção ativa selecionada.");
            return;
        }

        try {
            if (editId) {
                const docRef = doc(db, activeCollection.nome, editId);
                await updateDoc(docRef, parsed);
                alert("Evento atualizado com sucesso!");
            } else {
                const eventosRef = collection(db, activeCollection.nome);
                await addDoc(eventosRef, parsed);
                alert("Novo evento criado!");
            }

            setFormJson("{}");
            setEditId(null);
            setShowModal(false);
        } catch (error) {
            alert("Erro ao salvar no Firestore: " + error.message);
            console.error(error);
        }
    };


    const handleEdit = (evento) => {
        const { id, ...rest } = evento;
        setFormJson(JSON.stringify(rest, null, 2));
        setEditId(id);
        setShowModal(true);
    };

    const handleCopy = (evento) => {
        const { id, ...rest } = evento;
        const newData = { ...rest };
        setFormJson(JSON.stringify(newData, null, 2));
        setEditId(null);
        setShowModal(true);
    };

    function findFirstString(obj) {
        if (!activeCollection || !activeCollection.filename) return null;

        const filenameKey = activeCollection.filename;
        const value = obj?.[filenameKey];

        if (typeof value === "string") {
            return value.length > 20 ? value.substring(0, 20) + "…" : value;
        }

        return null;
    }

    const filteredEventos = eventos.filter(ev => {
        const jsonString = JSON.stringify(ev).toLowerCase();
        return jsonString.includes(searchTerm.toLowerCase());
    });

    const totalPages = Math.ceil(filteredEventos.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEventos.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="schedule-page">
            <div className="event-card">
                <div className="date-panel-container">
                    {collections.map((colName) => (
                        <button
                            key={colName.id}
                            className={`date-panel ${activeCollection?.nome === colName.nome ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCollection(colName);
                                setSearchTerm("");
                                setCurrentPage(1);
                            }}
                        >
                            {colName.nome}
                        </button>
                    ))}
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2 className="titulo-form">
                                {editId ? "Editar Evento" : "Novo Evento"}
                            </h2>
                            <form onSubmit={handleSubmit} className="formulario-evento">
                                <div className="campo-form">
                                    <label className="label-form">JSON</label>
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
                    <div className="search-container" style={{ marginBottom: "1rem" }}>
                        <input
                            className="campoEntrada"
                            type="text"
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="botao-novo">
                        <button onClick={() => {
                            setFormJson("{}");
                            setEditId(null);
                            setShowModal(true);
                        }}>
                            Incluir
                        </button>
                    </div>

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
                                    <td>{findFirstString(ev) || "—"}</td>
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
                            {currentItems.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: "center" }}>
                                        Nenhum documento encontrado nesta coleção.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="paginacao">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>
                        <span>{currentPage} / {totalPages || 1}</span>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
