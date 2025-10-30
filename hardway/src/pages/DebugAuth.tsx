import React from 'react';
import { useAuth } from '../context/AuthContext';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonMenuButton } from '@ionic/react';

const DebugAuth: React.FC = () => {
  const { isAuthenticated, roles, username } = useAuth(); // ✅ Usar roles

  const debugLocalStorage = () => {
    console.log('=== DEBUG LOCALSTORAGE ===');
    console.log('isAuthenticated (localStorage):', localStorage.getItem('isAuthenticated'));
    console.log('roles (localStorage):', localStorage.getItem('roles'));
    console.log('rolesIds (localStorage):', localStorage.getItem('rolesIds'));
    console.log('username (localStorage):', localStorage.getItem('username'));
    console.log('=== DEBUG AUTH CONTEXT ===');
    console.log('isAuthenticated (context):', isAuthenticated);
    console.log('roles (context):', roles, 'tipo:', typeof roles);
    console.log('username (context):', username);
  };

  React.useEffect(() => {
    debugLocalStorage();
  }, [isAuthenticated, roles, username]);

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
        <p><strong>Roles:</strong> {roles.join(", ") || 'No definido'} (cantidad: {roles.length})</p>
        
        <h3>localStorage</h3>
        <p><strong>isAuthenticated:</strong> {localStorage.getItem('isAuthenticated')}</p>
        <p><strong>roles:</strong> {localStorage.getItem('roles')}</p>
        <p><strong>rolesIds:</strong> {localStorage.getItem('rolesIds')}</p>
        <p><strong>username:</strong> {localStorage.getItem('username')}</p>
        
        <IonButton expand="block" onClick={debugLocalStorage}>
          Debug en Consola
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default DebugAuth;
