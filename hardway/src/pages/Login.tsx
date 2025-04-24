import { IonContent, IonPage, IonLoading } from "@ionic/react";
import { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import zepelin from "../assets/images/zepelin.png";
import "./Login.css";

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { login, error, isAuthenticated, loading: authLoading } = useAuth();

  // Redirección automática al dashboard si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = location.state?.from?.pathname || "/dashboard";
      history.replace(redirectPath);
    }
  }, [isAuthenticated, history, location.state?.from?.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  if (authLoading) {
    return <IonLoading isOpen={true} message="Verificando sesión..." />;
  }

  return (
    <IonPage className="login-page">
      <IonContent className="login-content">
        <div className="main-container">
          <div className="form-container">
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
                  <label className="input-label">Usuario *</label>
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
                  <label className="input-label">Contraseña *</label>
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

                <button
                  type="submit"
                  className="primary-button"
                  disabled={authLoading}
                >
                  {authLoading ? "CARGANDO..." : "INICIAR SESIÓN"}
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
