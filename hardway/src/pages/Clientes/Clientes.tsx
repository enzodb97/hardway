import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { add, pencil, trash } from "ionicons/icons";
import { useState } from "react";
import { useClientes } from "../../context/ClientesContext";
import "./Clientes.css";

const Clientes: React.FC = () => {
  const { clientes, eliminarCliente } = useClientes();
  const [busqueda, setBusqueda] = useState("");

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.numeroCliente.includes(busqueda)
  );

  const handleEliminar = (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este cliente?")) {
      eliminarCliente(id);
    }
  };

  return (
    <IonPage className="clientes-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Clientes</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/alta-cliente" routerDirection="forward">
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="clientes-content">
        <div className="clientes-container">
          <IonSearchbar
            className="clientes-search"
            value={busqueda}
            onIonChange={(e) => setBusqueda(e.detail.value!)}
            placeholder="Buscar clientes..."
          />

          <IonGrid className="clientes-table">
            <IonRow className="clientes-header">
              <IonCol>Nombre</IonCol>
              <IonCol>Email</IonCol>
              <IonCol>Celular</IonCol>
              <IonCol>N° Cliente</IonCol>
              <IonCol>Localidad</IonCol>
              <IonCol>Acciones</IonCol>
            </IonRow>

            {clientesFiltrados.map((cliente) => (
              <IonRow key={cliente.id} className="clientes-row">
                <IonCol>{cliente.nombre}</IonCol>
                <IonCol>{cliente.email}</IonCol>
                <IonCol>{cliente.celular}</IonCol>
                <IonCol>{cliente.numeroCliente}</IonCol>
                <IonCol>{cliente.localidad}</IonCol>
                <IonCol>
                  <div className="action-buttons">
                    <IonButton
                      fill="clear"
                      routerLink={`/alta-cliente/${cliente.id}`}
                      className="edit-btn"
                    >
                      <IonIcon slot="icon-only" icon={pencil} color="primary" />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      onClick={() => handleEliminar(cliente.id)}
                      className="delete-btn"
                    >
                      <IonIcon slot="icon-only" icon={trash} color="danger" />
                    </IonButton>
                  </div>
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};
export default Clientes;
