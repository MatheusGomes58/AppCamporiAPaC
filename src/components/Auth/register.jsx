import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import './login.css';
import clubs from '../../data/clubes.json';

function RegisterForm() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [club, setClub] = useState('');
    const [search, setSearch] = useState('');

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await addDoc(collection(db, 'users'), {
                uid: user.uid,
                email,
                name,
                club,
                status: false
            });

            alert('Usuário cadastrado com sucesso!');
            window.location.reload();
        } catch (error) {
            alert(`Erro no cadastro: ${error.message}`);
        }
    };

    return (
        <div id="RegisterForm">
            <input
                className="inputLogin"
                type="text"
                placeholder="Nome do Usuário"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                className="inputLogin"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <div className="password-container">
                <input
                    className="inputLogin"
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder="Crie uma Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <span className="toggle-password" onClick={togglePasswordVisibility}>
                    {passwordVisible ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                </span>
            </div>
            <input
                className="inputLogin"
                type="text"
                placeholder="Pesquise seu clube"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <select className="selectLogin" value={club} onChange={(e) => setClub(e.target.value)} required>
                <option value="">Selecione seu clube</option>
                {clubs
                    .filter((c) => c.CLUBE.toLowerCase().includes(search.toLowerCase()))
                    .map((c, index) => (
                        <option key={index} value={c.CLUBE}>
                            {c.CLUBE}
                        </option>
                    ))}
            </select>
            <button className="btnAuth" onClick={handleRegister}>Cadastrar</button>
        </div>
    );
}

export default RegisterForm;
