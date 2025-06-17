import { useEffect, useState } from "react";
import "../css/menuPage.css";
import menuData from "../data/menuCard.json";
import * as Icons from "react-icons/fa";
import LogoCampori from '../img/trunfo.png';
import { useNavigate } from 'react-router-dom';
import { db } from "../components/firebase/firebase";
import {
    collection,
    query, or, where,
    onSnapshot
} from "firebase/firestore";

const MenuComponent = ({ useradmin, userclube, userusername, userAutenticated, isMaster, authorized, userscore, userpresent }) => {
    const navigate = useNavigate();
    const [torneios, setTorneios] = useState([]);
    const [loadingTorneios, setLoadingTorneios] = useState(true);

    useEffect(() => {
        if (!userAutenticated) return;

        const q = query(
            collection(db, "eventos"),
            or(
                where("isTorneio", "==", true),
                where("isCorrida", "==", true),
                where("isTrilha", "==", true)

            )
        );


        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const lista = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTorneios(lista);
                setLoadingTorneios(false);
            },
            (error) => {
                console.error("Erro ao buscar torneios:", error);
                setLoadingTorneios(false);
            }
        );

        return () => unsubscribe();
    }, [userAutenticated]);


    function selectTitle(title) {
        if (title === 'user') {
            return userusername;
        } else if (title === 'clube') {
            return userclube;
        } else {
            return title;
        }
    }

    function renderMenu(list) {
        if ((list.user === userAutenticated) || (list.admin == (useradmin || isMaster))) {
            return true;
        }
    }

    function renderItem(list) {
        if (list.authorized)
            return authorized;
        if (list.score)
            return userscore;
        if (list.present)
            return userpresent;
        if (list.orMaster && isMaster)
            return list.orMaster && isMaster
        if (list.clube && list.admin)
            return useradmin && userclube == list.clube
        if (list.clube && !list.admin)
            return userclube == list.clube
        if (list.admin && !list.clube)
            return useradmin
        if (!list.admin && !list.clube)
            return true;
    }


    return (
        <div className="menu-container">
            <div className="menuCardList">
                {/* Renderiza os menus em cards */}
                <div className="menu-cards">
                    {menuData.menuCards.map((item, index) => {
                        const IconComponent = Icons[item.icon] || Icons.FaRegQuestionCircle;

                        return (
                            ((item.user === userAutenticated) || item.default) && (
                                <a
                                    key={index}
                                    onClick={() => item.link && navigate(item.link)}
                                    className="menu-card"
                                >
                                    <IconComponent className="menu-card-icon" />
                                    <span className="menu-card-title">{item.title}</span>
                                </a>
                            )
                        );
                    })}
                </div>

                {/* Renderiza os menus em lista */}
                <div className="menu-lists">
                    {menuData.menuLists.map((list, index) => (
                        renderMenu(list) && (
                            <div key={index} className="menu-list">
                                <h3 className="menu-list-title">{selectTitle(list.title)}</h3>
                                <ul>
                                    {list.title === 'Ranking e Atividades' ? (
                                        loadingTorneios ? (
                                            <li>
                                                <span className="menu-list-item">Carregando torneios...</span>
                                            </li>
                                        ) : torneios.length === 0 ? (
                                            <li>
                                                <span className="menu-list-item">Nenhum torneio encontrado.</span>
                                            </li>
                                        ) : (
                                            torneios.map((item, subIndex) => (
                                                <li key={subIndex}>
                                                    <a
                                                        onClick={() => navigate(`/chaveamento/${item.nome}`)}
                                                        className="menu-list-item"
                                                    >
                                                        {item.nome}
                                                    </a>
                                                </li>
                                            ))
                                        )
                                    ) : (
                                        list.items.map((item, subIndex) => (
                                            renderItem(item) && <li key={subIndex}>
                                                <a
                                                    onClick={() => item.link && navigate(item.link)}
                                                    className="menu-list-item"
                                                >
                                                    {item.title}
                                                </a>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MenuComponent;
