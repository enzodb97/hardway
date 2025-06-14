import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { pencil, trash } from "ionicons/icons";

const Indumentaria: React.FC = () => {
  const history = useHistory();
  const [indumentaria, setIndumentaria] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  // Cargar indumentaria
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

  // Eliminar prenda
  const handleEliminar = async (id: string) => {
    console.log("Eliminando prenda con código:", id);
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

  // Filtro de búsqueda
  const normalizar = (str: any) =>
    String(str ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const prendasFiltradas = indumentaria.filter(
    (item) =>
      normalizar(item.descripcionIndumentaria).includes(normalizar(busqueda)) ||
      normalizar(item.talle).includes(normalizar(busqueda)) ||
      normalizar(item.color).includes(normalizar(busqueda)) ||
      normalizar(item.codigoIndumentaria).includes(normalizar(busqueda)) ||
      (item.idIndumentaria && item.idIndumentaria.toString().includes(busqueda))
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Indumentaria</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonInput
            placeholder="Buscar por descripción, código, color o talle"
            value={busqueda}
            onIonChange={(e) => setBusqueda(e.detail.value!)}
            clearInput
          />
          <IonButton
            slot="end"
            onClick={() => history.push("/alta-indumentaria")}
          >
            Nueva Prenda
          </IonButton>
        </IonItem>
        <IonGrid>
          <IonRow>
            <IonCol>
              <strong>Código</strong>
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
              <strong>Estado</strong>
            </IonCol>
            <IonCol>
              <strong>Stock</strong>
            </IonCol>
            <IonCol>
              <strong>Acciones</strong>
            </IonCol>
          </IonRow>
          {prendasFiltradas.map((item) => (
            <IonRow key={item.codigoIndumentaria}>
              <IonCol>{item.codigoIndumentaria}</IonCol>
              <IonCol>{item.color}</IonCol>
              <IonCol>{item.nombreTela}</IonCol>
              <IonCol>{item.talle}</IonCol>
              <IonCol>{item.categoria}</IonCol>
              <IonCol>{item.precio}</IonCol>
              <IonCol>{item.estado}</IonCol>
              <IonCol>{item.cantidadIndumentaria}</IonCol>
              <IonCol>
                <IonButton
                  fill="clear"
                  onClick={() =>
                    history.push(`/alta-indumentaria/${item.codigoIndumentaria}`)
                  }
                >
                  <IonIcon icon={pencil} color="primary" />
                </IonButton>
                <IonButton
                  fill="clear"
                  color="danger"
                  onClick={() => handleEliminar(item.codigoIndumentaria)}
                >
                  <IonIcon icon={trash} />
                </IonButton>
              </IonCol>
            </IonRow>
          ))}
        </IonGrid>
        <IonAlert
          isOpen={showAlert}
          message={alertMsg}
          buttons={["Aceptar"]}
          onDidDismiss={() => setShowAlert(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Indumentaria;
