import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonAlert,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonModal,
  IonInput,
} from "@ionic/react";
import { checkmarkCircleOutline, closeOutline } from "ionicons/icons";
import { useAuth } from "../../context/AuthContext";
import {
  cargarTareasPicking,
  verPickingList,
  completarTareaPicking,
  exportarPedidoPDF,
} from "../../utils/pickingUtils";
import "./Picking.css";

const Picking: React.FC = () => {
  const { username, rol, legajoPicker } = useAuth();
  const [tareas, setTareas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [tareaSeleccionada, setTareaSeleccionada] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pickingList, setPickingList] = useState<any[]>([]);
  const [showPickingList, setShowPickingList] = useState(false);

  const cargarTareas = async () => {
    setLoading(true);
    try {
      // Usar legajoPicker si el rol es Picker, sino username (para admin no importa)
      const pickerId = rol === "Picker" ? legajoPicker : username;
      const data = await cargarTareasPicking(rol || "", pickerId || "");
      setTareas(data);
    } catch (err) {
      setAlertMsg("Error al cargar tareas");
      setShowAlert(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarTareas();
    // eslint-disable-next-line
  }, []);

  const handleVerPickingList = async (numeroPedido: string) => {
    try {
      const response = await verPickingList(numeroPedido);

      // Log para diagnóstico de la estructura de datos
      console.log("Respuesta del endpoint picking list:", response);
      if (response?.pedido?.DetallePedidos?.length > 0) {
        console.log("Primer item detalle:", response.pedido.DetallePedidos[0]);
        console.log(
          "Indumentarium del primer item:",
          response.pedido.DetallePedidos[0].Indumentarium
        );
        console.log(
          "DetalleIndumentarium:",
          response.pedido.DetallePedidos[0].Indumentarium?.DetalleIndumentarium
        );
        console.log(
          "Stock del primer item:",
          response.pedido.DetallePedidos[0].Indumentarium?.Stock
        );
        console.log(
          "Rack del primer item:",
          response.pedido.DetallePedidos[0].Indumentarium?.Stock?.Rack
        );
      }

      // Transformamos los datos para tener un formato compatible con el componente
      if (response && response.pedido && response.pedido.DetallePedidos) {
        // Convertir los detalles del pedido al formato esperado por el componente
        const itemsFormateados = response.pedido.DetallePedidos.map(
          (detalle: any) => {
            // Extraemos los datos anidados
            const indumentaria = detalle.Indumentarium || {};
            const detalleInd = indumentaria.DetalleIndumentarium || {};
            const nombreInd = detalleInd.NombreIndumentarium || {};
            const color = detalleInd.Color || {};
            const talle = detalleInd.Talle || {};
            const categoria = detalleInd.CategoriaIndumentarium || {};

            return {
              nombre_producto: nombreInd.nombre || "Sin nombre",
              codigoIndumentaria: detalle.codigoIndumentaria,
              referencia: indumentaria.codigoIndumentaria,
              cantidad: detalle.cantidad,
              rack:
                indumentaria.Stock?.Rack?.numeroRack ||
                indumentaria.Stock?.idRack?.toString() ||
                "Sin asignar",
              categoria: categoria.categoria || "Sin categoría",
              color: color.color || "N/A",
              talle: talle.talle || "N/A",
            };
          }
        );

        setPickingList(itemsFormateados);
      } else {
        // Si no hay datos o el formato es inesperado, inicializamos como array vacío
        setPickingList([]);
      }

      setShowPickingList(true);
    } catch (err) {
      console.error("Error detallado:", err);
      setAlertMsg("Error al obtener picking list");
      setShowAlert(true);
    }
  };

  const handleCompletarTarea = async (
    idAsignacion: number,
    numeroPedido: string
  ) => {
    try {
      console.log(
        "Enviando completar tarea con idAsignacion:",
        idAsignacion,
        "tipo:",
        typeof idAsignacion
      );
      if (!idAsignacion && rol === "Administrador") {
        console.error(
          "Error: Se requiere idAsignacion para completar tarea como admin"
        );
        setAlertMsg(
          "Error: Se requiere ID de asignación para completar tarea como administrador"
        );
        setShowAlert(true);
        return;
      }

      const resultado = await completarTareaPicking(idAsignacion, numeroPedido);
      setAlertMsg(
        `Tarea completada. El pedido ahora está en estado "${
          resultado.estado || "Pendiente de Pago"
        }"`
      );
      setShowAlert(true);
      cargarTareas();
      setShowPickingList(false);
    } catch (err) {
      console.error("Error en handleCompletarTarea:", err);
      setAlertMsg(
        "Error al completar tarea. Verifica la consola para más detalles."
      );
      setShowAlert(true);
    }
  };

  return (
    <IonPage className="picking-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis Tareas de Picking</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="picking-page">
        {loading ? (
          <IonSpinner name="crescent" style={{ margin: 32 }} />
        ) : (
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonList>
                  {tareas.length === 0 && (
                    <IonItem>No tienes tareas pendientes.</IonItem>
                  )}
                  {tareas.map((tarea) => (
                    <IonItem key={tarea.idAsignacion}>
                      <IonLabel>
                        {rol === "Administrador" && tarea.pickerAsignado && (
                          <span className="picking-admin-picker">
                            Picker asignado: {tarea.pickerAsignado}
                          </span>
                        )}
                        <span className="picking-pedido-label">
                          Pedido: {tarea.numeroPedido}
                        </span>
                        <br />
                        <span className="picking-fecha-label">
                          Fecha asignación:{" "}
                          {new Date(tarea.fechaAsignacion).toLocaleString(
                            "es-AR"
                          )}
                        </span>
                      </IonLabel>
                      <IonButton
                        slot="end"
                        color="warning"
                        className="picking-action-btn"
                        onClick={async () => {
                          // Obtener productos del pedido para exportar
                          try {
                            const response = await verPickingList(
                              tarea.numeroPedido
                            );
                            // Mapear productos para el PDF
                            const productos = (
                              response?.pedido?.DetallePedidos || []
                            ).map((detalle: any) => {
                              const indumentaria = detalle.Indumentarium || {};
                              const detalleInd =
                                indumentaria.DetalleIndumentarium || {};
                              const nombreInd =
                                detalleInd.NombreIndumentarium || {};
                              const color = detalleInd.Color || {};
                              const talle = detalleInd.Talle || {};
                              const categoria =
                                detalleInd.CategoriaIndumentarium || {};
                              return {
                                id:
                                  indumentaria.idIndumentaria ||
                                  detalle.codigoIndumentaria ||
                                  "-",
                                nombre: nombreInd.nombre || "Sin nombre",
                                cantidad: detalle.cantidad || 0,
                                rack:
                                  indumentaria.Stock?.Rack?.numeroRack ||
                                  indumentaria.Stock?.idRack?.toString() ||
                                  "Sin asignar",
                                categoria:
                                  categoria.categoria || "Sin categoría",
                                color: color.color || "N/A",
                                talle: talle.talle || "N/A",
                              };
                            });
                            exportarPedidoPDF({
                              id: tarea.numeroPedido,
                              productos,
                            });
                          } catch (err) {
                            setAlertMsg("Error al exportar el pedido a PDF");
                            setShowAlert(true);
                          }
                        }}
                        style={{ marginRight: 8 }}
                      >
                        Exportar PDF
                      </IonButton>
                      <IonButton
                        slot="end"
                        color="primary"
                        className="picking-action-btn"
                        onClick={() => handleVerPickingList(tarea.numeroPedido)}
                      >
                        Ver Picking List
                      </IonButton>
                      <IonButton
                        slot="end"
                        color="success"
                        className="picking-action-btn"
                        onClick={() => {
                          console.log("Seleccionando tarea:", tarea);
                          console.log(
                            "ID Asignación:",
                            tarea.idAsignacion,
                            "tipo:",
                            typeof tarea.idAsignacion
                          );
                          setTareaSeleccionada(tarea);
                          setShowConfirm(true);
                        }}
                      >
                        <IonIcon icon={checkmarkCircleOutline} /> Completar
                      </IonButton>
                    </IonItem>
                  ))}
                </IonList>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}

        {/* Modal para ver picking list */}
        {/* Modal Picking List con Ionic/React */}
        <IonModal
          isOpen={showPickingList}
          onDidDismiss={() => setShowPickingList(false)}
          className="picking-list-modal"
        >
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Picking List</IonTitle>
              <IonButton
                slot="end"
                fill="clear"
                onClick={() => setShowPickingList(false)}
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              {pickingList.length === 0 && (
                <IonItem>No hay productos para este pedido.</IonItem>
              )}
              {pickingList.map((item: any, idx: number) => (
                <IonItem key={idx} lines="full">
                  <IonLabel className="ion-text-wrap">
                    <div>
                      <b>Nombre:</b> {item.nombre_producto ?? "-"}
                    </div>
                    <div>
                      <b>Referencia:</b>{" "}
                      {item.referencia || item.codigoIndumentaria || "-"}
                    </div>
                    <div>
                      <b>Cantidad:</b> {item.cantidad ?? "-"}
                    </div>
                    <div>
                      <b>Rack:</b> {item.rack ?? "Sin asignar"}
                    </div>
                    <div>
                      <b>Categoría:</b> {item.categoria ?? "-"}
                    </div>
                    <div>
                      <b>Color:</b> {item.color ?? "-"}
                    </div>
                    <div>
                      <b>Talle:</b> {item.talle ?? "-"}
                    </div>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
            <IonButton
              expand="block"
              color="medium"
              onClick={() => setShowPickingList(false)}
              style={{ margin: 16 }}
            >
              Cerrar
            </IonButton>
          </IonContent>
        </IonModal>
        {/* Confirmar completar tarea */}
        <IonAlert
          isOpen={showConfirm}
          onDidDismiss={() => setShowConfirm(false)}
          header="¿Finalizar tarea?"
          message="¿Deseas marcar esta tarea como completada? Esto actualizará el estado del pedido."
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
            },
            {
              text: "Completar",
              handler: () => {
                console.log(
                  "Tarea seleccionada al completar:",
                  tareaSeleccionada
                );
                if (!tareaSeleccionada || !tareaSeleccionada.idAsignacion) {
                  console.error(
                    "Error: No hay idAsignacion en la tarea seleccionada"
                  );
                  setAlertMsg(
                    "Error: No se encontró ID de asignación para esta tarea"
                  );
                  setShowAlert(true);
                  return false;
                }
                return handleCompletarTarea(
                  tareaSeleccionada.idAsignacion,
                  tareaSeleccionada.numeroPedido
                );
              },
            },
          ]}
        />
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

export default Picking;
