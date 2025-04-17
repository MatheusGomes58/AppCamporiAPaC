import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import {
    createUserWithEmailAndPassword, updatePassword, updateEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import './login.css';
import clubs from '../../data/clubes.json';

const RegisterForm = ({ remove, username, useremail, userclube, useradmin, userisAutenticated, setLogin }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [clube, setClub] = useState('');
    const [admin, setAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [search, setSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (userisAutenticated) {
            setName(username);
            setEmail(useremail);
            setClub(userclube);
            setAdmin(useradmin);
            setIsEditing(userisAutenticated);
        }
        if (window.location.pathname === '/profile' && !userisAutenticated) {
            alert('Faça o login para visualizar e alterar seus dados!')
            navigate('/');
        }
    }, [navigate]);


    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!name || !email || (!isEditing && !password) || !clube) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const user = auth.currentUser;
            if (isEditing && user) {
                if (password) {
                    const credential = EmailAuthProvider.credential(user.email, password);
                    await reauthenticateWithCredential(user, credential);
                }

                if (email !== user.email) {
                    await updateEmail(user, email);
                }

                await setDoc(doc(db, 'users', user.uid), { email, name, clube, admin }, { merge: true });

                alert('Dados atualizados com sucesso!');
                setLogin(true);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, 'users', userCredential.user.uid), { email, name, clube, admin });

                alert('Usuário cadastrado com sucesso!');
            }
        } catch (error) {
            alert(`Erro: ${error.message}`);
        } finally {
            navigate('/menu');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível!')) {
            return;
        }

        if (!password) {
            alert('Por favor, insira sua senha para confirmar a exclusão.');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                alert('Usuário não autenticado.');
                return;
            }

            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            await deleteDoc(doc(db, 'users', user.uid));
            await deleteUser(user);

            localStorage.removeItem('user');
            alert('Conta excluída com sucesso!');
            navigate('/menu');
        } catch (error) {
            alert(`Erro ao excluir conta: ${error.message}`);
        }
    };

    const handleSelectClub = (clube) => {
        setClub(clube);
        setIsDropdownOpen(false); // Fecha o dropdown após selecionar o clube
    };

    return (
        <div id="RegisterForm">
            {!isDropdownOpen && remove && <div>
                <p>Olá {name}!</p>
                <p>Se você deseja realmente deletar insira sua senha abaixo e pressione o botão para confirmar!</p>
            </div>}
            {!isDropdownOpen && !remove && <input
                className="inputLogin"
                type="text"
                placeholder="Nome do Usuário"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />}
            {!isDropdownOpen && !remove && <input
                className="inputLogin"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isEditing}
            />}
            {!isDropdownOpen && (isEditing && remove ? true : !isEditing) && <div className="password-container">
                <input
                    className="inputLogin"
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder={isEditing ? "Digite sua senha" : "Crie uma senha"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <span className="toggle-password" onClick={togglePasswordVisibility}>
                    {passwordVisible ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                </span>
            </div>}
            {!isDropdownOpen && !remove && <input
                className="inputLogin"
                type="text"
                placeholder="Selecione o seu clube"
                value={clube}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => !isEditing && setIsDropdownOpen(true)}
                disabled={isEditing}
            />}

            {isDropdownOpen && !remove && (
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
                                <div>{`Distrito: ${c.DISTRITO}`}</div>
                            </div>
                        ))}
                </div>
            )}

            {!isDropdownOpen && !remove && <button className="btnAuth" onClick={handleRegister}>
                {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            </button>}

            {!isDropdownOpen && remove && isEditing && (
                <button className="btnDelete" onClick={handleDeleteAccount}>
                    Excluir Conta
                </button>
            )}
        </div>
    );
}

export default RegisterForm;
