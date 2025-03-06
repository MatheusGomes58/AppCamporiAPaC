import { useState } from "react";
import LogoCampori from '../img/trunfo.png'
import "../css/loginPage.css"; // Arquivo CSS separado

const AuthForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Login realizado!");
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="card-content">
                    <img className="auth-image" src={LogoCampori} />
                </div>
                <h2>Faça o login para continuar</h2>
                <label>E-mail</label>
                <div className="card-content">
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <label>Senha</label>
                <div className="card-content">
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="card-content">
                    <button type="submit">Entrar</button>
                </div>
            </form>
        </div>
    );
};

export default AuthForm;
