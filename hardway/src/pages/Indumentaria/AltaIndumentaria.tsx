import React, { useEffect, useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonInput, IonItem, IonLabel, IonAlert, IonMenuButton
} from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";

const AltaIndumentaria: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const [form, setForm] = useState({
    nombre: "",
    talle: "",
    color: "",
    cantidad: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const esEdicion = Boolean(id);

  useEffect(() => {
    if (esEdicion && id) {
      const cargarPrenda = async () => {
        try {
          const res = await axios.get(`/api/indumentaria/${id}`);
          setForm({
            nombre: res.data.nombre,
            talle: res.data.talle,
            color: res.data.color,
            cantidad: res.data.cantidad.toString(),
          });
        } catch (error) {
          setAlertMsg("Error al cargar la prenda.");
          setShowAlert(true);
        }
      };
      cargarPrenda();
    }
  }, [id, esEdicion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (esEdicion && id) {
        await axios.put(`/api/indumentaria/${id}`, {
          ...form,
          cantidad: Number(form.cantidad),
        });
      } else {
        await axios.post("/api/indumentaria", {
          ...form,
          cantidad: Number(form.cantidad),
        });
      }
      history.push("/indumentaria");
    } catch (error) {
      setAlertMsg("Error al guardar la prenda.");
      setShowAlert(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>{esEdicion ? "Editar Prenda" : "Nueva Prenda"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="floating">Nombre</IonLabel>
            <IonInput
              value={form.nombre}
              onIonChange={(e) => setForm({ ...form, nombre: e.detail.value! })}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Talle</IonLabel>
            <IonInput
              value={form.talle}
              onIonChange={(e) => setForm({ ...form, talle: e.detail.value! })}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Color</IonLabel>
            <IonInput
              value={form.color}
              onIonChange={(e) => setForm({ ...form, color: e.detail.value! })}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Cantidad</IonLabel>
            <IonInput
              type="number"
              value={form.cantidad}
              onIonChange={(e) => setForm({ ...form, cantidad: e.detail.value! })}
              required
            />
          </IonItem>
          <IonButton expand="block" type="submit">
            {esEdicion ? "Guardar Cambios" : "Registrar Prenda"}
          </IonButton>
        </form>
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

export default AltaIndumentaria;