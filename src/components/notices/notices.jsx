import React, { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import './notice.css';

const ChatComponent = ({email, uid, admin, name, isSlider = false, isMaster }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    // Carregar mensagens do LocalStorage primeiro
    useEffect(() => {
        const storedMessages = localStorage.getItem("chatMessages");
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
    }, []);

    useEffect(() => {
        const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(fetchedMessages);
            localStorage.setItem("chatMessages", JSON.stringify(fetchedMessages));
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (newMessage.trim() === "" || newMessage.length > 240) return;
        await addDoc(collection(db, "messages"), {
            text: newMessage,
            name,
            email,
            uid,
            timestamp: new Date()
        });
        setNewMessage("");
    };

    const deleteMessage = async (id) => {
        await deleteDoc(doc(db, "messages", id));
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + messages.length) % messages.length);
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "Data desconhecida";
        return new Date(
            timestamp.seconds ? timestamp.seconds * 1000 : timestamp
        ).toLocaleString();
    };

    return (
        <div className="chatWidget">
            {isSlider ? (
                <div className="chat-slider">
                    {messages.length > 0 && (
                        <div className="chatMessageData">
                            <p className="chatTitle" dangerouslySetInnerHTML={{ __html: messages[currentIndex].text.replace(/\n/g, '<br/>') }}></p>
                            <span className="chatAuthor">{formatTimestamp(messages[currentIndex].timestamp)} - {messages[currentIndex].name}</span>
                        </div>
                    )}
                    {messages.length > 1 && <div className="chat-slider-controls">
                        <button className='chatActionButton' onClick={prevSlide} >&lt;</button>
                        <button className='chatActionButton' onClick={nextSlide} >&gt;</button>
                    </div>}
                </div>
            ) : (
                <>
                    <div className="chatList">
                        {messages.map(msg => (
                            <div key={msg.id} className="chatListItem">
                                <p className="chatListTitle" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}></p>
                                <small>{formatTimestamp(messages[currentIndex].timestamp)} - {msg.name}</small>
                                <div>
                                    {msg.email === email && (
                                        <button className='chatActionButton' onClick={() => deleteMessage(msg.id)} >Excluir</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {(admin && isMaster) && <div className="chat-input-container">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="inputMensage"
                            placeholder="Digite sua mensagem (máx. 240 caracteres)"
                            maxLength={240}
                            rows={3}
                        />
                        <span className="char-count">{newMessage.length}/240</span>
                        <button onClick={sendMessage} className="chatActionButton" disabled={newMessage.length > 240}>Enviar</button>
                    </div>}
                </>
            )}
        </div>
    );
};

export default ChatComponent;
