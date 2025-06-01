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
  IonInput,
  IonMenuButton,
} from "@ionic/react";
import { pencil, trash } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import axios from "axios";

const Indumentaria: React.FC = () => {
  const history = useHistory();
  const [indumentaria, setIndumentaria] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const cargarIndumentaria = async () => {
    try {
      const res = await axios.get("/api/indumentaria");
      setIndumentaria(res.data);
    } catch (error) {
      setAlertMsg("Error al cargar indumentaria.");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    cargarIndumentaria();
  }, []);

  const handleEliminar = async (id: number) => {
    if (window.confirm("¿Seguro que desea eliminar esta prenda?")) {
      try {
        await axios.delete(`/api/indumentaria/${id}`);
        await cargarIndumentaria();
      } catch (error) {
        setAlertMsg("Error al eliminar prenda.");
        setShowAlert(true);
      }
    }
  };

  // Búsqueda insensible a tildes
  const normalizar = (str: string | undefined) =>
    (str ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const prendasFiltradas = indumentaria.filter(
    (item) =>
      normalizar(item.descripcionIndumentaria).includes(normalizar(busqueda)) ||
      normalizar(item.nroTalle).includes(normalizar(busqueda)) ||
      normalizar(item.color).includes(normalizar(busqueda)) ||
      normalizar(item.codigoIndumentaria).includes(normalizar(busqueda)) || // <-- Agregado
      (item.idIndumentaria && item.idIndumentaria.toString().includes(busqueda))
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Indumentaria</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonButton
          expand="block"
          onClick={() => history.push("/alta-indumentaria")}
        >
          Nueva Prenda
        </IonButton>
        <IonInput
          placeholder="Buscar por nombre, talle, color o ID"
          value={busqueda}
          onIonChange={(e) => setBusqueda(e.detail.value!)}
          clearInput
        />
        <IonGrid>
          <IonRow>
            <IonCol>
              <strong>ID</strong>
            </IonCol>
            <IonCol>
              <strong>Código</strong>
            </IonCol>
            <IonCol>
              <strong>Descripción</strong>
            </IonCol>
            <IonCol>
              <strong>Color</strong>
            </IonCol>
            <IonCol>
              <strong>Tela</strong>
            </IonCol>
            <IonCol>
              <strong>Talle</strong>
            </IonCol>
            <IonCol>
              <strong>Categoría</strong>
            </IonCol>
            <IonCol>
              <strong>Precio</strong>
            </IonCol>
            <IonCol>
              <strong>Cantidad</strong>
            </IonCol>
            <IonCol>
              <strong>Acciones</strong>
            </IonCol>
          </IonRow>
          {prendasFiltradas.map((item) => (
            <IonRow key={item.idIndumentaria}>
              <IonCol>{item.idIndumentaria}</IonCol>
              <IonCol>{item.codigoIndumentaria}</IonCol>
              <IonCol>{item.descripcionIndumentaria}</IonCol>
              <IonCol>{item.color}</IonCol>
              <IonCol>{item.nombreTela}</IonCol>
              <IonCol>{item.nroTalle}</IonCol>
              <IonCol>{item.categoria}</IonCol>
              <IonCol>{item.precioVenta}</IonCol>
              <IonCol>{item.cantidadIndumentaria}</IonCol>
              <IonCol>
                <IonButton
                  fill="clear"
                  onClick={() => history.push(`/alta-indumentaria/${item.idIndumentaria}`)}
                >
                  <IonIcon icon={pencil} color="primary" />
                </IonButton>
                <IonButton fill="clear" onClick={() => handleEliminar(item.idIndumentaria)}>
                  <IonIcon icon={trash} color="danger" />
                </IonButton>
              </IonCol>
            </IonRow>
          ))}
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

export default Indumentaria;
