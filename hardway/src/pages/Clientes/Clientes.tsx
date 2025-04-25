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
  IonBadge,
  IonFab,
  IonFabButton,
} from "@ionic/react";
import { add, pencil, trash, print } from "ionicons/icons";
import { useState } from "react";
import { useClientes } from "../../context/ClientesContext";
import "./Clientes.css";

const Clientes: React.FC = () => {
  const { clientes, eliminarCliente } = useClientes();
  const [busqueda, setBusqueda] = useState("");
  const [mostrarListado, setMostrarListado] = useState(false);

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (cliente.email &&
        cliente.email.toLowerCase().includes(busqueda.toLowerCase())) ||
      cliente.numeroDocumento.includes(busqueda)
  );

  const totalClientes = clientes.length;

  const handleEliminar = (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este cliente?")) {
      eliminarCliente(id);
    }
  };

  const handleImprimir = () => {
    setMostrarListado(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <IonPage className="clientes-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Lista de Clientes</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/alta-cliente" routerDirection="forward">
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="clientes-content">
        <div className="clientes-container">
          <div className="controls-section">
            <IonButton
              color="tertiary"
              onClick={() => setMostrarListado(!mostrarListado)}
              className="toggle-list-btn force-orange"
            >
              {mostrarListado ? "Ocultar listado" : "Mostrar listado"}
            </IonButton>

            <IonBadge color="primary" className="total-badge">
              Registrados: {totalClientes}
            </IonBadge>
          </div>

          <IonSearchbar
            className="clientes-search"
            value={busqueda}
            onIonChange={(e) => setBusqueda(e.detail.value!)}
            placeholder="Buscar clientes..."
          />

          {mostrarListado && (
            <IonGrid className="clientes-table">
              {/* Título oculto solo para impresión */}
              <div className="print-title">
                <h2>Listado de Clientes</h2>
                <p>Fecha: {new Date().toLocaleDateString()}</p>
              </div>

              <IonRow className="table-header">
                <IonCol>
                  <strong>ID</strong>
                </IonCol>
                <IonCol>
                  <strong>Nombre</strong>
                </IonCol>
                <IonCol>
                  <strong>Documento</strong>
                </IonCol>
                <IonCol>
                  <strong>Teléfono</strong>
                </IonCol>
                <IonCol>
                  <strong>Localidad</strong>
                </IonCol>
                <IonCol>
                  <strong>Email</strong>
                </IonCol>
                <IonCol>
                  <strong>Acciones</strong>
                </IonCol>
              </IonRow>

              {clientesFiltrados.map((cliente) => (
                <IonRow key={cliente.id} className="table-row">
                  <IonCol>{cliente.id}</IonCol>
                  <IonCol>{cliente.nombre}</IonCol>
                  <IonCol>{`${cliente.tipoDocumento}: ${cliente.numeroDocumento}`}</IonCol>
                  <IonCol>{cliente.telefono}</IonCol>
                  <IonCol>{cliente.localidad}</IonCol>
                  <IonCol>{cliente.email || "-"}</IonCol>
                  <IonCol>
                    <div className="action-buttons">
                      <IonButton
                        fill="clear"
                        routerLink={`/alta-cliente/${cliente.id}`}
                        className="edit-btn"
                      >
                        <IonIcon icon={pencil} color="primary" />
                      </IonButton>
                      <IonButton
                        fill="clear"
                        onClick={() => handleEliminar(cliente.id)}
                        className="delete-btn"
                      >
                        <IonIcon icon={trash} color="danger" />
                      </IonButton>
                    </div>
                  </IonCol>
                </IonRow>
              ))}
            </IonGrid>
          )}

          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton className="print-btn" onClick={handleImprimir}>
              <IonIcon icon={print} />
            </IonFabButton>
          </IonFab>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Clientes;
