import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonBadge,
  IonFab,
  IonFabButton,
  IonAlert,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonText,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
} from "@ionic/react";
import { 
  add, 
  pencil, 
  trash, 
  print, 
  person, 
  call, 
  mail, 
  location, 
  document,
  funnel,
  grid,
  list
} from "ionicons/icons";
import { useState } from "react";
import { useClientes } from "../../context/ClientesContext";
import "./Clientes.css";
import { exportarClientesPDF } from "../../utils/clientesUtils";

const Clientes: React.FC = () => {
  const { clientes, eliminarCliente } = useClientes();
  const [busqueda, setBusqueda] = useState("");
  const [vistaGrid, setVistaGrid] = useState(true);
  const [filtroLocalidad, setFiltroLocalidad] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [cargando, setCargando] = useState(false);

  // Estados para alertas
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState<number | null>(null);

  // Obtener localidades únicas para el filtro
  const localidadesUnicas = [...new Set(clientes.map(c => c.localidad).filter(Boolean))];

  const clientesFiltrados = clientes.filter((cliente) => {
    const cumpleBusqueda = 
      (cliente.nombre?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
      (cliente.apellido?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
      (cliente.email?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
      (cliente.numeroDocumento || "").includes(busqueda) ||
      (cliente.telefono || "").includes(busqueda);
    
    const cumpleLocalidad = !filtroLocalidad || cliente.localidad === filtroLocalidad;
    const cumpleDocumento = !filtroDocumento || cliente.tipoDocumento === filtroDocumento;
    
    return cumpleBusqueda && cumpleLocalidad && cumpleDocumento;
  });

  const totalClientes = clientes.length;

  // Manejo de refresh
  const doRefresh = (event: CustomEvent) => {
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      event.detail.complete();
    }, 1000);
  };

  // Confirmación de eliminación
  const pedirConfirmacionEliminar = (id: number) => {
    setClienteAEliminar(id);
    setShowConfirm(true);
  };

  // Eliminar cliente
  const handleEliminar = async () => {
    if (clienteAEliminar === null) return;
    try {
      await eliminarCliente(clienteAEliminar);
      setAlertMsg("Cliente eliminado correctamente");
      setShowAlert(true);
    } catch (error: any) {
      const backendMsg =
        error.response?.data?.error || error.response?.data?.detalle || "";

      if (
        error.response &&
        error.response.status === 400 &&
        backendMsg.includes("No se puede eliminar el cliente")
      ) {
        setAlertMsg("No se puede eliminar el cliente, tiene pedidos asociados.");
        setShowAlert(true);
      } else {
        setAlertMsg("Error al eliminar el cliente, tiene pedidos asociados.");
        setShowAlert(true);
      }
    } finally {
      setShowConfirm(false);
      setClienteAEliminar(null);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroLocalidad("");
    setFiltroDocumento("");
  };




  // Render de vista en tarjetas
  const renderVistaCards = () => (
    <div className="clients-grid">
      {clientesFiltrados.map((cliente) => (
        <IonCard key={cliente.id} className="client-card">
          <IonCardHeader>
            <div className="card-header-content">
              <div className="client-avatar">
                <IonIcon icon={person} />
              </div>
              <div className="client-main-info">
                <IonCardTitle className="client-name">{`${cliente.nombre} ${cliente.apellido}`}</IonCardTitle>
                <IonChip color="primary" className="doc-chip">
                  <IonIcon icon={document} />
                  <IonLabel>{cliente.tipoDocumento}: {cliente.numeroDocumento}</IonLabel>
                </IonChip>
              </div>
            </div>
          </IonCardHeader>
          
          <IonCardContent>
            <div className="client-details">
              {cliente.telefono && (
                <div className="detail-item">
                  <IonIcon icon={call} color="primary" />
                  <span>{cliente.telefono}</span>
                </div>
              )}
              
              {cliente.email && (
                <div className="detail-item">
                  <IonIcon icon={mail} color="primary" />
                  <span>{cliente.email}</span>
                </div>
              )}
              
              {(cliente.localidad || cliente.barrio) && (
                <div className="detail-item">
                  <IonIcon icon={location} color="primary" />
                  <span>
                    {cliente.localidad}
                    {cliente.barrio && ` - ${cliente.barrio}`}
                    {cliente.cp && ` (CP: ${cliente.cp})`}
                  </span>
                </div>
              )}
            </div>
            
            <div className="card-actions">
              <IonButton
                fill="clear"
                size="small"
                routerLink={`/alta-cliente/${cliente.id}`}
                className="edit-action"
              >
                <IonIcon icon={pencil} slot="start" />
                Editar
              </IonButton>
              <IonButton
                fill="clear"
                size="small"
                color="danger"
                onClick={() => pedirConfirmacionEliminar(cliente.id)}
                className="delete-action"
              >
                <IonIcon icon={trash} slot="start" />
                Eliminar
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      ))}
    </div>
  );

  // Render de vista en lista compacta
  const renderVistaLista = () => (
    <div className="clients-list">
      {clientesFiltrados.map((cliente) => (
        <div key={cliente.id} className="client-list-item">
          <div className="list-item-content">
            <div className="client-basic-info">
              <h3 className="client-name-list">{`${cliente.nombre} ${cliente.apellido}`}</h3>
              <p className="client-doc-list">{cliente.tipoDocumento}: {cliente.numeroDocumento}</p>
            </div>
            <div className="client-contact-info">
              <span className="phone-info">{cliente.telefono}</span>
              <span className="location-info">
                {cliente.localidad}
                {cliente.cp && ` (CP: ${cliente.cp})`}
              </span>
            </div>
          </div>
          <div className="list-item-actions">
            <IonButton
              fill="clear"
              size="small"
              routerLink={`/alta-cliente/${cliente.id}`}
            >
              <IonIcon icon={pencil} />
            </IonButton>
            <IonButton
              fill="clear"
              size="small"
              color="danger"
              onClick={() => pedirConfirmacionEliminar(cliente.id)}
            >
              <IonIcon icon={trash} />
            </IonButton>
          </div>
        </div>
      ))}
    </div>
  );

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
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="clientes-container">
          {/* Header con estadísticas y controles */}
          <div className="header-section">
            <div className="stats-section">
              <IonBadge color="primary" className="total-badge">
                Total: {totalClientes}
              </IonBadge>
              <IonBadge color="secondary" className="filtered-badge">
                Mostrando: {clientesFiltrados.length}
              </IonBadge>
            </div>
            
            <div className="view-controls">
              <IonButton
                fill={vistaGrid ? "solid" : "outline"}
                size="small"
                onClick={() => setVistaGrid(true)}
                className="view-btn"
              >
                <IonIcon icon={grid} />
              </IonButton>
              <IonButton
                fill={!vistaGrid ? "solid" : "outline"}
                size="small"
                onClick={() => setVistaGrid(false)}
                className="view-btn"
              >
                <IonIcon icon={list} />
              </IonButton>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <IonSearchbar
            className="clientes-search"
            value={busqueda}
            onIonChange={(e) => setBusqueda(e.detail.value!)}
            placeholder="Buscar por nombre, documento, teléfono o email..."
            showClearButton="focus"
          />

          {/* Filtros */}
          <div className="filters-section">
            <IonItem className="filter-item">
              <IonIcon icon={funnel} slot="start" color="medium" />
              <IonSelect
                value={filtroLocalidad}
                placeholder="Todas las localidades"
                onIonChange={(e) => setFiltroLocalidad(e.detail.value)}
                interface="popover"
              >
                <IonSelectOption value="">Todas las localidades</IonSelectOption>
                {localidadesUnicas.map((localidad) => (
                  <IonSelectOption key={localidad} value={localidad}>
                    {localidad}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem className="filter-item">
              <IonSelect
                value={filtroDocumento}
                placeholder="Tipo de documento"
                onIonChange={(e) => setFiltroDocumento(e.detail.value)}
                interface="popover"
              >
                <IonSelectOption value="">Todos los documentos</IonSelectOption>
                <IonSelectOption value="DNI">DNI</IonSelectOption>
                <IonSelectOption value="CUIL">CUIL</IonSelectOption>
                <IonSelectOption value="CUIT">CUIT</IonSelectOption>
              </IonSelect>
            </IonItem>

            <div className="filter-actions">
              {(busqueda || filtroLocalidad || filtroDocumento) && (
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={limpiarFiltros}
                  className="clear-filters-btn"
                >
                  Limpiar filtros
                </IonButton>
              )}
              
              {clientesFiltrados.length > 0 && (
                <IonButton
                  fill="solid"
                  size="small"
                  onClick={() => exportarClientesPDF(clientesFiltrados)}
                  className="export-pdf-btn"
                >
                  <IonIcon icon={print} slot="start" />
                  Exportar a PDF
                </IonButton>
              )}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="content-section">
            {cargando ? (
              <div className="skeleton-container">
                {Array.from({ length: 6 }).map((_, index) => (
                  <IonCard key={index}>
                    <IonCardHeader>
                      <IonSkeletonText animated style={{ width: '60%' }} />
                    </IonCardHeader>
                    <IonCardContent>
                      <IonSkeletonText animated style={{ width: '80%' }} />
                      <IonSkeletonText animated style={{ width: '40%' }} />
                    </IonCardContent>
                  </IonCard>
                ))}
              </div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={person} className="empty-icon" />
                <h2>No hay clientes</h2>
                <p>
                  {clientes.length === 0
                    ? "Aún no has registrado ningún cliente"
                    : "No se encontraron clientes con los filtros aplicados"}
                </p>
                <IonButton routerLink="/alta-cliente" className="add-first-btn">
                  <IonIcon icon={add} slot="start" />
                  Agregar primer cliente
                </IonButton>
              </div>
            ) : (
              vistaGrid ? renderVistaCards() : renderVistaLista()
            )}
          </div>

          {/* FAB para exportar a PDF */}
          {/*<IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton 
              className="print-btn" 
              onClick={() => clientesFiltrados.length > 0 && exportarClientesPDF(clientesFiltrados)}
              disabled={clientesFiltrados.length === 0}
              title="Exportar listado de clientes a PDF"
            >
              <IonIcon icon={print} />
            </IonFabButton>
          </IonFab>*/}

          {/* Alertas */}
          <IonAlert
            isOpen={showConfirm}
            onDidDismiss={() => setShowConfirm(false)}
            header="Confirmar eliminación"
            message="¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer."
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
