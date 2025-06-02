import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonMenuButton,
  IonItem,
  IonList,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";

const DetallePedido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [prendas, setPrendas] = useState<any[]>([]);
  const [pedido, setPedido] = useState<any>(null);

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        const res = await axios.get(`/api/pedidos/${id}`);
        setPedido(res.data);
        setPrendas(
          res.data.Indumentaria?.map((prenda: any) => ({
            nombre: prenda.descripcionIndumentaria,
            referencia: prenda.codigoIndumentaria,
            sku: prenda.SKU || "-", // <-- SKU directo de la base
            categoria: prenda.categoria || "-",
            rack: prenda.Rack || "-", // <-- Rack directo de la base
            cantidad: prenda.PedidoIndumentaria?.cantidad ?? "-",
          })) || []
        );
      } catch (error) {
        // Manejo de error
      }
    };
    cargarPedido();
  }, [id]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Detalle de Pedido</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h2 style={{ textAlign: "center", margin: "1.5rem 0" }}>
          Detalle de Pedido #{pedido?.id}
        </h2>
        <IonGrid>
          <IonRow className="table-header">
            <IonCol>
              <strong>Nombre del producto</strong>
            </IonCol>
            <IonCol>
              <strong>Referencia</strong>
            </IonCol>
            <IonCol>
              <strong>SKU</strong>
            </IonCol>
            <IonCol>
              <strong>Categoria</strong>
            </IonCol>
            <IonCol>
              <strong>Rack</strong>
            </IonCol>
            <IonCol>
              <strong>Cantidad</strong>
            </IonCol>
          </IonRow>
          {prendas.map((prenda, idx) => (
            <IonRow key={idx}>
              <IonCol>{prenda.nombre}</IonCol>
              <IonCol>{prenda.referencia}</IonCol>
              <IonCol>{prenda.sku}</IonCol>
              <IonCol>{prenda.categoria}</IonCol>
              <IonCol>{prenda.rack}</IonCol>
              <IonCol>{prenda.cantidad}</IonCol>
            </IonRow>
          ))}
        </IonGrid>
        <IonButton
          expand="block"
          onClick={() => history.goBack()}
          style={{ marginTop: 24 }}
        >
          Volver
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default DetallePedido;
