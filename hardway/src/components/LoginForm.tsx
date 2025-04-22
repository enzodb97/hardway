import { IonButton, IonInput, IonItem, IonLabel, IonPage, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://api.webtest.net/auth/login', {
        username,
        password
      });
      
      localStorage.setItem('authToken', response.data.token);
      history.push('/dashboard');
    } catch (err) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hardway</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="login-container">
          <h2>INICIAR SESIÓN</h2>
          <p>Ingresa los datos para iniciar sesión</p>
          
          <form onSubmit={handleLogin}>
            <IonItem>
              <IonLabel position="floating">Usuario *</IonLabel>
              <IonInput
                value={username}
                onIonChange={(e) => setUsername(e.detail.value!)}
                required
              />
            </IonItem>
            
            <IonItem>
              <IonLabel position="floating">Contraseña *</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
                required
              />
            </IonItem>

            {error && <div className="error-message">{error}</div>}
            
            <IonButton expand="block" type="submit" className="ion-margin-top">
              INICIAR SESIÓN
            </IonButton>
          </form>
          
          <div className="forgot-password">
            <a href="/restore-password">¿Olvidó su contraseña? Restaurar contraseña</a>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginForm;