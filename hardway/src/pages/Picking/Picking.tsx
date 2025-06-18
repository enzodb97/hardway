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
} from "@ionic/react";
import { checkmarkCircleOutline, closeOutline } from "ionicons/icons";
import { useAuth } from "../../context/AuthContext";
import {
  cargarTareasPicking,
  verPickingList,
  completarTareaPicking,
} from "../../utils/pickingUtils";
import "./Picking.css";

const Picking: React.FC = () => {
  const { username, rol } = useAuth();
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
      const data = await cargarTareasPicking(rol || "", username || "");
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
      const data = await verPickingList(numeroPedido);
      setPickingList(data);
      setShowPickingList(true);
    } catch (err) {
      setAlertMsg("Error al obtener picking list");
      setShowAlert(true);
    }
  };

  const handleCompletarTarea = async (
    idAsignacion: number,
    numeroPedido: string
  ) => {
    try {
      await completarTareaPicking(idAsignacion, numeroPedido);
      setAlertMsg("Tarea completada y pedido actualizado");
      setShowAlert(true);
      cargarTareas();
      setShowPickingList(false);
    } catch (err) {
      setAlertMsg("Error al completar tarea");
      setShowAlert(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis Tareas de Picking</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
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
              handler: () =>
                handleCompletarTarea(
                  tareaSeleccionada.idAsignacion,
                  tareaSeleccionada.numeroPedido
                ),
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
