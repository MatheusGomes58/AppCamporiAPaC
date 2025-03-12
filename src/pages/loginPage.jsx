import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoCampori from '../img/trunfo.png'
import "../css/loginPage.css";
import LoginForm from '../components/Auth/login'
import RegisterForm from '../components/Auth/register'


const AuthForm = ({ menuEnabled }) => {
    const [activeTab, setActiveTab] = useState(menuEnabled);
    const [isAutentication, setAutentication] = useState(false)
    const [isDeleteProfile, setDelete] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        const auth = localStorage.getItem('user');
        if (auth) {
            setAutentication(true);
        }
        if(window.location.pathname === '/deleteprofile'){
            setDelete(true);
        }
    }, [setAutentication]);

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="auth-container">
            <img src={LogoCampori} className='auth-image' />
            <div className="auth-form">
                <h2>
                    {!activeTab ? 'Logar' : !isDeleteProfile? isAutentication? 'Atualizar Dados' :'Registrar' : 'Remover Usuário'}
                </h2>
                {activeTab ? <RegisterForm remove={isDeleteProfile} /> : <LoginForm />}
            </div>
        </div>
    );
};

export default AuthForm;
