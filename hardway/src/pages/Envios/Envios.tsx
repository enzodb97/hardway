import React, { useEffect, useState } from "react";
import {
  obtenerPedidosAbonados,
  despacharPedido,
  PedidoEnvio,
} from "../../utils/enviosUtils";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonButton,
  IonAlert,
  IonLabel,
} from "@ionic/react";
import "./Envios.css";

const Envios: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoEnvio[]>([]);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<PedidoEnvio | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    obtenerPedidosAbonados().then(setPedidos);
  }, []);

  const handleDespachar = async () => {
    if (!pedidoSeleccionado || !codigoSeguimiento.trim()) {
      setAlertMsg("Debe ingresar un código de seguimiento.");
      setShowAlert(true);
      return;
    }
    try {
      await despacharPedido(pedidoSeleccionado.numeroPedido, codigoSeguimiento);
      setAlertMsg("Pedido despachado correctamente.");
      setShowAlert(true);
      setCodigoSeguimiento("");
      setPedidoSeleccionado(null);
      obtenerPedidosAbonados().then(setPedidos);
    } catch {
      setAlertMsg("Error al despachar el pedido.");
      setShowAlert(true);
    }
  };

  return (
    <IonPage className="envios-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Cola de Despacho</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="envios-content">
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <div className="envios-table-wrapper">
                <IonGrid className="envios-table">
                  <IonRow className="table-header">
                    <IonCol>
                      <strong>N° Pedido</strong>
                    </IonCol>
                    <IonCol>
                      <strong>Cliente</strong>
                    </IonCol>
                    <IonCol>
                      <strong>Email</strong>
                    </IonCol>
                    <IonCol>
                      <strong>Fecha</strong>
                    </IonCol>
                    <IonCol>
                      <strong>Acción</strong>
                    </IonCol>
                  </IonRow>
                  {pedidos.map((pedido) => (
                    <IonRow key={pedido.numeroPedido} className="table-row">
                      <IonCol>{pedido.numeroPedido}</IonCol>
                      <IonCol>
                        {pedido.nombre} {pedido.apellido}
                      </IonCol>
                      <IonCol>{pedido.cliente_email}</IonCol>
                      <IonCol>
                        {new Date(pedido.fechaPedido).toLocaleString("es-AR")}
                      </IonCol>
                      <IonCol>
                        <IonButton
                          size="small"
                          onClick={() => {
                            setPedidoSeleccionado(pedido);
                            setCodigoSeguimiento("");
                          }}
                        >
                          Procesar
                        </IonButton>
                      </IonCol>
                    </IonRow>
                  ))}
                </IonGrid>
              </div>
            </IonCol>
          </IonRow>
          {pedidoSeleccionado && (
            <IonRow>
              <IonCol size="12">
                <div className="envios-formulario">
                  <IonLabel>
                    Código de Seguimiento para el pedido{" "}
                    {pedidoSeleccionado.numeroPedido}:
                  </IonLabel>
                  <IonInput
                    value={codigoSeguimiento}
                    placeholder="Ej: LP123456789AR"
                    onIonChange={(e) => setCodigoSeguimiento(e.detail.value!)}
                  />
                  <IonButton
                    expand="block"
                    onClick={handleDespachar}
                    className="despachar-btn"
                  >
                    Marcar como Despachado
                  </IonButton>
                  <IonButton
                    expand="block"
                    fill="clear"
                    color="medium"
                    onClick={() => setPedidoSeleccionado(null)}
                  >
                    Cancelar
                  </IonButton>
                </div>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          message={alertMsg}
          buttons={[{ text: "Aceptar", handler: () => setShowAlert(false) }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Envios;
