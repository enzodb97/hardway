import React, { useEffect, useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonInput, IonItem, IonLabel, IonAlert, IonMenuButton
} from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";

const camposIniciales = {
  codigoIndumentaria: "",
  descripcionIndumentaria: "",
  color: "",
  nombreTela: "",
  nroTalle: "",
  descripcionTalle: "",
  categoria: "",
  subCategoria: "",
  precioVenta: "",
  costoIndumentaria: "",
  cantidadIndumentaria: "",
  estado_actual: "",
  codigoDetalle: "",
  cantidadTotal: "",
};

const AltaIndumentaria: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const [form, setForm] = useState(camposIniciales);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const esEdicion = Boolean(id);

  useEffect(() => {
    if (esEdicion && id) {
      const cargarPrenda = async () => {
        try {
          const res = await axios.get(`/api/indumentaria/${id}`);
          setForm({
            codigoIndumentaria: res.data.codigoIndumentaria || "",
            descripcionIndumentaria: res.data.descripcionIndumentaria || "",
            color: res.data.color || "",
            nombreTela: res.data.nombreTela || "",
            nroTalle: res.data.nroTalle || "",
            descripcionTalle: res.data.descripcionTalle || "",
            categoria: res.data.categoria || "",
            subCategoria: res.data.subCategoria || "",
            precioVenta: res.data.precioVenta?.toString() || "",
            costoIndumentaria: res.data.costoIndumentaria?.toString() || "",
            cantidadIndumentaria: res.data.cantidadIndumentaria?.toString() || "",
            estado_actual: res.data.estado_actual?.toString() || "",
            codigoDetalle: res.data.codigoDetalle || "",
            cantidadTotal: res.data.cantidadTotal?.toString() || "",
          });
        } catch (error) {
          setAlertMsg("Error al cargar la prenda.");
          setShowAlert(true);
        }
      };
      cargarPrenda();
    } else {
      setForm(camposIniciales);
    }
  }, [id, esEdicion]);

  const handleChange = (campo: string, valor: string) => {
    setForm({ ...form, [campo]: valor });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (esEdicion && id) {
        await axios.put(`/api/indumentaria/${id}`, {
          ...form,
          precioVenta: Number(form.precioVenta),
          costoIndumentaria: Number(form.costoIndumentaria),
          cantidadIndumentaria: Number(form.cantidadIndumentaria),
          estado_actual: Number(form.estado_actual),
          cantidadTotal: Number(form.cantidadTotal),
        });
      } else {
        await axios.post("/api/indumentaria", {
          ...form,
          precioVenta: Number(form.precioVenta),
          costoIndumentaria: Number(form.costoIndumentaria),
          cantidadIndumentaria: Number(form.cantidadIndumentaria),
          estado_actual: Number(form.estado_actual),
          cantidadTotal: Number(form.cantidadTotal),
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
            <IonLabel position="floating">Código</IonLabel>
            <IonInput
              value={form.codigoIndumentaria}
              onIonChange={(e) => handleChange("codigoIndumentaria", e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Descripción</IonLabel>
            <IonInput
              value={form.descripcionIndumentaria}
              onIonChange={(e) => handleChange("descripcionIndumentaria", e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Color</IonLabel>
            <IonInput
              value={form.color}
              onIonChange={(e) => handleChange("color", e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Nombre Tela</IonLabel>
            <IonInput
              value={form.nombreTela}
              onIonChange={(e) => handleChange("nombreTela", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">N° Talle</IonLabel>
            <IonInput
              value={form.nroTalle}
              onIonChange={(e) => handleChange("nroTalle", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Descripción Talle</IonLabel>
            <IonInput
              value={form.descripcionTalle}
              onIonChange={(e) => handleChange("descripcionTalle", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Categoría</IonLabel>
            <IonInput
              value={form.categoria}
              onIonChange={(e) => handleChange("categoria", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Subcategoría</IonLabel>
            <IonInput
              value={form.subCategoria}
              onIonChange={(e) => handleChange("subCategoria", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Precio Venta</IonLabel>
            <IonInput
              type="number"
              value={form.precioVenta}
              onIonChange={(e) => handleChange("precioVenta", e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Costo Indumentaria</IonLabel>
            <IonInput
              type="number"
              value={form.costoIndumentaria}
              onIonChange={(e) => handleChange("costoIndumentaria", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Cantidad Indumentaria</IonLabel>
            <IonInput
              type="number"
              value={form.cantidadIndumentaria}
              onIonChange={(e) => handleChange("cantidadIndumentaria", e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Estado Actual</IonLabel>
            <IonInput
              type="number"
              value={form.estado_actual}
              onIonChange={(e) => handleChange("estado_actual", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Código Detalle</IonLabel>
            <IonInput
              value={form.codigoDetalle}
              onIonChange={(e) => handleChange("codigoDetalle", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Cantidad Total</IonLabel>
            <IonInput
              type="number"
              value={form.cantidadTotal}
              onIonChange={(e) => handleChange("cantidadTotal", e.detail.value!)}
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