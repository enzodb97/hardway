// src/pages/Pedidos/AltaPedido.tsx
import React, { useState } from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonAlert } from "@ionic/react";
import { useClientes } from "../../context/ClientesContext";
import { crearPedido } from "../../utils/pedidosUtils";
import { useHistory } from "react-router-dom";

const AltaPedido: React.FC = () => {
  const { clientes } = useClientes();
  const history = useHistory();
  const [form, setForm] = useState({ descripcion: "", fecha: "", estado: "pendiente", clienteId: "" });
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) {
      setShowAlert(true);
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
            <IonInput value={form.descripcion} onIonChange={e => setForm({ ...form, descripcion: e.detail.value! })} required />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Fecha</IonLabel>
            <IonInput type="date" value={form.fecha} onIonChange={e => setForm({ ...form, fecha: e.detail.value! })} required />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Estado</IonLabel>
            <IonSelect value={form.estado} onIonChange={e => setForm({ ...form, estado: e.detail.value! })}>
              <IonSelectOption value="pendiente">Pendiente</IonSelectOption>
              <IonSelectOption value="entregado">Entregado</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Cliente</IonLabel>
            <IonSelect value={form.clienteId} onIonChange={e => setForm({ ...form, clienteId: e.detail.value! })} required>
              {clientes.map(c => (
                <IonSelectOption key={c.id} value={c.id}>{c.nombre} ({c.numeroDocumento})</IonSelectOption>
              ))}
              <IonSelectOption value="">Registrar nuevo cliente</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonButton expand="block" type="submit">Guardar Pedido</IonButton>
        </form>
        <IonAlert isOpen={showAlert} message="Debe seleccionar un cliente o registrar uno nuevo." buttons={["OK"]} onDidDismiss={() => setShowAlert(false)} />
      </IonContent>
    </IonPage>
  );
};

export default AltaPedido;