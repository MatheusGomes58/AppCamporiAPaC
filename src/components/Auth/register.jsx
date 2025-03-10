import React, { useState } from 'react';
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
    
        // Verifica se algum campo está vazio ou se o campo "clube" não foi selecionado
        if (!name || !email || !password || !club) {
            alert('Por favor, preencha todos os campos e selecione um clube.');
            return; // Não prossegue com o cadastro se algum campo estiver vazio
        }
    
        try {
            // Cria o usuário no Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Salva os dados do usuário no Firestore
            await addDoc(collection(db, 'users'), {
                uid: user.uid,
                email,
                name,
                club,
                status: false,
            });
    
            alert('Usuário cadastrado com sucesso!');
        } catch (error) {
            alert(`Erro no cadastro: ${error.message}`);
        }
    };
    

    const handleSelectClub = (clube) => {
        setClub(clube);
        setIsDropdownOpen(false); // Fecha o dropdown após selecionar o clube
    };

    return (
        <div id="RegisterForm">
            {!isDropdownOpen && <input
                className="inputLogin"
                type="text"
                placeholder="Nome do Usuário"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />}
            {!isDropdownOpen && <input
                className="inputLogin"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />}
            {!isDropdownOpen && <div className="password-container">
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
            </div>}
            {!isDropdownOpen && <input
                className="inputLogin"
                type="text"
                placeholder="Selecione o seu clube"
                value={club}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)} // Abre o dropdown ao focar no campo
            />}

            {/* Dropdown de clubes */}
            {isDropdownOpen && (
                <div className="customSelect">
                    <input
                        className="inputLogin"
                        type="text"
                        placeholder="Pesquise seu clube"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setIsDropdownOpen(true)} // Abre o dropdown ao focar no campo
                    />
                    <div className="selectTitle" onClick={() => handleSelectClub('')}>Selecione seu clube</div>
                    {clubs
                        .filter((c) => c.CLUBE.toLowerCase().includes(search.toLowerCase()))
                        .map((c, index) => (
                            <div key={index} className="optionItem" onClick={() => handleSelectClub(c.CLUBE)}>
                                <div>{`Clube: ${c.CLUBE}`}</div>
                                <div>{`Igreja: ${c.IGREJA}`}</div>
                                <div>{`Igreja: ${c.DISTRITO}`}</div>
                            </div>
                        ))}
                </div>
            )}

            {!isDropdownOpen && <button className="btnAuth" onClick={handleRegister}>Cadastrar</button>}
        </div>
    );
}

export default RegisterForm;
