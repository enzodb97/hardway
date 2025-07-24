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
  IonToggle,
  IonInput,
} from "@ionic/react";
import {
  add,
  pencil,
  print,
  person,
  call,
  mail,
  location,
  document,
  funnel,
  grid,
  list,
  checkmarkCircle,
  closeCircle,
  time,
} from "ionicons/icons";
import { useState, useEffect } from "react";
import { useClientesVip } from "../../utils/useClientesVip";
import crownIcon from "../../assets/icons/vip-crown.svg";
import starIcon from "../../assets/icons/vip-star.svg";
import { useClientes } from "../../context/ClientesContext";
import HistorialCliente from "./HistorialCliente";
import "./Clientes.css";
import { exportarClientesPDF } from "../../utils/clientesUtils";
import axios from "axios";

const Clientes: React.FC = () => {
  const {
    clientes,
    eliminarCliente,
    darDeBajaCliente,
    darDeAltaCliente,
    recargarClientes,
  } = useClientes();
  const { vipIds } = useClientesVip();
  const [busqueda, setBusqueda] = useState("");
  const [vistaGrid, setVistaGrid] = useState(true);
  const [filtroLocalidad, setFiltroLocalidad] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [cargando, setCargando] = useState(false);
  const [soloVip, setSoloVip] = useState(false);

  // Estados para alertas
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState<number | null>(null);
  const [showConfirmBaja, setShowConfirmBaja] = useState(false);
  const [showConfirmAlta, setShowConfirmAlta] = useState(false);
  const [clienteADarBaja, setClienteADarBaja] = useState<number | null>(null);
  const [clienteADarAlta, setClienteADarAlta] = useState<number | null>(null);

  // Estados para historial
  const [showHistorial, setShowHistorial] = useState(false);
  const [clienteHistorial, setClienteHistorial] = useState<{
    id: number;
    nombre: string;
  } | null>(null);

  // Estado para el monto VIP
  const [montoVip, setMontoVip] = useState<number | null>(null);
  const [nuevoMontoVip, setNuevoMontoVip] = useState<string>("");
  const [cargandoMontoVip, setCargandoMontoVip] = useState(false);

  // Estado para el modal del monto VIP
  const [showModalMontoVip, setShowModalMontoVip] = useState(false);

  // Obtener localidades únicas para el filtro
  const localidadesUnicas = [
    ...new Set(clientes.map((c) => c.localidad).filter(Boolean)),
  ];

  const clientesFiltrados = clientes.filter((cliente) => {
    const cumpleBusqueda =
      (cliente.nombre?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
      (cliente.apellido?.toLowerCase() || "").includes(
        busqueda.toLowerCase()
      ) ||
      (cliente.email?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
      (cliente.numeroDocumento || "").includes(busqueda) ||
      (cliente.telefono || "").includes(busqueda);

    const cumpleLocalidad =
      !filtroLocalidad || cliente.localidad === filtroLocalidad;
    const cumpleDocumento =
      !filtroDocumento || cliente.tipoDocumento === filtroDocumento;
    const cumpleVip = !soloVip || vipIds.has(cliente.id);

    return cumpleBusqueda && cumpleLocalidad && cumpleDocumento && cumpleVip;
  });

  const totalClientes = clientes.length;

  // Manejo de refresh
  const doRefresh = async (event: CustomEvent) => {
    setCargando(true);
    try {
      await recargarClientes();
    } catch (error) {
      console.error("Error al recargar clientes:", error);
    } finally {
      setCargando(false);
      event.detail.complete();
    }
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
      setAlertMsg("Cliente dado de baja correctamente");
      setShowAlert(true);
    } catch (error: any) {
      const backendMsg =
        error.response?.data?.error || error.response?.data?.detalle || "";

      if (
        error.response &&
        error.response.status === 400 &&
        backendMsg.includes("No se puede eliminar el cliente")
      ) {
        setAlertMsg(
          "No se puede dar de baja el cliente, tiene pedidos asociados."
        );
        setShowAlert(true);
      } else {
        setAlertMsg("Error al dar de baja el cliente.");
        setShowAlert(true);
      }
    } finally {
      setClienteAEliminar(null);
      setShowConfirm(false);
    }
  };

  // Dar de baja cliente
  const pedirConfirmacionBaja = (id: number) => {
    setClienteADarBaja(id);
    setShowConfirmBaja(true);
  };

  const handleDarBaja = async () => {
    if (clienteADarBaja === null) return;
    try {
      await darDeBajaCliente(clienteADarBaja);
      setAlertMsg("Cliente dado de baja correctamente");
      setShowAlert(true);
    } catch (error: any) {
      setAlertMsg("Error al dar de baja el cliente");
      setShowAlert(true);
    } finally {
      setClienteADarBaja(null);
      setShowConfirmBaja(false);
    }
  };

  // Dar de alta cliente
  const pedirConfirmacionAlta = (id: number) => {
    setClienteADarAlta(id);
    setShowConfirmAlta(true);
  };

  const handleDarAlta = async () => {
    if (clienteADarAlta === null) return;
    try {
      await darDeAltaCliente(clienteADarAlta);
      setAlertMsg("Cliente dado de alta correctamente");
      setShowAlert(true);
    } catch (error: any) {
      setAlertMsg("Error al dar de alta el cliente");
      setShowAlert(true);
    } finally {
      setClienteADarAlta(null);
      setShowConfirmAlta(false);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroLocalidad("");
    setFiltroDocumento("");
  };

  // Mostrar historial de cliente
  const mostrarHistorial = (cliente: any) => {
    setClienteHistorial({
      id: cliente.id,
      nombre: `${cliente.nombre} ${cliente.apellido}`,
    });
    setShowHistorial(true);
  };

  const cerrarHistorial = () => {
    setShowHistorial(false);
    setClienteHistorial(null);
  };

  // Obtener el monto VIP actual al montar
  useEffect(() => {
    const fetchMontoVip = async () => {
      setCargandoMontoVip(true);
      try {
        const res = await axios.get("/api/clientes/vip/vip-threshold");
        setMontoVip(res.data.monto);
        setNuevoMontoVip(res.data.monto.toString());
      } catch (err) {
        setMontoVip(null);
      } finally {
        setCargandoMontoVip(false);
      }
    };
    fetchMontoVip();
  }, []);

  // Actualizar el monto VIP
  const actualizarMontoVip = async () => {
    const monto = Number(nuevoMontoVip);
    if (isNaN(monto) || monto <= 0) {
      setAlertMsg("Ingrese un monto válido mayor a 0");
      setShowAlert(true);
      return;
    }
    setCargandoMontoVip(true);
    try {
      await axios.put("/api/clientes/vip/vip-threshold", { monto });
      setMontoVip(monto);
      setAlertMsg("Monto VIP actualizado correctamente");
      setShowAlert(true);
    } catch (err) {
      setAlertMsg("Error al actualizar el monto VIP");
      setShowAlert(true);
    } finally {
      setCargandoMontoVip(false);
    }
  };

  // Nueva función para actualizar desde el modal
  const actualizarMontoVipModal = async (valor: string) => {
    const monto = Number(valor);
    if (isNaN(monto) || monto <= 0) {
      setAlertMsg("Ingrese un monto válido mayor a 0");
      setShowAlert(true);
      return;
    }
    setCargandoMontoVip(true);
    try {
      await axios.put("/api/clientes/vip/vip-threshold", { monto });
      setMontoVip(monto);
      setAlertMsg("Monto VIP actualizado correctamente");
      setShowAlert(true);
      setShowModalMontoVip(false);
    } catch (err) {
      setAlertMsg("Error al actualizar el monto VIP");
      setShowAlert(true);
    } finally {
      setCargandoMontoVip(false);
    }
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
                <IonCardTitle className="client-name">
                  {`${cliente.nombre} ${cliente.apellido}`}
                  {vipIds.has(cliente.id) && (
                    <span className="vip-crown-wrapper">
                      <img
                        src={crownIcon}
                        alt="VIP"
                        title="Cliente VIP"
                        className="vip-crown-icon"
                      />
                    </span>
                  )}
                </IonCardTitle>
                <IonChip color="primary" className="doc-chip">
                  <IonIcon icon={document} />
                  <IonLabel>
                    {cliente.tipoDocumento}: {cliente.numeroDocumento}
                  </IonLabel>
                </IonChip>
                {/* Chip de estado del cliente */}
                <IonChip
                  color={cliente.estaActivo === 0 ? "danger" : "success"}
                  style={{ fontSize: "0.8rem" }}
                >
                  {cliente.estaActivo === 0 ? "Inactivo" : "Activo"}
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
                color="primary"
                routerLink={`/alta-cliente/${cliente.id}`}
                className="edit-action"
              >
                <IonIcon icon={pencil} slot="start" color="primary" />
                <span className="edit-label">Editar</span>
              </IonButton>
              <IonButton
                fill="clear"
                size="small"
                color="medium"
                onClick={() => mostrarHistorial(cliente)}
                className="historial-action"
              >
                <IonIcon icon={time} slot="start" />
                Historial
              </IonButton>
              {/* Mostrar botón de alta o baja según el estado del cliente */}
              {cliente.estaActivo === 0 ? (
                <IonButton
                  fill="clear"
                  size="small"
                  color="success"
                  onClick={() => pedirConfirmacionAlta(cliente.id)}
                  className="alta-action"
                >
                  <IonIcon icon={checkmarkCircle} slot="start" />
                  Dar de Alta
                </IonButton>
              ) : (
                <IonButton
                  fill="clear"
                  size="small"
                  color="danger"
                  onClick={() => pedirConfirmacionBaja(cliente.id)}
                  className="baja-action"
                >
                  <IonIcon icon={closeCircle} slot="start" color="danger" />
                  <span className="baja-label">Dar de Baja</span>
                </IonButton>
              )}
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
              <h3 className="client-name-list">
                {`${cliente.nombre} ${cliente.apellido}`}
                {vipIds.has(cliente.id) && (
                  <span className="vip-star-wrapper">
                    <img
                      src={starIcon}
                      alt="VIP"
                      title="Cliente VIP"
                      className="vip-star-icon"
                    />
                  </span>
                )}
              </h3>
              <div className="client-info-row">
                <p className="client-doc-list">
                  {cliente.tipoDocumento}: {cliente.numeroDocumento}
                </p>
                <IonChip
                  color={cliente.estaActivo === 0 ? "danger" : "success"}
                  style={{ fontSize: "0.7rem", marginLeft: "8px" }}
                >
                  {cliente.estaActivo === 0 ? "Inactivo" : "Activo"}
                </IonChip>
              </div>
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
              color="primary"
              routerLink={`/alta-cliente/${cliente.id}`}
              className="edit-action"
            >
              <IonIcon icon={pencil} color="primary" />
              <span className="edit-label">Editar</span>
            </IonButton>
            <IonButton
              fill="clear"
              size="small"
              color="medium"
              onClick={() => mostrarHistorial(cliente)}
            >
              <IonIcon icon={time} />
            </IonButton>
            {/* Mostrar botón de alta o baja según el estado del cliente */}
            {cliente.estaActivo === 0 ? (
              <IonButton
                fill="clear"
                size="small"
                color="success"
                onClick={() => pedirConfirmacionAlta(cliente.id)}
              >
                <IonIcon icon={checkmarkCircle} />
              </IonButton>
            ) : (
              <IonButton
                fill="clear"
                size="small"
                color="danger"
                onClick={() => pedirConfirmacionBaja(cliente.id)}
                className="baja-action"
              >
                <IonIcon icon={closeCircle} color="danger" />
                <span className="baja-label">Dar de Baja</span>
              </IonButton>
            )}
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
                <IonSelectOption value="">
                  Todas las localidades
                </IonSelectOption>
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

            <IonItem className="filter-item">
              <IonLabel>Solo VIP</IonLabel>
              <IonToggle
                checked={soloVip}
                onIonChange={(e) => setSoloVip(e.detail.checked)}
                color="warning"
              />
            </IonItem>

            <div className="filter-actions">
              {(busqueda || filtroLocalidad || filtroDocumento || soloVip) && (
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={limpiarFiltros}
                  className="clear-filters-btn"
                >
                  Limpiar filtros
                </IonButton>
              )}

              {/* Botones de exportar y editar VIP juntos */}
              <div className="export-vip-btns">
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
                <IonButton
                  fill="outline"
                  size="small"
                  color="warning"
                  className="vip-monto-btn"
                  onClick={() => setShowModalMontoVip(true)}
                >
                  <IonIcon icon={starIcon} slot="start" color="warning" />
                  Editar Monto VIP
                </IonButton>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="content-section">
            {cargando ? (
              <div className="skeleton-container">
                {Array.from({ length: 6 }).map((_, index) => (
                  <IonCard key={index}>
                    <IonCardHeader>
                      <IonSkeletonText animated style={{ width: "60%" }} />
                    </IonCardHeader>
                    <IonCardContent>
                      <IonSkeletonText animated style={{ width: "80%" }} />
                      <IonSkeletonText animated style={{ width: "40%" }} />
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
                  Agregar Nuevo Cliente
                </IonButton>
              </div>
            ) : vistaGrid ? (
              renderVistaCards()
            ) : (
              renderVistaLista()
            )}
          </div>

          {/* Botón para editar monto VIP
          <IonButton
            fill="outline"
            size="small"
            color="warning"
            className="vip-monto-btn"
            onClick={() => setShowModalMontoVip(true)}
          >
            <IonIcon icon={starIcon} slot="start" color="warning" />
            Monto VIP
          </IonButton>*/}

          {/* Modal para editar monto VIP */}
          {showModalMontoVip && (
            <div className="vip-modal-overlay">
              <div className="vip-modal">
                <div className="vip-modal-header">
                  <IonIcon
                    icon={starIcon}
                    color="warning"
                    className="vip-modal-star"
                  />
                  <h2>Editar monto mínimo VIP</h2>
                </div>
                <div className="vip-modal-body">
                  <p className="vip-modal-actual">
                    Monto actual: <span>${montoVip ?? "-"}</span>
                  </p>
                  <IonInput
                    type="number"
                    min={1}
                    value={nuevoMontoVip}
                    onIonChange={(e) => setNuevoMontoVip(e.detail.value!)}
                    className="vip-modal-input"
                    placeholder="Nuevo monto mínimo"
                  />
                </div>
                <div className="vip-modal-actions">
                  <IonButton
                    fill="clear"
                    size="small"
                    color="medium"
                    onClick={() => setShowModalMontoVip(false)}
                  >
                    Cancelar
                  </IonButton>
                  <IonButton
                    fill="solid"
                    size="small"
                    color="warning"
                    onClick={() => actualizarMontoVipModal(nuevoMontoVip)}
                  >
                    Guardar
                  </IonButton>
                </div>
              </div>
              <div
                className="vip-modal-backdrop"
                onClick={() => setShowModalMontoVip(false)}
              ></div>
            </div>
          )}

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

          {/* Confirmación de dar de baja */}
          <IonAlert
            isOpen={showConfirmBaja}
            onDidDismiss={() => setShowConfirmBaja(false)}
            header="¿Dar de baja cliente?"
            message="¿Estás seguro de que deseas dar de baja este cliente? Podrás reactivarlo más tarde."
            buttons={[
              {
                text: "Cancelar",
                role: "cancel",
                handler: () => setShowConfirmBaja(false),
              },
              {
                text: "Dar de Baja",
                handler: handleDarBaja,
                cssClass: "warning",
              },
            ]}
          />

          {/* Confirmación de dar de alta */}
          <IonAlert
            isOpen={showConfirmAlta}
            onDidDismiss={() => setShowConfirmAlta(false)}
            header="¿Dar de alta cliente?"
            message="¿Estás seguro de que deseas reactivar este cliente?"
            buttons={[
              {
                text: "Cancelar",
                role: "cancel",
                handler: () => setShowConfirmAlta(false),
              },
              {
                text: "Dar de Alta",
                handler: handleDarAlta,
                cssClass: "success",
              },
            ]}
          />

          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            message={alertMsg}
            buttons={["Aceptar"]}
          />

          {/* Modal de historial */}
          {clienteHistorial && (
            <HistorialCliente
              isOpen={showHistorial}
              onDidDismiss={cerrarHistorial}
              clienteId={clienteHistorial.id}
              clienteNombre={clienteHistorial.nombre}
            />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Clientes;
