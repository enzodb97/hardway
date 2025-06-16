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
} from "@ionic/react";
import GraficoBarras from "../../components/GraficoBarras"; // Productos más pedidos
// Aquí puedes importar otros componentes de gráficos o tablas

const Reportes: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar color="warning">
        <IonTitle>Reportes</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Clientes con más pedidos</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {/* Aquí irá el gráfico o tabla de clientes preferenciales */}
          {/* Ejemplo: <GraficoClientesMasPedidos /> */}
        </IonCardContent>
      </IonCard>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Stock actual disponible</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {/* Aquí irá el listado o gráfico de stock actual */}
          {/* Ejemplo: <TablaStockActual /> */}
        </IonCardContent>
      </IonCard>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Productos más pedidos</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <GraficoBarras />
        </IonCardContent>
      </IonCard>
    </IonContent>
  </IonPage>
);

export default Reportes;
