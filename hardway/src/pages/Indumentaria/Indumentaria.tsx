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
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonFooter,
  IonText,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { pencil, trash } from "ionicons/icons";
import {
  obtenerIndumentariaPaginada,
  IndumentariaItem,
} from "../../utils/indumentariaUtils";
import "./Indumentaria.css";

const PAGE_SIZE = 10;

const Indumentaria: React.FC = () => {
  const history = useHistory();
  const [prendas, setPrendas] = useState<IndumentariaItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const cargarIndumentaria = async () => {
    setLoading(true);
    try {
      const data = await obtenerIndumentariaPaginada(page, PAGE_SIZE, busqueda);
      setPrendas(Array.isArray(data.prendas) ? data.prendas : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } catch (error) {
      setPrendas([]); // fallback seguro
      setTotal(0);
      setAlertMsg("Error al cargar indumentaria.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarIndumentaria();
    // eslint-disable-next-line
  }, [page, busqueda]);

  // Eliminar prenda
  const handleEliminar = async (id: string) => {
    if (window.confirm("¿Seguro que desea eliminar esta prenda?")) {
      try {
        await fetch(`/api/indumentaria/${id}`, { method: "DELETE" });
        cargarIndumentaria();
      } catch (error) {
        setAlertMsg("Error al eliminar prenda.");
        setShowAlert(true);
      }
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <IonPage className="indumentaria-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Indumentaria</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="indumentaria-page">
        <IonItem>
          <IonInput
            placeholder="Buscar por descripción, código, color o talle"
            value={busqueda}
            onIonChange={(e) => {
              setPage(1);
              setBusqueda(e.detail.value!);
            }}
            clearInput
          />
          <IonButton
            slot="end"
            onClick={() => history.push("/alta-indumentaria")}
          >
            Nueva Prenda
          </IonButton>
        </IonItem>

        <IonGrid className="tabla-indumentaria">
          <br />
          <IonText className="ion-padding">
            Total de prendas: <b>{total}</b>
          </IonText>
          <br />
          <br />
          <IonRow>
            <IonCol>
              <strong>Código</strong>
            </IonCol>
            <IonCol>
              <strong>Nombre</strong>
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
          {(prendas || []).map((item) => (
            <IonRow key={item.codigoIndumentaria}>
              <IonCol>{item.codigoIndumentaria}</IonCol>
              <IonCol>{item.nombre}</IonCol>
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
                    history.push(
                      `/alta-indumentaria/${item.codigoIndumentaria}`
                    )
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
        {/* Paginación */}
        <IonFooter className="ion-padding ion-text-center">
          <IonButton
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </IonButton>
          <IonText className="ion-padding-horizontal">
            Página {page} de {totalPages}
          </IonText>
          <IonButton
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </IonButton>
        </IonFooter>
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
