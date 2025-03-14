import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './menu.css';

function MenuOptions() {
    const history = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(location.pathname);
    const [isMenuMinimized, setIsMenuMinimized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setCurrentPage(location.pathname);
    }, [location.pathname]);

    function toggleMenu() {
        setIsMenuMinimized(!isMenuMinimized);
    }

    function acessPage(path) {
        if (path === '/score') {
            navigate('/score');
        } else {
            setCurrentPage(path);
            history(path);
        }
    }

    const handleRedirect = () => {
        window.location.href = 'https://www.instagram.com/matheusgome58/';
    };

    return (
        <>
            <footer className="footer" onClick={handleRedirect}>
                <p className="footer-text">Desenvolvido por MatheusGomes58</p>
            </footer>
            <div className="navbar">
                <div className='addEvent'>
                    <button className={`btnCircle ${currentPage === '/home' || currentPage === '/' ? 'active' : ''}`} onClick={() => acessPage('/home')}>
                        <i className="fas fa-home"></i>
                    </button>
                    <button className={`btnCircle ${currentPage === '/map' ? 'active' : ''}`} onClick={() => acessPage('/map')}>
                        <i className="fas fa-map-marker-alt"></i>
                    </button>
                    <button className={`btnCircle ${currentPage === '/guide' ? 'active' : ''}`} onClick={() => acessPage('/guide')}>
                        <i className="fas fa-book"></i>
                    </button>
                    <button className={`btnCircle ${currentPage === '/menu' ? 'active' : ''}`} onClick={() => acessPage('/menu')}>
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </>

    );
}

export default MenuOptions;
