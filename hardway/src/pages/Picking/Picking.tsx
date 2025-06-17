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
} from "@ionic/react";
import { checkmarkCircleOutline } from "ionicons/icons";
import { useAuth } from "../../context/AuthContext";

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

  // Obtener legajo del picker (ajustable: username o legajo)
  // Si eres admin, no filtra por legajo
  // Si eres picker, usa username como legajo (ajusta si guardas el legajo en contexto)
  const legajo = rol === "Administrador" ? "" : username;

  // Cargar tareas pendientes
  const cargarTareas = async () => {
    setLoading(true);
    try {
      let url = "/api/picking/tareas";
      if (rol === "Administrador") {
        url += "?rol=Administrador";
      } else {
        url += `?legajo=${username}`;
      }
      const res = await fetch(url);
      const data = await res.json();
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

  // Ver picking list de una tarea
  const verPickingList = async (numeroPedido: string) => {
    try {
      const res = await fetch(
        `/api/picking/lista?numeroPedido=${numeroPedido}`
      );
      const data = await res.json();
      setPickingList(data);
      setShowPickingList(true);
    } catch (err) {
      setAlertMsg("Error al obtener picking list");
      setShowAlert(true);
    }
  };

  // Completar tarea
  const completarTarea = async (idAsignacion: number, numeroPedido: string) => {
    try {
      const res = await fetch(`/api/picking/completar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idAsignacion, numeroPedido }),
      });
      if (!res.ok) throw new Error();
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
                        <b>Pedido:</b> {tarea.numeroPedido} <br />
                        <b>Fecha asignación:</b>{" "}
                        {new Date(tarea.fechaAsignacion).toLocaleString(
                          "es-AR"
                        )}
                      </IonLabel>
                      <IonButton
                        slot="end"
                        color="primary"
                        onClick={() => verPickingList(tarea.numeroPedido)}
                      >
                        Ver Picking List
                      </IonButton>
                      <IonButton
                        slot="end"
                        color="success"
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
        {/* Modal Picking List */}
        <IonAlert
          isOpen={showPickingList}
          onDidDismiss={() => setShowPickingList(false)}
          header="Picking List"
          message={
            pickingList.length > 0
              ? pickingList
                  .map(
                    (item: any) =>
                      `<b>${item.nombre_producto}</b> (${item.codigoIndumentaria})<br/>Cantidad: ${item.cantidad}<br/>Rack: ${item.numeroRack}<br/>Color: ${item.color} - Talle: ${item.talle}`
                  )
                  .join("<hr/>")
              : "No hay productos para este pedido."
          }
          buttons={[{ text: "Cerrar", role: "cancel" }]}
        />
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
                completarTarea(
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
