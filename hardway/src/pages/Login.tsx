import { IonContent, IonPage } from "@ionic/react";
import { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ModalRecuperacionPassword from "../components/ModalRecuperacionPassword/ModalRecuperacionPassword";
import zepelin from "../assets/images/zepelin.png";
import "./Login.css";

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  console.log("🔑 Login component montándose...");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModalRecuperacion, setShowModalRecuperacion] = useState(false);
  
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { login, error, isAuthenticated } = useAuth();
  
  console.log("🔑 Login render - isAuthenticated:", isAuthenticated);

  useEffect(() => {
    console.log("🔑 Login useEffect - isAuthenticated:", isAuthenticated);
    if (isAuthenticated) {
      const redirectPath = location.state?.from?.pathname || "/dashboard";
      history.replace(redirectPath);
    }
  }, [isAuthenticated, history, location.state?.from?.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      const redirectPath = location.state?.from?.pathname || "/dashboard";
      history.push(redirectPath);
    }
  };

  console.log("🔑 Login renderizando formulario...");

  return (
    <IonPage className="login-page">
      <IonContent className="login-content">
        <div className="main-container">
          <div className="form-container" style={{ width: "450px" }}>
            <h1 className="brand-title">
              <img src={zepelin} alt="Ícono Hardway" className="brand-logo" />
              HARDWAY
            </h1>

            <div className="form-section">
              <h2 className="section-title">INICIAR SESIÓN</h2>
              <p className="form-instruction">
                Ingrese sus datos para continuar
              </p>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">Usuario</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Ej: admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Contraseña</label>
                  <input
                    type="password"
                    className="custom-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="primary-button" style={{ background: "#feaf00" }}>
                  INICIAR SESIÓN
                </button>
              </form>
              <button
                type="button"
                className="secondary-button"
                style={{ marginTop: 16, height: 42,
                   width: "100%", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                onClick={() => history.push('/chatbot')}
              >
                🤖 Asistente de Pedidos para Clientes 🤖
              </button>
            </div>

            <div className="password-section">
              <button 
                type="button"
                className="password-link" 
                onClick={() => setShowModalRecuperacion(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                ¿Olvidó su contraseña? <span>Restablecer contraseña</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Modal de recuperación de contraseña */}
        <ModalRecuperacionPassword
          isOpen={showModalRecuperacion}
          onDidDismiss={() => setShowModalRecuperacion(false)}
        />
        
        {/* El formulario de invitado ahora vive en la ruta /invitado */}
      </IonContent>
    </IonPage>
  );
};

export default Login;
