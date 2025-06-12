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
  IonAlert,
} from "@ionic/react";
import { add, pencil, trash, print } from "ionicons/icons";
import { useState } from "react";
import { useClientes } from "../../context/ClientesContext";
import "./Clientes.css";

const Clientes: React.FC = () => {
  const { clientes, eliminarCliente } = useClientes();
  const [busqueda, setBusqueda] = useState("");
  const [mostrarListado, setMostrarListado] = useState(false);

  // NUEVO: Estados para alertas
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false); // NUEVO
  const [clienteAEliminar, setClienteAEliminar] = useState<number | null>(null); // NUEVO

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      (cliente.nombre?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
      (cliente.email?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
      (cliente.numeroDocumento || "").includes(busqueda)
  );

  const totalClientes = clientes.length;

  // NUEVO: Mostrar IonAlert de confirmación
  const pedirConfirmacionEliminar = (id: number) => {
    setClienteAEliminar(id);
    setShowConfirm(true);
  };

  // Modifica handleEliminar para usar el IonAlert
  const handleEliminar = async () => {
    if (clienteAEliminar === null) return;
    try {
      await eliminarCliente(clienteAEliminar);
    } catch (error: any) {
      const backendMsg =
        error.response?.data?.error || error.response?.data?.detalle || "";

      if (
        error.response &&
        error.response.status === 400 &&
        backendMsg.includes("No se puede eliminar el cliente")
      ) {
        setAlertMsg("Error al eliminar el cliente, tiene pedidos.");
        setShowAlert(true);
      } else {
        setAlertMsg("Error al eliminar al cliente, tiene pedidos.");
        setShowAlert(true);
      }
    } finally {
      setShowConfirm(false);
      setClienteAEliminar(null);
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
              <div className="print-title">
                <h2>Listado de Clientes</h2>
                <p>Fecha: {new Date().toLocaleDateString()}</p>
              </div>

              <IonRow className="table-header">
                <IonCol className="text-center">
                  <strong>ID</strong>
                </IonCol>
                <IonCol className="text-center">
                  <strong>Nombre</strong>
                </IonCol>
                <IonCol className="text-center">
                  <strong>Documento</strong>
                </IonCol>
                <IonCol className="text-center">
                  <strong>Teléfono</strong>
                </IonCol>
                <IonCol className="text-center">
                  <strong>Localidad</strong>
                </IonCol>
                <IonCol className="text-center">
                  <strong>Email</strong>
                </IonCol>
                <IonCol className="text-center">
                  <strong>Barrio</strong>
                </IonCol>
                <IonCol className="print-hide text-center">
                  <strong>Acciones</strong>
                </IonCol>
              </IonRow>

              {clientesFiltrados.map((cliente) => (
                <IonRow key={cliente.id} className="table-row">
                  <IonCol className="text-center">{cliente.id}</IonCol>
                  <IonCol className="text-center">{cliente.nombre}</IonCol>
                  <IonCol className="text-center">{`${cliente.tipoDocumento}: ${cliente.numeroDocumento}`}</IonCol>
                  <IonCol className="text-center">{cliente.telefono}</IonCol>
                  <IonCol className="text-center">{cliente.localidad}</IonCol>
                  <IonCol className="text-center">
                    {cliente.email || "-"}
                  </IonCol>
                  <IonCol className="text-center">{cliente.barrio}</IonCol>
                  <IonCol className="print-hide text-center">
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
                        onClick={() => pedirConfirmacionEliminar(cliente.id)}
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

          <IonAlert
            isOpen={showConfirm}
            onDidDismiss={() => setShowConfirm(false)}
            header="Confirmar eliminación"
            message="¿Está seguro que desea eliminar este cliente?"
            buttons={[
              {
                text: "Cancelar",
                role: "cancel",
                handler: () => setShowConfirm(false),
              },
              {
                text: "Eliminar",
                handler: handleEliminar,
                cssClass: "danger",
              },
            ]}
          />
          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            message={alertMsg}
            buttons={["Aceptar"]}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Clientes;
