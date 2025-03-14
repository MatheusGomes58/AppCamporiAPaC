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
        if (window.location.pathname === '/logout') {
            const confirmLogout = window.confirm('Deseja realmente sair?');
            if (!confirmLogout) {
                navigate('/menu');
                return;
            }
            localStorage.removeItem('user'); // Remove o usuário do localStorage
            setLogin(false); // Chama a função setLogin, passando false para indicar que o usuário não está autenticado
            window.location.href = "/menu";
        } else if (window.location.pathname === '/deleteprofile') {
            setDelete(true);
        }
    }, [navigate, setLogin]); // A dependência de setLogin garante que a função seja chamada novamente se ela mudar

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
