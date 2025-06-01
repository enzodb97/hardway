// src/pages/Pedidos/AltaPedido.tsx
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
  IonMenuButton,
} from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { crearPedido, editarPedido } from "../../utils/pedidosUtils";
import axios from "axios";
import "./AltaPedido.css";

const AltaPedido: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const [form, setForm] = useState({
    descripcion: "",
    fecha: "",
    estado: "En Curso",
    clienteId: "",
    clienteNombre: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const esEdicion = Boolean(id);

  // Cargar datos si es edición
  useEffect(() => {
    if (esEdicion && id) {
      const cargarPedido = async () => {
        try {
          const res = await axios.get(`/api/pedidos/${id}`);
          setForm({
            descripcion: res.data.descripcion,
            fecha: res.data.fecha,
            estado: res.data.estado,
            clienteId: res.data.clienteId?.toString() || "",
            clienteNombre: res.data.Cliente?.nombre || "",
          });
        } catch (error) {
          setAlertMsg("Error al cargar el pedido.");
          setShowAlert(true);
        }
      };
      cargarPedido();
    } else {
      setForm((f) => ({
        ...f,
        fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
        estado: "En Curso",
        clienteNombre: "",
      }));
    }
  }, [id, esEdicion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (esEdicion && id) {
        await editarPedido(Number(id), form);
      } else {
        await crearPedido({ ...form, clienteId: Number(form.clienteId) });
      }
      history.push("/pedidos");
    } catch (error) {
      setAlertMsg("Error al guardar el pedido.");
      setShowAlert(true);
    }
  };

  return (
    <IonPage className="alta-pedido-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>{esEdicion ? "Editar Pedido" : "Nuevo Pedido"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="alta-pedido-content">
        <form className="alta-pedido-form" onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="floating">Descripción</IonLabel>
            <IonInput
              value={form.descripcion}
              onIonChange={(e) =>
                setForm({ ...form, descripcion: e.detail.value! })
              }
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Fecha y hora</IonLabel>
            <IonInput value={form.fecha} readonly />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Cliente ID</IonLabel>
            <IonInput value={form.clienteId} readonly />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Cliente</IonLabel>
            <IonInput value={form.clienteNombre} readonly />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Estado</IonLabel>
            <IonInput value={form.estado} readonly />
          </IonItem>
          <IonButton expand="block" type="submit">
            {esEdicion ? "Guardar Cambios" : "Guardar Pedido"}
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

export default AltaPedido;
