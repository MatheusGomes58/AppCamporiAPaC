import { useEffect, useState } from "react";
import "../css/menuPage.css";
import menuData from "../data/menuCard.json";
import * as Icons from "react-icons/fa";
import LogoCampori from '../img/trunfo.png'
import { useNavigate } from 'react-router-dom';

const MenuComponent = () => {
    const [menu, setMenu] = useState(menuData);
    const navigate = useNavigate();

    useEffect(() => {
        setMenu(menuData);
    }, []);

    return (
        <div className="menu-container">
            <img src={LogoCampori} className='menu-image' />

            {/* Renderiza os menus em cards */}
            <div className="menu-cards">
                {menu.menuCards.map((item, index) => {
                    const IconComponent = Icons[item.icon] || Icons.FaRegQuestionCircle; // Ícone padrão caso não encontre

                    return (
                        <a
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
                    <div key={index} className="menu-list">
                        <h3 className="menu-list-title">{list.title}</h3>
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuComponent;
