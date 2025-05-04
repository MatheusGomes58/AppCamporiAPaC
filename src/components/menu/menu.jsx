import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './menu.css';

function MenuOptions() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(location.pathname);

    useEffect(() => {
        setCurrentPage(location.pathname);
    }, [location.pathname]);

    // Listas de rotas para cada botão
    const homeRoutes = ['/', '/home'];
    const mapRoutes = ['/map'];
    const scheduleRoutes = ['/schedule', '/schedulesclub', '/chaveamento'];
    const menuRoutes = ['/menu', '/guide', '/scores', '/scoresclubs'];

    // Função para verificar se a rota atual bate com uma das rotas ou seus subcaminhos
    const matchRoute = (routes) => {
        return routes.some(route => currentPage === route || currentPage.startsWith(route + '/'));
    };

    const acessPage = (path) => {
        setCurrentPage(path);
        navigate(path);
    };

    const handleRedirect = () => {
        window.location.href = 'https://www.instagram.com/matheusgome58/';
    };

    return (
        <div>
            <div className="navbar">
                <div className='addEvent'>
                    <button
                        className={`btnCircle ${matchRoute(homeRoutes) ? 'active' : ''}`}
                        onClick={() => acessPage('/home')}
                    >
                        <i className="fas fa-home"></i>
                    </button>
                    <button
                        className={`btnCircle ${matchRoute(mapRoutes) ? 'active' : ''}`}
                        onClick={() => acessPage('/map')}
                    >
                        <i className="fas fa-map-marker-alt"></i>
                    </button>
                    <button
                        className={`btnCircle ${matchRoute(scheduleRoutes) ? 'active' : ''}`}
                        onClick={() => acessPage('/schedule')}
                    >
                        <i className="fas fa-calendar-alt"></i>
                    </button>
                    <button
                        className={`btnCircle ${matchRoute(menuRoutes) ? 'active' : ''}`}
                        onClick={() => acessPage('/menu')}
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </div>
            <footer className="footer" onClick={handleRedirect}>
                <p className="footer-text">Desenvolvido por MatheusGomes58</p>
            </footer>
        </div>
    );
}

export default MenuOptions;
