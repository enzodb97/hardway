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
  IonModal,
  IonList,
} from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { crearPedido, editarPedido } from "../../utils/pedidosUtils";
import axios from "axios";
import "./AltaPedido.css";
import { useClientes } from "../../context/ClientesContext";

const AltaPedido: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const { clientes } = useClientes();
  const [form, setForm] = useState({
    descripcion: "",
    fecha: "",
    estado: "En Curso",
    clienteId: "",
    clienteNombre: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState("");
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
      // Lógica para alta: formulario vacío y fecha actual
      setForm({
        descripcion: "",
        fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
        estado: "En Curso",
        clienteId: "",
        clienteNombre: "",
      });
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

  const clientesFiltrados = clientes.filter((c) => {
    const normalizar = (str: string) =>
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const filtroNorm = normalizar(filtroCliente);
    return (
      normalizar(c.nombre).includes(filtroNorm) ||
      (c.numeroDocumento && c.numeroDocumento.toString().includes(filtroNorm))
    );
  });

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
          <IonItem button onClick={() => setShowClienteModal(true)}>
            <IonLabel position="floating">Cliente</IonLabel>
            <IonInput
              value={form.clienteNombre}
              placeholder="Seleccionar cliente"
              readonly
              required
            />
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
        <IonModal
          isOpen={showClienteModal}
          onDidDismiss={() => setShowClienteModal(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Seleccionar Cliente</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonItem>
              <IonInput
                placeholder="Buscar por nombre o DNI"
                value={filtroCliente}
                onIonChange={(e) => setFiltroCliente(e.detail.value!)}
                clearInput
              />
            </IonItem>
            <IonItem
              button
              onClick={() => {
                setShowClienteModal(false);
                history.push("/alta-cliente");
              }}
            >
              <IonLabel>Registrar nuevo cliente</IonLabel>
            </IonItem>
            <IonList>
              {clientesFiltrados.map((c) => (
                <IonItem
                  key={c.id}
                  button
                  onClick={() => {
                    setForm({
                      ...form,
                      clienteId: c.id.toString(),
                      clienteNombre: c.nombre,
                    });
                    setShowClienteModal(false);
                  }}
                >
                  <IonLabel>
                    {c.nombre} ({c.numeroDocumento})
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default AltaPedido;
