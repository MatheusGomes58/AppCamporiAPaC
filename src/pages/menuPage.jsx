import { useEffect, useState } from "react";
import "../css/menuPage.css";
import menuData from "../data/menuCard.json";
import * as Icons from "react-icons/fa";
import LogoCampori from '../img/trunfo.png'
import { useNavigate } from 'react-router-dom';

const MenuComponent = () => {
    const [menu, setMenu] = useState(menuData);
    const [admin, setAdmin] = useState(false);
    const [clube, setClube] = useState('');
    const [username, setUsername] = useState('');
    const [isAutenticated, setAutenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setMenu(menuData);
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setAdmin(userData.admin || false);
            setClube(userData.clube || '')
            setUsername(userData.name || '')
            setAutenticated(true);
        } else {
            setAutenticated(false);
        }
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
                        (((list.admin == admin) || (list.user == isAutenticated) || (list.clube == clube) || (list.default)) && <div key={index} className="menu-list">
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
