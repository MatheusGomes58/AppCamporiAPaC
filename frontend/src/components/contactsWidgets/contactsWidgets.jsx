import React, { useEffect, useState } from 'react';
import contatos from './contatos.json'; // Assumindo que seu arquivo JSON está aqui
import './contactsWidgets.css'; // Importe seu arquivo CSS
import { FaPhone, FaEnvelope } from 'react-icons/fa'; // Importe ícones

const useContacts = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        setEvents(contatos);
    }, []);

    return events;
};

const ContactsWidget = () => {
    const contacts = useContacts();
    const [currentPage, setCurrentPage] = useState(1);
    const contactsPerPage = 2;

    const handleContactClick = (contato) => {
        if (contato.Telefone) {
            window.location.href = `tel:${contato.Telefone}`;
        } else if (contato.Email) {
            window.location.href = `mailto:${contato.Email}`;
        }
    };

    const indexOfLastContact = currentPage * contactsPerPage;
    const indexOfFirstContact = indexOfLastContact - contactsPerPage;
    const currentContacts = contacts.slice(indexOfFirstContact, indexOfLastContact);

    const totalPages = Math.ceil(contacts.length / contactsPerPage);

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="contacts-widget">
            <div className="contacts-widget-data">
                <ul className="contacts-list">
                    <p className='title'>Lista de Contatos oficiais do campori</p>
                    {currentContacts.map((contato, index) => (
                        <li
                            key={index}
                            className="contacts-list-item"
                            style={{ cursor: 'pointer' }}
                        >
                            <p className="contacts-title">{contato.Setor}</p>
                            <p>{contato.Responsável}</p>
                            {contato.Telefone && (
                                <div className="contacts-info">
                                    <FaPhone />
                                    <p style={{marginLeft: '5px'}}>{contato.Telefone}</p>
                                </div>
                            )}
                            {contato.Email && (
                                <div className="contacts-info">
                                    <FaEnvelope />
                                    <p style={{marginLeft: '5px'}}>{contato.Email}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="contacts-pagination">
                <button onClick={goToPreviousPage} disabled={currentPage === 1} className="contacts-button">
                    Anterior
                </button>
                <span>{`Página ${currentPage} de ${totalPages}`}</span>
                <button onClick={goToNextPage} disabled={currentPage === totalPages} className="contacts-button">
                    Próxima
                </button>
            </div>
        </div>
    );
};

export default ContactsWidget;