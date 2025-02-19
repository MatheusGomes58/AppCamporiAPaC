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
        if (path === '/score') {
            window.location.href = 'https://apac.campori.app/login';
        } else {
            setCurrentPage(path);
            history(path);
        }
    }

    return (
        <div className="navbar">
            <div className='addEvent'>
                <button className={`btnCircle ${currentPage === '/home' || currentPage === '/' ? 'active' : ''}`} onClick={() => acessPage('/home')}>
                    <i className="fas fa-home"></i>
                </button>
                <button className={`btnCircle ${currentPage === '/map' ? 'active' : ''}`} onClick={() => acessPage('/map')}>
                    <i className="fas fa-map-marker-alt"></i>
                </button>
                <div className='btnCircleAddSpace'>
                    <button className={`btnCircleAdd ${currentPage === '/schedule' ? 'active' : ''}`} onClick={() => acessPage('/create')}>
                        <i className="fas fa-plus"></i>
                    </button>
                </div>
                <button className={`btnCircle ${currentPage === '/guide' ? 'active' : ''}`} onClick={() => acessPage('/guide')}>
                    <i className="fas fa-book"></i>
                </button>
                <button className={`btnCircle ${currentPage === '/menu' ? 'active' : ''}`} onClick={() => acessPage('/menu')}>
                    <i className="fas fa-bars"></i>
                </button>
            </div>
        </div>


    );
}

export default MenuOptions;

/*

                <button className={`btnCircle ${currentPage === '/score' ? 'active' : ''}`} onClick={() => acessPage('/score')}>
                    <i className="fas fa-user"></i>
                    <p className='btnText'>Meu Clube</p>
                </button>
 */
