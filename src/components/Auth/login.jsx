import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './login.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      if(window.location.pathname === '/logout'){
        localStorage.removeItem('user');
      }
      navigate('/menu'); 
    }
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.data();

      localStorage.setItem('user', JSON.stringify({
        email: email,
        uid: user.uid,
        authTime: new Date().getTime().toString(),
        admin: userData?.admin || false,
        clube: userData?.clube || '',
        name: userData?.name || ''
      }));

      navigate('/menu');
    } catch (error) {
      console.error('Erro no login:', error.code, error.message);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgotPassword');
  };

  return (
    <div id="loginForm">
      <input
        className="inputLogin"
        type="email"
        id="email"
        placeholder="Entrar com email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div className="password-container">
        <input
          className="inputLogin"
          type={passwordVisible ? 'text' : 'password'}
          id="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span className="toggle-password" onClick={togglePasswordVisibility}>
          {passwordVisible ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
        </span>
      </div>
      <a className="resetPass" onClick={handleForgotPassword}>Esqueceu sua senha?</a>
      <div className="boxButton">
        <button className="btnAuth" onClick={handleLogin}>Log In</button>
      </div>
    </div>
  );
}

export default LoginForm;
