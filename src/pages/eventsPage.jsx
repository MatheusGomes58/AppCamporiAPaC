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

export default function EventosManager() {
    const [eventos, setEventos] = useState([]);
    const [formJson, setFormJson] = useState("{}");
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [collections, setCollections] = useState([]);
    const [activeCollection, setActiveCollection] = useState("");
    const [searchTerm, setSearchTerm] = useState("");  // Estado novo para pesquisa

    const itemsPerPage = 10;

    useEffect(() => {
        if (!activeCollection) {
            setEventos([]);
            return;
        }

        const eventosRef = collection(db, activeCollection);
        const q = query(eventosRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setEventos(data);
            setCurrentPage(1); // Reseta para a primeira página
        }, (error) => {
            console.error("Erro ao escutar a coleção:", error);
            setEventos([]);
        });

        return () => unsubscribe();
    }, [activeCollection]);

    useEffect(() => {
        const fetchMenuCollections = async () => {
            try {
                const firestore = getFirestore();
                const menuSnapshot = await getDocs(collection(firestore, "menu"));

                if (menuSnapshot.empty) {
                    setCollections([]);
                    setActiveCollection("");
                    return;
                }

                const names = menuSnapshot.docs
                    .map(doc => doc.data().nome)
                    .filter(nome => typeof nome === "string" && nome.length > 0);

                setCollections(names);
            } catch (error) {
                console.error("Erro ao buscar menu:", error);
            }
        };

        fetchMenuCollections();
    }, []);

    useEffect(() => {
        if (collections.length > 0) {
            setActiveCollection(collections[0]);
        } else {
            setActiveCollection("");
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

        try {
            if (editId) {
                const docRef = doc(db, activeCollection, editId);
                await updateDoc(docRef, parsed);
            } else {
                const eventosRef = collection(db, activeCollection);
                await addDoc(eventosRef, parsed);
            }

            setFormJson("{}");
            setEditId(null);
            setShowModal(false);
        } catch (error) {
            alert("Erro ao salvar no Firestore.");
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

    function findFirstString(obj) {
        if (typeof obj === "string") {
            return obj;
        }
        if (typeof obj === "object" && obj !== null) {
            for (const key in obj) {
                const value = findFirstString(obj[key]);
                if (typeof value === "string") {
                    return value;
                }
            }
        }
        return null;
    }

    // Filtra eventos pelo searchTerm, buscando no JSON stringificado do evento (case insensitive)
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
                            key={colName}
                            className={`date-panel ${activeCollection === colName ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCollection(colName);
                                setSearchTerm(""); // limpa pesquisa ao trocar coleção
                                setCurrentPage(1);
                            }}
                        >
                            {colName}
                        </button>
                    ))}
                </div>

                <div className="search-container" style={{ marginBottom: "1rem" }}>
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
                    />
                </div>

                <div className="botao-novo">
                    <button onClick={() => {
                        setFormJson("{}");
                        setEditId(null);
                        setShowModal(true);
                    }}>
                        Novo Evento
                    </button>
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
