import { useEffect, useState } from "react";
import "../css/menuPage.css";
import menuData from "../data/menuCard.json";
import * as Icons from "react-icons/fa";
import LogoCampori from '../img/trunfo.png'
import { useNavigate } from 'react-router-dom';

const MenuComponent = ({ useradmin, userclube, userusername, userAutenticated, isMaster }) => {
    const navigate = useNavigate();

    function selectTitle(title) {
        if (title == 'user') {
            return userusername
        } else if (title == 'clube') {
            return userclube
        } else {
            return title
        }
    }

    function renderMenu(list) {
        if (userAutenticated) {
            if (list.clube == 'APAC') {
                return isMaster;
            } else {
                if (list.title == 'clube' || useradmin){
                    return list.admin == useradmin;
                }
                if (list.user == userAutenticated)
                    return true;
                if (list.admin == useradmin)
                    return true;
            }
        } else {
            if (list.user == userAutenticated)
                return true;
            if (list.default)
                return true;
        }
    }

    return (
        <div className="menu-container">
            <div className="menuCardList">
                {/* Renderiza os menus em cards */}
                <div className="menu-cards">
                    {menuData.menuCards.map((item, index) => {
                        const IconComponent = Icons[item.icon] || Icons.FaRegQuestionCircle; // Ícone padrão caso não encontre

                        return (
                            ((item.user == userAutenticated) || (item.default)) && <a
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
                    {menuData.menuLists.map((list, index) => (
                        (renderMenu(list) && <div key={index} className="menu-list">
                            <h3 className="menu-list-title">{selectTitle(list.title)}</h3>
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
