import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './menu.css';

function MenuOptions() {
    const history = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(location.pathname);
    const [isMenuMinimized, setIsMenuMinimized] = useState(false);

    useEffect(() => {
        setCurrentPage(location.pathname);
    }, [location.pathname]);

    function toggleMenu() {
        setIsMenuMinimized(!isMenuMinimized);
    }

    function acessPage(path) {
        setCurrentPage(path);
        history(path);
    }

    function logout() {
        localStorage.clear();
        history('/');
    }

    return (
        <div className={`navbar ${isMenuMinimized ? 'minimized' : ''}`}>
            <div className='addEvent'>
                <button className={`btnCircle ${currentPage === '/schedule' ? 'active' : ''}`} onClick={() => acessPage('/schedule')}>
                    <i className="fas fa-calendar-alt"></i>
                    <p className='btnText'>Programa</p>
                </button>
                <button className={`btnCircle ${currentPage === '/map' ? 'active' : ''}`} onClick={() => acessPage('/map')}>
                    <i className="fas fa-map"></i>
                    <p className='btnText'>Mapa</p>
                </button>
                <button className={`btnCircle ${currentPage === '/home' ? 'active' : ''}`} onClick={() => acessPage('/home')}>
                    <i className="fas fa-home"></i>
                    <p className='btnText'>Home</p>
                </button>
                <button className={`btnCircle ${currentPage === '/guide' ? 'active' : ''}`} onClick={() => acessPage('/guide')}>
                    <i className="fas fa-book"></i>
                    <p className='btnText'>Guia</p>
                </button>
                <button className={`menuCicle ${isMenuMinimized ? 'active' : ''}`} onClick={toggleMenu}>
                    <i className="fas fa-bars"></i>
                    <p className='btnText'>Menu</p>
                </button>
            </div>
        </div>
    );
}

export default MenuOptions;
