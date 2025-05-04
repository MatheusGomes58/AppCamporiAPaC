import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoCampori from '../img/trunfo.png'
import "../css/loginPage.css";
import ForgotForm from '../components/Auth/fogotPassword'


const AuthForm = () => {

    return (
        <div className="auth-container">
            <img src={LogoCampori} className='auth-image' />
            <div className="auth-form">
               <ForgotForm />
            </div>
        </div>
    );
};

export default AuthForm;
