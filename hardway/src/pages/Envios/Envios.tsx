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
  IonModal,
} from "@ionic/react";
import "./Envios.css";

const Envios: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoEnvio[]>([]);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<PedidoEnvio | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 8;
  const totalPaginas = Math.ceil(pedidos.length / porPagina);
  const pedidosPaginados = pedidos.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

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
          <IonRow className="envios-contador-row">
            <IonCol size="12" className="envios-contador-col">
              <span className="envios-total-badge">
                Total pendientes: {pedidos.length}
              </span>
            </IonCol>
          </IonRow>
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
                      <strong>Dirección de Envío</strong>
                    </IonCol>
                    <IonCol>
                      <strong>Total de Ítems</strong>
                    </IonCol>
                    <IonCol>
                      <strong>Fecha</strong>
                    </IonCol>
                    <IonCol>
                      <strong>Acción</strong>
                    </IonCol>
                  </IonRow>
                  {pedidosPaginados.map((pedido) => (
                    <IonRow key={pedido.numeroPedido} className="table-row">
                      <IonCol>{pedido.numeroPedido}</IonCol>
                      <IonCol>
                        {pedido.nombre} {pedido.apellido}
                      </IonCol>
                      <IonCol>{pedido.cliente_email}</IonCol>
                      <IonCol>{pedido.direccion_envio}</IonCol>
                      <IonCol>{pedido.total_items}</IonCol>
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
                          disabled={!!pedido.codigoSeguimiento}
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
          {/* Paginación */}
          {totalPaginas > 1 && (
            <IonRow className="envios-paginacion-row">
              <IonCol size="12" className="envios-paginacion-col">
                <IonButton
                  size="small"
                  disabled={pagina === 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </IonButton>
                <span className="envios-paginacion-text">
                  Página {pagina} de {totalPaginas}
                </span>
                <span>|</span>
                <span className="envios-paginacion-info">
                  Mostrando{" "}
                  {pedidos.length === 0 ? 0 : (pagina - 1) * porPagina + 1}-
                  {Math.min(pagina * porPagina, pedidos.length)} de{" "}
                  {pedidos.length}
                </span>
                <IonButton
                  size="small"
                  disabled={pagina === totalPaginas}
                  onClick={() =>
                    setPagina((p) => Math.min(totalPaginas, p + 1))
                  }
                >
                  Siguiente
                </IonButton>
              </IonCol>
            </IonRow>
          )}
          <IonModal
            isOpen={!!pedidoSeleccionado}
            onDidDismiss={() => setPedidoSeleccionado(null)}
            className="envios-modal"
          >
            <div className="envios-formulario-modal">
              <IonLabel>
                Código de Seguimiento para el pedido{" "}
                {pedidoSeleccionado?.numeroPedido}:
              </IonLabel>
              <IonInput
                value={codigoSeguimiento}
                placeholder="Ej: LP123456789AR"
                onIonChange={(e) => setCodigoSeguimiento(e.detail.value!)}
                disabled={!!pedidoSeleccionado?.codigoSeguimiento}
              />
              <IonButton
                expand="block"
                onClick={handleDespachar}
                className="despachar-btn"
                disabled={!!pedidoSeleccionado?.codigoSeguimiento}
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
          </IonModal>
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
