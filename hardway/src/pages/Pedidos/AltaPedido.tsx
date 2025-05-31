// src/pages/Pedidos/AltaPedido.tsx
import React, { useState } from "react";
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
  IonSelect,
  IonSelectOption,
  IonAlert,
  IonModal,
  IonList,
} from "@ionic/react";
import { useClientes } from "../../context/ClientesContext";
import { crearPedido } from "../../utils/pedidosUtils";
import { useHistory } from "react-router-dom";

const AltaPedido: React.FC = () => {
  const { clientes } = useClientes();
  const history = useHistory();
  const [form, setForm] = useState({
    descripcion: "",
    fecha: "",
    estado: "pendiente",
    clienteId: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState("");

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(filtroCliente.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descripcion.trim() || !form.fecha || !form.clienteId) {
      setShowAlert(true);
      setAlertMsg("Todos los campos son obligatorios.");
      return;
    }
    await crearPedido({ ...form, clienteId: Number(form.clienteId) });
    history.push("/pedidos");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Nuevo Pedido</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={handleSubmit}>
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
            <IonLabel position="floating">Fecha</IonLabel>
            <IonInput
              type="date"
              value={form.fecha}
              onIonChange={(e) => setForm({ ...form, fecha: e.detail.value! })}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Estado</IonLabel>
            <IonSelect
              value={form.estado}
              onIonChange={(e) => setForm({ ...form, estado: e.detail.value! })}
            >
              <IonSelectOption value="pendiente">Pendiente</IonSelectOption>
              <IonSelectOption value="entregado">Entregado</IonSelectOption>
            </IonSelect>
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
              <IonList>
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

          <IonButton expand="block" type="submit">
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
