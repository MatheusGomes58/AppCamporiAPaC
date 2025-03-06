import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoCampori from '../img/trunfo.png'
import "../css/loginPage.css";
import LoginForm from '../components/Auth/login'
import RegisterForm from '../components/Auth/register'


const AuthForm = ({ menuEnabled }) => {
    const [activeTab, setActiveTab] = useState(menuEnabled);
    const navigate = useNavigate();

    useEffect(() => {
        userValidation();
    }, []);


    async function userValidation() {
        const authTime = localStorage.getItem('authTime');
        if (!authTime) {
            return;
        }

        const currentTime = new Date().getTime();
        const timeElapsed = currentTime - parseInt(authTime, 10);

        const threeHoursInMs = 3 * 60 * 60 * 1000;
        if (timeElapsed > threeHoursInMs) {
            return;
        }
    }

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="auth-container">
            <img src={LogoCampori} className='auth-image' />
            <div className="auth-form">
                <h2>
                    {!activeTab ? 'Logar' : 'Registrar'}
                </h2>
                {!activeTab ? <LoginForm /> : <RegisterForm />}
            </div>
        </div>
    );
};

export default AuthForm;
