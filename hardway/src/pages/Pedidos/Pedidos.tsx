// src/pages/Pedidos/Pedidos.tsx
import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
} from "@ionic/react";
import { cargarPedidos, Pedido } from "../../utils/pedidosUtils";
import { useHistory } from "react-router-dom";

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const history = useHistory();

  useEffect(() => {
    cargarPedidos().then(setPedidos);
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pedidos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonButton routerLink="/alta-pedido" expand="block">
          Nuevo Pedido
        </IonButton>
        <IonList>
          {pedidos.map((pedido: any) => (
            <IonItem key={pedido.id}>
              <IonLabel>
                <strong>{pedido.descripcion}</strong> - {pedido.estado} <br />
                Cliente: {pedido.cliente?.nombre || "Sin cliente"}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Pedidos;
