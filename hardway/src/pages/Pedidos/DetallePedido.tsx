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
import "./DetallePedido.css";
import zepelin from "../../assets/images/zepelin.png";
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
          res.data.DetallePedidos?.map((detalle: any) => ({
            nombre: detalle.Indumentaria?.descripcionIndumentaria,
            referencia: detalle.Indumentaria?.codigoIndumentaria,
            cantidad: detalle.cantidad,
          })) || []
        );
      } catch (error) {
        // Manejo de error
      }
    };
    cargarPedido();
  }, [id]);

  return (
    <IonPage className="detalle-pedido-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Detalle de Pedido</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h2 className="detalle-pedido-titulo">
          <img src={zepelin} alt="Ícono Hardway" className="brand-logo" />{" "}
          Detalle de Pedido #{pedido?.id}
        </h2>
        <IonGrid>
          <IonRow className="table-header">
            <IonCol size="2">
              <strong>Nombre del producto</strong>
            </IonCol>
            <IonCol size="2">
              <strong>Referencia</strong>
            </IonCol>
            <IonCol size="2">
              <strong>SKU</strong>
            </IonCol>
            <IonCol size="2">
              <strong>Categoria</strong>
            </IonCol>
            <IonCol size="2">
              <strong>Rack</strong>
            </IonCol>
            <IonCol size="2">
              <strong>Cantidad</strong>
            </IonCol>
          </IonRow>
          {prendas.map((prenda, idx) => (
            <IonRow key={idx}>
              <IonCol class="col" size="2">
                {prenda.nombre}
              </IonCol>
              <IonCol class="col" size="2">
                {prenda.referencia}
              </IonCol>
              <IonCol class="col" size="2">
                {prenda.sku}
              </IonCol>
              <IonCol class="col" size="2">
                {prenda.categoria}
              </IonCol>
              <IonCol class="col" size="2">
                {prenda.rack}
              </IonCol>
              <IonCol class="col" size="2">
                {prenda.cantidad}
              </IonCol>
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
