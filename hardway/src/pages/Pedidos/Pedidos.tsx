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
  IonIcon,
  IonAlert,
} from "@ionic/react";
import {
  cargarPedidos,
  filtrarPedidos,
  Pedido,
  eliminarPedido,
} from "../../utils/pedidosUtils";
import { useHistory } from "react-router-dom";
import { pencil, trash, documentText } from "ionicons/icons";
import "./Pedidos.css";

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const history = useHistory();

  useEffect(() => {
    cargarPedidos().then(setPedidos);
  }, []);

  // Ordena los pedidos por fecha descendente (los más recientes primero)
  const pedidosFiltrados = filtrarPedidos(pedidos, busqueda).sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  // Mostrar solo 5 si el buscador está vacío, si no, mostrar todos los resultados
  const pedidosAMostrar =
    busqueda.trim() === "" ? pedidosFiltrados.slice(0, 5) : pedidosFiltrados;

  // Función para eliminar pedido
  const handleEliminarPedido = async (id: number) => {
    if (window.confirm("¿Seguro que desea eliminar este pedido?")) {
      try {
        await eliminarPedido(id); // Llama a tu función que elimina en la base de datos
        setPedidos((prev) => prev.filter((p) => p.id !== id));
      } catch (error: any) {
        setAlertMsg("Error al eliminar el pedido.");
        setShowAlert(true);
      }
    }
  };

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
          {/* Fila 1: Buscador */}
          <IonRow>
            <IonCol size="12">
              <div className="pedidos-buscador">
                <IonInput
                  placeholder="Buscar por cliente, fecha o ID de pedido"
                  value={busqueda}
                  onIonChange={(e) => setBusqueda(e.detail.value!)}
                  clearInput
                />
              </div>
            </IonCol>
          </IonRow>
          {/* Fila 2: Tabla */}
          <IonRow>
            <IonCol size="12">
              <div className="pedidos-table-wrapper">
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
                    <IonCol className="text-center">
                      <strong>Acciones</strong>
                    </IonCol>
                  </IonRow>
                  {pedidosAMostrar.map((pedido) => (
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
                      <IonCol className="text-center">
                        <div className="action-buttons">
                          <IonButton
                            fill="clear"
                            onClick={() => history.push(`/alta-pedido/${pedido.id}`)}
                          >
                            <IonIcon icon={pencil} color="primary" />
                          </IonButton>
                          <IonButton
                            fill="clear"
                            onClick={() => handleEliminarPedido(pedido.id)}
                            className="delete-btn"
                          >
                            <IonIcon icon={trash} color="danger" />
                          </IonButton>
                          <IonButton
                            fill="clear"
                            onClick={() =>
                              history.push(`/detalle-pedido/${pedido.id}`)
                            }
                            className="detail-btn"
                          >
                            <IonIcon icon={documentText} color="medium" />
                          </IonButton>
                        </div>
                      </IonCol>
                    </IonRow>
                  ))}
                </IonGrid>
              </div>
            </IonCol>
          </IonRow>
          {/* Fila 3: Botón */}
          <IonRow>
            <IonCol size="12">
              <IonButton routerLink="/alta-pedido" expand="block">
                Nuevo Pedido
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          message={alertMsg}
          buttons={["Aceptar"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Pedidos;
