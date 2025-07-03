import React from 'react';
import { useAuth } from '../context/AuthContext';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonMenuButton } from '@ionic/react';

const DebugAuth: React.FC = () => {
  const { isAuthenticated, rol, username } = useAuth();

  const debugLocalStorage = () => {
    console.log('=== DEBUG LOCALSTORAGE ===');
    console.log('isAuthenticated (localStorage):', localStorage.getItem('isAuthenticated'));
    console.log('rol (localStorage):', localStorage.getItem('rol'));
    console.log('username (localStorage):', localStorage.getItem('username'));
    console.log('=== DEBUG AUTH CONTEXT ===');
    console.log('isAuthenticated (context):', isAuthenticated);
    console.log('rol (context):', rol, 'tipo:', typeof rol);
    console.log('username (context):', username);
  };

  React.useEffect(() => {
    debugLocalStorage();
  }, [isAuthenticated, rol, username]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Debug Auth</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Estado de Autenticación</h2>
        <p><strong>Autenticado:</strong> {isAuthenticated ? 'Sí' : 'No'}</p>
        <p><strong>Usuario:</strong> {username || 'No definido'}</p>
        <p><strong>Rol:</strong> {rol || 'No definido'} (tipo: {typeof rol})</p>
        
        <h3>localStorage</h3>
        <p><strong>isAuthenticated:</strong> {localStorage.getItem('isAuthenticated')}</p>
        <p><strong>rol:</strong> {localStorage.getItem('rol')}</p>
        <p><strong>username:</strong> {localStorage.getItem('username')}</p>
        
        <IonButton expand="block" onClick={debugLocalStorage}>
          Debug en Consola
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default DebugAuth;
