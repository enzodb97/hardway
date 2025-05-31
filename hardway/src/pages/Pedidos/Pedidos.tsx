// src/pages/Pedidos/Pedidos.tsx
import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonMenuButton,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import {
  cargarPedidos,
  filtrarPedidos,
  Pedido,
} from "../../utils/pedidosUtils";
import { useHistory } from "react-router-dom";
import "./Pedidos.css";

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const history = useHistory();

  useEffect(() => {
    cargarPedidos().then(setPedidos);
  }, []);

  const pedidosFiltrados = filtrarPedidos(pedidos, busqueda);

  return (
    <IonPage className="pedidos-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Pedidos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="pedidos-content">
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              {/* Fila 1: Botón */}
              <IonButton routerLink="/alta-pedido" expand="block">
                Nuevo Pedido
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              {/* Fila 2: Buscador */}
              <div className="pedidos-buscador">
                <IonInput
                  placeholder="Buscar por cliente, fecha o ID"
                  value={busqueda}
                  onIonChange={(e) => setBusqueda(e.detail.value!)}
                  clearInput
                />
              </div>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              {/* Fila 3: Tabla */}
              <IonGrid className="pedidos-table">
                <IonRow className="table-header">
                  <IonCol className="text-center">
                    <strong>ID</strong>
                  </IonCol>
                  <IonCol className="text-center">
                    <strong>Descripción</strong>
                  </IonCol>
                  <IonCol className="text-center">
                    <strong>Estado</strong>
                  </IonCol>
                  <IonCol className="text-center">
                    <strong>Cliente</strong>
                  </IonCol>
                  <IonCol className="text-center">
                    <strong>Fecha</strong>
                  </IonCol>
                </IonRow>
                {pedidosFiltrados.map((pedido) => (
                  <IonRow key={pedido.id} className="table-row">
                    <IonCol className="text-center">{pedido.id}</IonCol>
                    <IonCol className="text-center">
                      {pedido.descripcion}
                    </IonCol>
                    <IonCol className="text-center">{pedido.estado}</IonCol>
                    <IonCol className="text-center">
                      {pedido.Cliente?.nombre || "Sin cliente"}
                    </IonCol>
                    <IonCol className="text-center">{pedido.fecha}</IonCol>
                  </IonRow>
                ))}
              </IonGrid>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Pedidos;
