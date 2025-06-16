import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/react";
import GraficoBarras from "../../components/GraficoBarras"; // Ajusta la ruta si es necesario

const Reportes: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar color="warning">
        <IonTitle>Reportes</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <h2>Productos más pedidos</h2>
      <GraficoBarras />
      {/* Aquí puedes agregar más gráficos o reportes */}
    </IonContent>
  </IonPage>
);

export default Reportes;
