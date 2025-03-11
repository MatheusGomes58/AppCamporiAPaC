import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoCampori from '../img/trunfo.png'
import "../css/loginPage.css";
import LoginForm from '../components/Auth/login'
import RegisterForm from '../components/Auth/register'


const AuthForm = ({ menuEnabled }) => {
    const [activeTab, setActiveTab] = useState(menuEnabled);
    const [isAutentication, setAutentication] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        const auth = localStorage.getItem('user');
        if (auth) {
            setAutentication(true);
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
                    {!activeTab ? 'Logar' : isAutentication? 'Atualizar Dados' :'Registrar'}
                </h2>
                {activeTab ? <RegisterForm /> : <LoginForm />}
            </div>
        </div>
    );
};

export default AuthForm;
