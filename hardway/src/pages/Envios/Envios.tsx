import React, { useEffect, useState } from "react";
import {
  obtenerPedidosAbonados,
  despacharPedido,
  PedidoEnvio,
} from "../../utils/enviosUtils";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonButton,
  IonAlert,
  IonLabel,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonChip,
  IonBadge,
  IonSearchbar,
  IonItem,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonMenuButton,
  IonToast,
} from "@ionic/react";
import {
  carOutline,
  cubeOutline,
  timeOutline,
  checkmarkCircleOutline,
  searchOutline,
  refreshOutline,
  mailOutline,
  locationOutline,
  calendarOutline,
  layersOutline,
  filterOutline,
  closeOutline,
} from "ionicons/icons";
import "./Envios.css";

const Envios: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoEnvio[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<PedidoEnvio[]>([]);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<PedidoEnvio | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');

  // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 6;
  const totalPaginas = Math.ceil(pedidosFiltrados.length / porPagina);
  const pedidosPaginados = pedidosFiltrados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    filtrarPedidos();
  }, [pedidos, searchTerm, filtroEstado]);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      console.log("🔍 Cargando pedidos de envío...");
      const username = localStorage.getItem("username");
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      console.log("📋 Estado de autenticación:", { username, isAuthenticated });

      const pedidosData = await obtenerPedidosAbonados();
      console.log("✅ Pedidos cargados:", pedidosData.length);
      console.log("📦 Datos de pedidos con empresa:", pedidosData.map(p => ({
        pedido: p.numeroPedido,
        empresa: p.empresaEnvio,
        idEmpresa: p.idEmpresaEnvio
      })));
      setPedidos(pedidosData);
    } catch (error) {
      console.error("❌ Error cargando pedidos:", error);
      setAlertMsg("Error al cargar pedidos pendientes de envío");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPedidos = () => {
    let pedidosFiltrados = [...pedidos];

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      pedidosFiltrados = pedidosFiltrados.filter(
        (pedido) =>
          pedido.numeroPedido.toString().includes(searchTerm) ||
          `${pedido.nombre} ${pedido.apellido}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          pedido.cliente_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filtroEstado === "pendientes") {
      pedidosFiltrados = pedidosFiltrados.filter(
        (pedido) => !pedido.codigoSeguimiento
      );
    } else if (filtroEstado === "despachados") {
      pedidosFiltrados = pedidosFiltrados.filter(
        (pedido) => !!pedido.codigoSeguimiento
      );
    }

    setPedidosFiltrados(pedidosFiltrados);
    setPagina(1); // Resetear a la primera página
  };

  // Función para filtrar por estadísticas
  const filtrarPorEstadisticas = (tipo: string) => {
    setFiltroActivo(tipo);
    setSearchTerm(""); // Limpiar búsqueda
    
    switch (tipo) {
      case 'pendientes':
        setFiltroEstado('pendientes');
        break;
      case 'despachados':
        setFiltroEstado('despachados');
        break;
      case 'total':
        setFiltroEstado('todos');
        break;
      default:
        setFiltroEstado('todos');
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await cargarPedidos();
    event.detail.complete();
  };

  const handleDespachar = async () => {
    if (!pedidoSeleccionado || !codigoSeguimiento.trim()) {
      setAlertMsg("Debe ingresar un código de seguimiento válido.");
      setShowAlert(true);
      return;
    }

    // Validar formato del código (opcional)
    if (codigoSeguimiento.length < 6) {
      setAlertMsg("El código de seguimiento debe tener al menos 6 caracteres.");
      setShowAlert(true);
      return;
    }

    try {
      setLoading(true);
      await despacharPedido(pedidoSeleccionado.numeroPedido, codigoSeguimiento);
      setToastMsg(
        `Pedido #${pedidoSeleccionado.numeroPedido} despachado correctamente`
      );
      setShowToast(true);
      setCodigoSeguimiento("");
      setPedidoSeleccionado(null);
      await cargarPedidos(); // Recargar la lista
    } catch (error) {
      setAlertMsg("Error al despachar el pedido. Intente nuevamente.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage className="envios-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>
            <IonIcon icon={carOutline} className="header-icon" />
            Centro de Despacho
          </IonTitle>
          <IonButton
            fill="clear"
            slot="end"
            onClick={cargarPedidos}
            disabled={loading}
          >
            <IonIcon icon={refreshOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="envios-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Header con estadísticas */}
        <IonCard className="stats-card">
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="4" className="stat-col">
                  <div 
                    className={`stat-item ${filtroActivo === 'pendientes' ? 'active' : ''}`}
                    onClick={() => filtrarPorEstadisticas('pendientes')}
                  >
                    <IonIcon icon={cubeOutline} className="stat-icon pending" />
                    <div className="stat-number">
                      {pedidos.filter((p) => !p.codigoSeguimiento).length}
                    </div>
                    <div className="stat-label">Pendientes</div>
                  </div>
                </IonCol>
                <IonCol size="4" className="stat-col">
                  <div 
                    className={`stat-item ${filtroActivo === 'despachados' ? 'active' : ''}`}
                    onClick={() => filtrarPorEstadisticas('despachados')}
                  >
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      className="stat-icon dispatched"
                    />
                    <div className="stat-number">
                      {pedidos.filter((p) => !!p.codigoSeguimiento).length}
                    </div>
                    <div className="stat-label">Despachados</div>
                  </div>
                </IonCol>
                <IonCol size="4" className="stat-col">
                  <div 
                    className={`stat-item ${filtroActivo === 'total' ? 'active' : ''}`}
                    onClick={() => filtrarPorEstadisticas('total')}
                  >
                    <IonIcon icon={layersOutline} className="stat-icon total" />
                    <div className="stat-number">{pedidos.length}</div>
                    <div className="stat-label">Total</div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Filtros y búsqueda */}
        <IonCard className="filters-card">
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="8">
                  <IonSearchbar
                    value={searchTerm}
                    onIonInput={(e) => setSearchTerm(e.detail.value!)}
                    placeholder="Buscar por pedido, cliente o email..."
                    showClearButton="focus"
                    className="custom-searchbar"
                  />
                </IonCol>
                <IonCol size="12" sizeMd="4">
                  <div className="filter-chips">
                    <IonChip
                      color={filtroEstado === "todos" ? "primary" : "light"}
                      onClick={() => setFiltroEstado("todos")}
                    >
                      Todos
                    </IonChip>
                    <IonChip
                      color={
                        filtroEstado === "pendientes" ? "warning" : "light"
                      }
                      onClick={() => setFiltroEstado("pendientes")}
                    >
                      Pendientes
                    </IonChip>
                    <IonChip
                      color={
                        filtroEstado === "despachados" ? "success" : "light"
                      }
                      onClick={() => setFiltroEstado("despachados")}
                    >
                      Despachados
                    </IonChip>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Lista de pedidos */}
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="circular" />
            <p>Cargando pedidos...</p>
          </div>
        ) : pedidosPaginados.length === 0 ? (
          <IonCard className="empty-state">
            <IonCardContent>
              <IonIcon icon={cubeOutline} className="empty-icon" />
              <h3>No hay pedidos</h3>
              <p>
                {searchTerm || filtroEstado !== "todos"
                  ? "No se encontraron pedidos con los filtros aplicados."
                  : "No hay pedidos pendientes de envío en este momento."}
              </p>
            </IonCardContent>
          </IonCard>
        ) : (
          <div className="pedidos-grid">
            {pedidosPaginados.map((pedido) => (
              <IonCard key={pedido.numeroPedido} className="pedido-card">
                <IonCardHeader>
                  <div className="pedido-header">
                    <div className="pedido-title">
                      <IonCardTitle>Pedido #{pedido.numeroPedido}</IonCardTitle>
                      <IonBadge
                        color={pedido.codigoSeguimiento ? "success" : "warning"}
                        className="status-badge"
                      >
                        {pedido.codigoSeguimiento ? "Despachado" : "Pendiente"}
                      </IonBadge>{" "}
                      <div className="pedido-date">
                        <IonIcon icon={calendarOutline} />
                        <span>
                          {new Date(pedido.fechaPedido).toLocaleDateString(
                            "es-AR"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </IonCardHeader>

                <IonCardContent>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="12" sizeMd="6">
                        <div className="info-item">
                          <IonIcon icon={cubeOutline} className="info-icon" />
                          <div>
                            <div className="info-label">Cliente</div>
                            <div className="info-value">
                              {pedido.nombre} {pedido.apellido}
                            </div>
                          </div>
                        </div>
                      </IonCol>

                      <IonCol size="12" sizeMd="6">
                        <div className="info-item">
                          <IonIcon icon={mailOutline} className="info-icon" />
                          <div>
                            <div className="info-label">Email</div>
                            <div className="info-value">
                              {pedido.cliente_email}
                            </div>
                          </div>
                        </div>
                      </IonCol>

                      <IonCol size="12">
                        <div className="info-item">
                          <IonIcon
                            icon={locationOutline}
                            className="info-icon"
                          />
                          <div>
                            <div className="info-label">Dirección de Envío</div>
                            <div className="info-value">
                              {pedido.direccion_envio}
                            </div>
                          </div>
                        </div>
                      </IonCol>

                      <IonCol size="12">
                        <div className="info-item">
                          <IonIcon icon={layersOutline} className="info-icon" />
                          <div>
                            <div className="info-label">Items</div>
                            <div className="info-value">
                              {pedido.total_items}
                            </div>
                          </div>
                        </div>
                      </IonCol>

                      {pedido.empresaEnvio && (
                        <IonCol size="12">
                          <div className="empresa-envio-container">
                            <IonIcon icon={carOutline} className="empresa-envio-icon" />
                            <div className="empresa-envio-content">
                              <div className="empresa-envio-label">Empresa de Envío</div>
                              <div className="empresa-envio-value">
                                {pedido.empresaEnvio}
                              </div>
                            </div>
                          </div>
                        </IonCol>
                      )}

                      <IonCol size="12">
                        <div className="action-container">
                          <IonButton
                            expand="block"
                            size="default"
                            color={
                              pedido.codigoSeguimiento ? "success" : "primary"
                            }
                            onClick={() => {
                              setPedidoSeleccionado(pedido);
                              setCodigoSeguimiento(
                                pedido.codigoSeguimiento || ""
                              );
                            }}
                            disabled={!!pedido.codigoSeguimiento}
                          >
                            {pedido.codigoSeguimiento
                              ? "Despachado"
                              : "Procesar"}
                          </IonButton>
                        </div>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <IonCard className="pagination-card">
            <IonCardContent>
              <div className="pagination-container">
                <IonButton
                  fill="outline"
                  size="small"
                  color="light"
                  disabled={pagina === 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </IonButton>

                <div className="pagination-info">
                  <span className="page-indicator">
                    Página {pagina} de {totalPaginas}
                  </span>
                  <span className="items-indicator">
                    (
                    {pedidosFiltrados.length === 0
                      ? 0
                      : (pagina - 1) * porPagina + 1}
                    -{Math.min(pagina * porPagina, pedidosFiltrados.length)} de{" "}
                    {pedidosFiltrados.length})
                  </span>
                </div>

                <IonButton
                  fill="outline"
                  size="small"
                  color="light"
                  disabled={pagina === totalPaginas}
                  onClick={() =>
                    setPagina((p) => Math.min(totalPaginas, p + 1))
                  }
                >
                  Siguiente
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Modal para código de seguimiento */}
        <IonModal
          isOpen={!!pedidoSeleccionado}
          onDidDismiss={() => setPedidoSeleccionado(null)}
          className="tracking-modal"
          backdropDismiss={true}
          showBackdrop={true}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>Código de Seguimiento</h2>
              <p>Pedido #{pedidoSeleccionado?.numeroPedido}</p>
            </div>

            <div className="modal-body">
              <IonItem className="tracking-input">
                <IonLabel position="stacked">
                  <IonIcon icon={carOutline} className="icon-margin-right" />
                  Código de Seguimiento
                </IonLabel>
                <IonInput
                  value={codigoSeguimiento}
                  placeholder="Ej: LP123456789AR"
                  onIonInput={(e) => setCodigoSeguimiento(e.detail.value!)}
                  disabled={!!pedidoSeleccionado?.codigoSeguimiento}
                  clearInput
                />
              </IonItem>

              {pedidoSeleccionado?.codigoSeguimiento && (
                <div className="tracking-display">
                  <IonIcon icon={checkmarkCircleOutline} color="success" />
                  <span>Este pedido ya fue despachado</span>
                </div>
              )}
              
              {!pedidoSeleccionado?.codigoSeguimiento && (
                <div className="warning-message">
                  <div className="warning-content">
                    <IonIcon icon={timeOutline} />
                    <span>Ingrese el código para completar el despacho</span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <IonButton
                expand="block"
                onClick={handleDespachar}
                disabled={!!pedidoSeleccionado?.codigoSeguimiento || loading}
                color="primary"
              >
                {loading ? (
                  <>
                    <IonSpinner name="circular" className="icon-margin-right" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <IonIcon icon={checkmarkCircleOutline} className="icon-margin-right" />
                    Marcar como Despachado
                  </>
                )}
              </IonButton>

              <IonButton
                expand="block"
                fill="clear"
                color="light"
                onClick={() => setPedidoSeleccionado(null)}
              >
                <IonIcon icon={cubeOutline} className="icon-margin-right" />
                Cancelar
              </IonButton>
            </div>
          </div>
        </IonModal>

        {/* Toast para notificaciones */}
        <IonToast
          isOpen={showToast}
          message={toastMsg}
          duration={3000}
          color="success"
          onDidDismiss={() => setShowToast(false)}
          buttons={[{ text: "Cerrar", role: "cancel" }]}
        />

        {/* Alert para errores */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Atención"
          message={alertMsg}
          buttons={[{ text: "Aceptar", handler: () => setShowAlert(false) }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Envios;
