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
  IonInput,
} from "@ionic/react";
import { cargarPedidos, Pedido } from "../../utils/pedidosUtils";
import { useHistory } from "react-router-dom";

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const history = useHistory();

  useEffect(() => {
    cargarPedidos().then(setPedidos);
  }, []);

  // Buscador integrado
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const texto = busqueda
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (texto === "") return true;

    const nombreCliente = (pedido.Cliente?.nombre || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const fecha = (pedido.fecha || "").toLowerCase();
    const id = pedido.id.toString();

    return (
      nombreCliente.includes(texto) ||
      fecha.includes(texto) ||
      id.includes(texto)
    );
  });

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

        {/* Buscador único */}
        <div style={{ margin: "16px 0" }}>
          <IonInput
            placeholder="Buscar por cliente, fecha o ID"
            value={busqueda}
            onIonChange={(e) => setBusqueda(e.detail.value!)}
            clearInput
          />
        </div>

        <IonList>
          {pedidosFiltrados.map((pedido) => (
            <IonItem key={pedido.id}>
              <IonLabel>
                <strong>{pedido.descripcion}</strong> - {pedido.estado} <br />
                Cliente:{" "}
                <strong>{pedido.Cliente?.nombre || "Sin cliente"}</strong>
                <br />
                Fecha: {pedido.fecha} <br />
                ID: {pedido.id}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Pedidos;
