import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import axios from "axios";

interface ClienteReporte {
  idCliente: number;
  nombre: string;
  apellido: string;
  dni: string;
  total_pedidos: number;
}

const ClientesMasPedidos: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteReporte[]>([]);
  const history = useHistory();

  useEffect(() => {
    axios
      .get("/api/reportes/clientes-mas-pedidos")
      .then((res) => setClientes(res.data))
      .catch(() => setClientes([]));
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="warning">
          <IonTitle>Clientes con más pedidos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton onClick={() => history.goBack()} color="medium">
          Volver
        </IonButton>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Top 10 Clientes</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <strong>Nombre</strong>
                </IonLabel>
                <IonLabel>
                  <strong>Apellido</strong>
                </IonLabel>
                <IonLabel>
                  <strong>DNI</strong>
                </IonLabel>
                <IonLabel>
                  <strong>Total Pedidos</strong>
                </IonLabel>
              </IonItem>
              {clientes.map((c) => (
                <IonItem key={c.idCliente}>
                  <IonLabel>{c.nombre}</IonLabel>
                  <IonLabel>{c.apellido}</IonLabel>
                  <IonLabel>{c.dni}</IonLabel>
                  <IonLabel>{c.total_pedidos}</IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ClientesMasPedidos;
