import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./Reportes.css";

const Reportes: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="warning">
          <IonTitle>Reportes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonButton
              expand="block"
              color="primary"
              onClick={() => history.push("/reportes/clientes-mas-pedidos")}
            >
              Clientes con más pedidos
            </IonButton>
          </IonCardHeader>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonButton
              expand="block"
              color="primary"
              onClick={() => history.push("/reportes/stock-actual")}
            >
              Stock actual disponible
            </IonButton>
          </IonCardHeader>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonButton
              expand="block"
              color="primary"
              onClick={() => history.push("/reportes/productos-mas-pedidos")}
            >
              Productos más pedidos
            </IonButton>
          </IonCardHeader>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};
export default Reportes;
