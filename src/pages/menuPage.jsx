import { useEffect, useState } from "react";
import "../css/menuPage.css";
import menuData from "../data/menuCard.json";
import * as Icons from "react-icons/fa";
import LogoCampori from '../img/trunfo.png'
import { useNavigate } from 'react-router-dom';

const MenuComponent = ({useradmin, userclube, userusername, userAutenticated}) => {
    const [menu, setMenu] = useState(menuData);
    const [admin, setAdmin] = useState();
    const [clube, setClube] = useState();
    const [username, setUsername] = useState();
    const [isAutenticated, setAutenticated] = useState();

    const navigate = useNavigate();

    useEffect(() => {
        setMenu(menuData);
        setAdmin(useradmin);
        setClube(userclube);
        setUsername(userusername);
        setAutenticated(userAutenticated);
    }, []);

    return (
        <div className="menu-container">
            <img src={LogoCampori} className='menu-image' />
            <div className="menuCardList">
                {/* Renderiza os menus em cards */}
                <div className="menu-cards">
                    {menu.menuCards.map((item, index) => {
                        const IconComponent = Icons[item.icon] || Icons.FaRegQuestionCircle; // Ícone padrão caso não encontre

                        return (
                            ((item.user == isAutenticated) || (item.default)) && <a
                                key={index}
                                onClick={() => navigate(item.link)}  // Alterado para usar uma função anônima
                                className="menu-card"
                            >
                                <IconComponent className="menu-card-icon" />
                                <span className="menu-card-title">{item.title}</span>
                            </a>
                        );
                    })}
                </div>

                {/* Renderiza os menus em lista */}
                <div className="menu-lists">
                    {menu.menuLists.map((list, index) => (
                        (((list.admin? (list.admin == admin && list.clube == clube) : false) || (list.user == isAutenticated) || (list.default)) && <div key={index} className="menu-list">
                            <h3 className="menu-list-title">{list.title || username}</h3>
                            <ul>
                                {list.items.map((item, subIndex) => (
                                    <li key={subIndex}>
                                        <a
                                            onClick={() => navigate(item.link)}
                                            className="menu-list-item"
                                        >
                                            {item.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>)
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MenuComponent;
