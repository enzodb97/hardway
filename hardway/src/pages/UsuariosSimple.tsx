import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonMenuButton,
} from '@ionic/react';

const UsuariosSimple: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Usuarios (Test)</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>¡La página de usuarios funciona!</h1>
        <p>Esta es una versión simplificada para probar que la ruta funciona.</p>
        <p>Si ves este mensaje, el problema no está en el enrutamiento.</p>
      </IonContent>
    </IonPage>
  );
};

export default UsuariosSimple;
