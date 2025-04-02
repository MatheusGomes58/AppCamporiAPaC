import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoCampori from '../img/trunfo.png'
import "../css/loginPage.css";
import LoginForm from '../components/Auth/login'
import RegisterForm from '../components/Auth/register'



const AuthForm = ({ menuEnabled, name, email, clube, admin, isAutenticated, setLogin }) => {
    const [activeTab, setActiveTab] = useState(menuEnabled);
    const [isDeleteProfile, setDelete] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const path = window.location.pathname;
    
        // Verifique se já foi processado antes
        if (path === '/logout' && !localStorage.getItem('logoutProcessed')) {
            const confirmLogout = window.confirm('Deseja realmente sair?');
            if (!confirmLogout) {
                navigate('/menu');
                return;
            }
            localStorage.removeItem('user');
            setLogin(true);
            navigate('/menu');
            localStorage.setItem('logoutProcessed', 'true'); // Marcar que o logout foi processado
        } else if (path === '/deleteprofile' && !localStorage.getItem('profileDeleteProcessed')) {
            setDelete(true);
            localStorage.setItem('profileDeleteProcessed', 'true'); // Marcar que o delete foi processado
        }
    }, []); // Array de dependências vazio
    

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="auth-container">
            <img src={LogoCampori} className='auth-image' />
            <div className="auth-form">
                <h2>
                    {!activeTab ? 'Logar' : !isDeleteProfile ? isAutenticated ? 'Atualizar Dados' : 'Registrar' : 'Remover Usuário'}
                </h2>
                {activeTab ?
                    <RegisterForm remove={isDeleteProfile}
                        useradmin={admin}
                        userclube={clube}
                        useremail={email}
                        username={name}
                        userisAutenticated={isAutenticated}
                        setLogin={setLogin}
                    /> :
                    <LoginForm
                        setLogin={setLogin}
                        isAutenticated={isAutenticated}
                    />}
            </div>
        </div>
    );
};

export default AuthForm;
