// src/pages/Pedidos/AltaPedido.tsx
import React, { useState, useEffect } from "react";
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
  IonModal,
  IonList,
  IonMenuButton,
} from "@ionic/react";
import { useClientes } from "../../context/ClientesContext";
import {
  crearPedido,
  validarCamposPedido,
  filtrarClientesPorNombre,
  obtenerFechaHoraArgentina,
} from "../../utils/pedidosUtils";
import { useHistory } from "react-router-dom";
import "./AltaPedido.css";

const AltaPedido: React.FC = () => {
  const { clientes } = useClientes();
  const history = useHistory();
  const [form, setForm] = useState({
    descripcion: "",
    fecha: "",
    estado: "En Curso", // Estado fijo por defecto
    clienteId: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState("");

  // Al cargar el componente, setea la fecha y hora actual automáticamente
  useEffect(() => {
    setForm((f) => ({ ...f, fecha: obtenerFechaHoraArgentina() }));
  }, []);

  const clientesFiltrados = filtrarClientesPorNombre(clientes, filtroCliente);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validarCamposPedido(form);
    if (error) {
      setShowAlert(true);
      setAlertMsg(error);
      return;
    }
    // Estado siempre "En Curso" al guardar
    await crearPedido({
      ...form,
      estado: "En Curso",
      clienteId: Number(form.clienteId),
    });
    history.push("/pedidos");
  };

  return (
    <IonPage className="alta-pedido-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Nuevo Pedido</IonTitle>
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
            <IonInput value={form.fecha} readonly required />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Estado</IonLabel>
            {/* Solo muestra el estado, no editable */}
            <IonInput value="En Curso" readonly />
          </IonItem>
          <IonItem button onClick={() => setShowClienteModal(true)}>
            <IonLabel position="floating">Cliente</IonLabel>
            <IonInput
              value={
                form.clienteId === "nuevo"
                  ? "Registrar nuevo cliente"
                  : clientes.find((c) => c.id === Number(form.clienteId))
                      ?.nombre || ""
              }
              placeholder="Seleccionar cliente"
              readonly
              required
            />
          </IonItem>

          {/* Modal para seleccionar cliente con buscador */}
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
                  placeholder="Buscar cliente por nombre"
                  value={filtroCliente}
                  onIonChange={(e) => setFiltroCliente(e.detail.value!)}
                  clearInput
                />
              </IonItem>
              <IonItem
                button
                onClick={() => {
                  setForm({ ...form, clienteId: "nuevo" });
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
                      setForm({ ...form, clienteId: c.id.toString() });
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

          <IonButton className="guardar-btn" expand="block" type="submit">
            Guardar Pedido
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
