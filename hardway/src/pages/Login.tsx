import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import zepelin from '../assets/images/zepelin.png';

import './Login.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();
    const { login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (login(username, password)) {
            history.push('/dashboard');
        } else {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <IonPage>
            <IonContent className="login-content">
                <div className="main-container">
                    <div className="form-container">
                        <h1 className="brand-title">
                            <img src={zepelin} alt="Ícono Hardway" className="brand-logo"
                            />HARDWAY</h1>
                        <div className="form-section">
                            <h2 className="section-title">INICIAR SESIÓN</h2>
                            <p className="form-instruction">Ingrese sus datos para continuar</p>

                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label className="input-label">Usuario *</label>
                                    <input
                                        type="text"
                                        className="custom-input"
                                        placeholder="Ej: admin"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Contraseña *</label>
                                    <input
                                        type="password"
                                        className="custom-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <button type="submit" className="primary-button">
                                    INICIAR SESIÓN
                                </button>
                            </form>
                        </div>

                        <div className="password-section">
                            <a href="/reset" className="password-link">
                                ¿Olvidó su contraseña? <span>Restablecer contraseña</span>
                            </a>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;