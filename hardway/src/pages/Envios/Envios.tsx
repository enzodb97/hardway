import React, { useEffect, useState } from "react";
import {
  obtenerPedidosAbonados,
  despacharPedido,
  actualizarCodigoSeguimiento,
  exportarPDFPendientesDespacho,
  exportarPDFPendientesPorEmpresa,
  PedidoEnvio,
} from "../../utils/enviosUtils";
import { formatFechaHoraCorta } from "../../utils/dateFormatters";
import { useAuth } from "../../context/AuthContext";
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
  useIonViewWillEnter,
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
  playBackOutline,
  playForwardOutline,
  playSkipBackOutline,
  playSkipForwardOutline,
  createOutline,
  documentTextOutline,
  personOutline,
} from "ionicons/icons";
import "./Envios.css";

const Envios: React.FC = () => {
  const { username, roles, hasRole, legajoPicker } = useAuth();
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
  const [filtroEstado, setFiltroEstado] = useState("pendientes");
  const [filtroActivo, setFiltroActivo] = useState<string>('pendientes');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [codigoOriginal, setCodigoOriginal] = useState("");
  const [showToastPDF, setShowToastPDF] = useState(false);
  const [toastPDFMsg, setToastPDFMsg] = useState("");
  const [errorValidacion, setErrorValidacion] = useState("");

  // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 6;
  const totalPaginas = Math.ceil(pedidosFiltrados.length / porPagina);
  const pedidosPaginados = pedidosFiltrados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  // Funciones de navegación de página
  const goToFirstPage = () => setPagina(1);
  const goToLastPage = () => setPagina(totalPaginas);
  const goToPreviousPage = () => setPagina(Math.max(1, pagina - 1));
  const goToNextPage = () => setPagina(Math.min(totalPaginas, pagina + 1));

  useEffect(() => {
    filtrarPedidos();
  }, [pedidos, searchTerm, filtroEstado]);

  // Recargar pedidos cada vez que la vista entra (para sincronización automática)
  useIonViewWillEnter(() => {
    cargarPedidos();
  });

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      console.log("🔍 Cargando pedidos de envío...");
      console.log("📋 Usuario autenticado:", { 
        username, 
        roles: roles.join(", "), 
        legajoPicker,
        esAdmin: hasRole("Administrador")
      });

      // ✅ ADMINISTRADOR: Ve TODOS los pedidos sin filtros
      // ✅ PICKER/DESPACHADOR: Solo ve los pedidos asignados a su legajo
      let rolPrincipal;
      let legajoParaFiltrar;

      if (hasRole("Administrador")) {
        // Administrador ve TODO sin restricciones
        rolPrincipal = "Administrador";
        legajoParaFiltrar = undefined; // Sin filtro de legajo
        console.log("👑 Administrador: Cargando TODOS los pedidos");
      } else if (hasRole("Picker") || hasRole("Despachador") || hasRole("Encargado de Envíos")) {
        // Picker/Despachador solo ve sus pedidos asignados
        rolPrincipal = "Picker";
        legajoParaFiltrar = legajoPicker;
        console.log(`📦 Picker/Despachador: Cargando solo pedidos del legajo ${legajoPicker}`);
      } else {
        // Otros roles (por si acaso)
        rolPrincipal = roles[0]; // Usar el primer rol
        legajoParaFiltrar = undefined;
      }

      const pedidosData = await obtenerPedidosAbonados(rolPrincipal, legajoParaFiltrar || undefined);
      
      console.log("✅ Pedidos cargados:", pedidosData.length);
      console.log("📦 Datos de pedidos:", pedidosData.map(p => ({
        pedido: p.numeroPedido,
        despachador: p.nombreDespachador,
        legajo: p.despachadorAsignado,
        empresa: p.empresaEnvio,
        estado: p.idEstado
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

    console.log("🔍 Filtrando pedidos - Total:", pedidos.length, "| Filtro:", filtroEstado);

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

    // Filtrar por estado (usando Number() para evitar problemas de tipo)
    if (filtroEstado === "pendientes") {
      // Pedidos con idEstado = 3 (Abonado, pendientes de despacho)
      pedidosFiltrados = pedidosFiltrados.filter(
        (pedido) => Number(pedido.idEstado) === 3
      );
      console.log("✅ Pendientes filtrados:", pedidosFiltrados.length);
    } else if (filtroEstado === "despachados") {
      // Pedidos con idEstado = 4 (Despachado)
      pedidosFiltrados = pedidosFiltrados.filter(
        (pedido) => Number(pedido.idEstado) === 4
      );
      console.log("✅ Despachados filtrados:", pedidosFiltrados.length);
    } else {
      console.log("🔵 Mostrando TODOS los pedidos");
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

  // Validar código de seguimiento
  const validarCodigoSeguimiento = (codigo: string): { valido: boolean; mensaje: string } => {
    // Limpiar espacios
    const codigoLimpio = codigo.trim();

    // Validar vacío
    if (!codigoLimpio) {
      return { valido: false, mensaje: "El código de seguimiento es obligatorio" };
    }

    // Validar longitud mínima (6 caracteres)
    if (codigoLimpio.length < 6) {
      return { valido: false, mensaje: "El código debe tener al menos 6 caracteres" };
    }

    // Validar longitud máxima (20 caracteres)
    if (codigoLimpio.length > 20) {
      return { valido: false, mensaje: "El código no puede superar los 20 caracteres" };
    }

    // Validar que sea alfanumérico (solo letras y números)
    const alfanumericoRegex = /^[a-zA-Z0-9]+$/;
    if (!alfanumericoRegex.test(codigoLimpio)) {
      return { valido: false, mensaje: "El código solo puede contener letras y números" };
    }

    // Validar que contenga al menos un número
    const tieneNumeroRegex = /\d/;
    if (!tieneNumeroRegex.test(codigoLimpio)) {
      return { valido: false, mensaje: "El código debe contener al menos un número" };
    }

    return { valido: true, mensaje: "" };
  };

  const handleDespachar = async () => {
    if (!pedidoSeleccionado) {
      setAlertMsg("No hay un pedido seleccionado.");
      setShowAlert(true);
      return;
    }

    // Validar código de seguimiento
    const validacion = validarCodigoSeguimiento(codigoSeguimiento);
    if (!validacion.valido) {
      setErrorValidacion(validacion.mensaje);
      setAlertMsg(validacion.mensaje);
      setShowAlert(true);
      return;
    }

    // Validar que el código sea diferente al anterior en modo edición
    if (modoEdicion && codigoSeguimiento.trim() === codigoOriginal.trim()) {
      const mensaje = "El nuevo código debe ser diferente al anterior";
      setErrorValidacion(mensaje);
      setAlertMsg(mensaje);
      setShowAlert(true);
      return;
    }

    // Limpiar error si la validación es exitosa
    setErrorValidacion("");

    try {
      setLoading(true);
      
      if (modoEdicion) {
        // Actualizar código existente
        await actualizarCodigoSeguimiento(pedidoSeleccionado.numeroPedido, codigoSeguimiento);
        setToastMsg(
          `Código de seguimiento actualizado para pedido #${pedidoSeleccionado.numeroPedido}`
        );
      } else {
        // Despachar pedido por primera vez
        await despacharPedido(pedidoSeleccionado.numeroPedido, codigoSeguimiento);
        setToastMsg(
          `Pedido #${pedidoSeleccionado.numeroPedido} despachado correctamente`
        );
      }
      
      setShowToast(true);
      setCodigoSeguimiento("");
      setPedidoSeleccionado(null);
      setModoEdicion(false);
      setCodigoOriginal("");
      await cargarPedidos(); // Recargar la lista
    } catch (error) {
      setAlertMsg(
        modoEdicion 
          ? "Error al actualizar el código de seguimiento. Intente nuevamente."
          : "Error al despachar el pedido. Intente nuevamente."
      );
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditarCodigo = (pedido: PedidoEnvio) => {
    setPedidoSeleccionado(pedido);
    setCodigoSeguimiento(pedido.codigoSeguimiento || "");
    setCodigoOriginal(pedido.codigoSeguimiento || "");
    setModoEdicion(true);
    setErrorValidacion(""); // Limpiar errores previos
  };

  const handleCancelarEdicion = () => {
    setPedidoSeleccionado(null);
    setCodigoSeguimiento("");
    setCodigoOriginal("");
    setModoEdicion(false);
    setErrorValidacion(""); // Limpiar errores
  };

  const handleExportarPendientes = () => {
    try {
      exportarPDFPendientesDespacho(pedidos);
      setToastPDFMsg("PDF de pedidos pendientes exportado correctamente");
      setShowToastPDF(true);
    } catch (error) {
      setAlertMsg("Error al exportar PDF de pedidos pendientes");
      setShowAlert(true);
    }
  };

  const handleExportarPorEmpresa = () => {
    try {
      exportarPDFPendientesPorEmpresa(pedidos);
      setToastPDFMsg("PDF de pedidos por empresa exportado correctamente");
      setShowToastPDF(true);
    } catch (error) {
      setAlertMsg("Error al exportar PDF de pedidos por empresa");
      setShowAlert(true);
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
                      {pedidos.filter((p) => Number(p.idEstado) === 3).length}
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
                      {pedidos.filter((p) => Number(p.idEstado) === 4).length}
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
                <IonCol size="12" sizeMd="8">
                  <IonSearchbar
                    value={searchTerm}
                    onIonInput={(e) => setSearchTerm(e.detail.value!)}
                    placeholder="Buscar por pedido, cliente o email..."
                    showClearButton="focus"
                    className="custom-searchbar"
                  />
                </IonCol>
              
              {/* Botones de exportación PDF */}
              <IonRow>
                <IonCol size="12">
                  <div className="pdf-export-buttons">
                    <IonButton
                      fill="solid"
                      size="small"
                      color="primary"
                      onClick={handleExportarPendientes}
                      disabled={pedidos.filter(p => Number(p.idEstado) === 3).length === 0}
                    >
                      <IonIcon icon={documentTextOutline} slot="start" />
                      Exportar Pendientes
                    </IonButton>
                    <IonButton
                      fill="solid"
                      size="small"
                      color="secondary"
                      onClick={handleExportarPorEmpresa}
                      disabled={pedidos.filter(p => Number(p.idEstado) === 3).length === 0}
                    >
                      <IonIcon icon={documentTextOutline} slot="start" />
                      Exportar Pendientes Por Empresa
                    </IonButton>
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
                    <div className="pedido-title-row">
                      <IonCardTitle>Pedido #{pedido.numeroPedido}</IonCardTitle>
                    </div>
                    <div className="pedido-badges-row">
                      {hasRole("Administrador") && pedido.nombreDespachador && pedido.nombreDespachador.trim() && (
                        <div className="despachador-badge">
                          <IonIcon icon={personOutline} style={{ fontSize: '14px', marginRight: '4px' }} />
                          {pedido.nombreDespachador.trim()}
                        </div>
                      )}
                      <IonBadge
                        color={Number(pedido.idEstado) === 4 ? "success" : "warning"}
                        className="status-badge"
                      >
                        {Number(pedido.idEstado) === 4 ? "Despachado" : "Pendiente"}
                      </IonBadge>
                      <div className="pedido-date">
                        <IonIcon icon={calendarOutline} />
                        <span>
                          {formatFechaHoraCorta(pedido.fechaPedido)}
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

                      {/*<IonCol size="12">
                        <div className="info-item">
                          <IonIcon icon={layersOutline} className="info-icon" />
                          <div>
                            <div className="info-label">Items</div>
                            <div className="info-value">
                              {pedido.total_items}
                            </div>
                          </div>
                        </div>
                      </IonCol>*/}

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

                      {/* Mostrar despachador asignado */}
                      {pedido.nombreDespachador && pedido.nombreDespachador.trim() && (
                        <IonCol size="12">
                          <div className="despachador-info-container">
                            <IonIcon icon={cubeOutline} className="despachador-info-icon" />
                            <div className="despachador-info-content">
                              <div className="despachador-info-label">
                                {hasRole("Administrador") ? "Despachador Asignado" : "Responsable"}
                              </div>
                              <div className="despachador-info-value">
                                {pedido.nombreDespachador.trim()}
                              </div>
                            </div>
                          </div>
                        </IonCol>
                      )}

                      {/* Mostrar código de seguimiento si existe */}
                      {pedido.codigoSeguimiento && (
                        <IonCol size="12">
                          <div className="tracking-info-container">
                            <IonIcon icon={checkmarkCircleOutline} className="tracking-icon" />
                            <div className="tracking-content">
                              <div className="tracking-label">Código de Seguimiento</div>
                              <div className="tracking-value">
                                {pedido.codigoSeguimiento}
                              </div>
                            </div>
                            <IonButton
                              fill="clear"
                              size="small"
                              color="primary"
                              onClick={() => handleEditarCodigo(pedido)}
                              title="Editar código de seguimiento"
                            >
                              <IonIcon icon={createOutline} />
                            </IonButton>
                          </div>
                        </IonCol>
                      )}

                      {/* Mostrar mensaje si está despachado pero sin código */}
                      {Number(pedido.idEstado) === 4 && !pedido.codigoSeguimiento && (
                        <IonCol size="12">
                          <div className="warning-tracking-container">
                            <IonIcon icon={timeOutline} className="warning-icon" />
                            <div className="warning-content">
                              <div className="warning-label">Código de Seguimiento</div>
                              <div className="warning-value">
                                Pedido despachado sin código asignado
                              </div>
                            </div>
                          </div>
                        </IonCol>
                      )}

                      {/* Solo mostrar botón si es estado 3 (Abonado/Pendiente) */}
                      {Number(pedido.idEstado) === 3 && (
                        <IonCol size="12">
                          <div className="action-container">
                            <IonButton
                              expand="block"
                              size="default"
                              color="primary"
                              onClick={() => {
                                setPedidoSeleccionado(pedido);
                                setCodigoSeguimiento("");
                                setErrorValidacion(""); // Limpiar errores previos
                                setModoEdicion(false); // Asegurar que no está en modo edición
                              }}
                            >
                              <IonIcon icon={carOutline} slot="start" />
                              Procesar Despacho
                            </IonButton>
                          </div>
                        </IonCol>
                      )}
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        {/* Paginación mejorada */}
        {totalPaginas > 1 && (
          <IonCard className="pagination-card">
            <IonCardContent>
              <div className="pagination-container">
                {/* Botón Volver */}
                <IonButton
                  color="warning"
                  size="small"
                  onClick={() => window.history.back()}
                >
                  Volver
                </IonButton>

                {/* Ir al inicio */}
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={goToFirstPage}
                  disabled={pagina === 1}
                  title="Primera página"
                >
                  <IonIcon icon={playSkipBackOutline} />
                </IonButton>

                {/* Página anterior */}
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={goToPreviousPage}
                  disabled={pagina === 1}
                  title="Página anterior"
                >
                  <IonIcon icon={playBackOutline} />
                </IonButton>

                {/* Indicador de página actual */}
                <div className="pagination-info">
                  <span className="page-indicator">
                    Página {pagina} de {totalPaginas}
                  </span>
                </div>

                {/* Página siguiente */}
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={goToNextPage}
                  disabled={pagina === totalPaginas}
                  title="Página siguiente"
                >
                  <IonIcon icon={playForwardOutline} />
                </IonButton>

                {/* Ir al final */}
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={goToLastPage}
                  disabled={pagina === totalPaginas}
                  title="Última página"
                >
                  <IonIcon icon={playSkipForwardOutline} />
                </IonButton>
              </div>

              {/* Información adicional de registros */}
              <div className="pagination-summary">
                Mostrando {(pagina - 1) * porPagina + 1} - {Math.min(pagina * porPagina, pedidosFiltrados.length)} de {pedidosFiltrados.length} pedidos
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Modal para código de seguimiento */}
        <IonModal
          isOpen={!!pedidoSeleccionado}
          onDidDismiss={handleCancelarEdicion}
          className="envios-tracking-modal"
          backdropDismiss={true}
          showBackdrop={true}
        >
          <div className="envios-modal-content">
            <div className="envios-modal-header">
              <h2>
                {modoEdicion ? "Editar Código de Seguimiento" : "Código de Seguimiento"}
              </h2>
              <p>Pedido #{pedidoSeleccionado?.numeroPedido}</p>
            </div>

            <div className="envios-modal-body">
              <IonItem className="envios-tracking-input">
                <IonLabel position="stacked">
                  <IonIcon icon={carOutline} className="envios-icon-margin" />
                  Código de Seguimiento
                </IonLabel>
                <IonInput
                  value={codigoSeguimiento}
                  placeholder="Ej: LP123456789AR"
                  onIonInput={(e) => {
                    const valor = e.detail.value!;
                    setCodigoSeguimiento(valor);
                    // Validar en tiempo real
                    if (valor.trim()) {
                      const validacion = validarCodigoSeguimiento(valor);
                      setErrorValidacion(validacion.valido ? "" : validacion.mensaje);
                    } else {
                      setErrorValidacion("");
                    }
                  }}
                  maxlength={20}
                  minlength={6}
                  clearInput
                  className={errorValidacion ? "ion-invalid ion-touched" : ""}
                />
              </IonItem>

              {/* Contador de caracteres */}
              <div className="envios-char-counter">
                {codigoSeguimiento.length}/20 caracteres
              </div>

              {/* Mensaje de error de validación */}
              {errorValidacion && (
                <div className="envios-error-message">
                  <IonIcon icon={closeOutline} />
                  <span>{errorValidacion}</span>
                </div>
              )}

              {modoEdicion && codigoOriginal && (
                <div className="envios-info-message envios-info-message-adjusted">
                  <div className="envios-info-content" style={{ color: '#ffffff' }}>
                    <IonIcon icon={timeOutline} />
                    <span>Código anterior: <strong>{codigoOriginal}</strong></span>
                  </div>
                </div>
              )}
              
              {!modoEdicion && !errorValidacion && (
                <div className="envios-warning-message envios-warning-message-adjusted">
                  <div className="envios-warning-content">
                    <IonIcon icon={timeOutline} />
                    <span>Ingrese el código para completar el despacho</span>
                  </div>
                </div>
              )}
            </div>

            <div className="envios-modal-actions envios-modal-actions-adjusted">
              <IonButton
                expand="block"
                onClick={handleDespachar}
                disabled={loading || !codigoSeguimiento.trim() || !!errorValidacion}
                color="primary"
                className="envios-modal-btn-primary"
              >
                {loading ? (
                  <>
                    <IonSpinner name="circular" className="envios-icon-margin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <IonIcon icon={checkmarkCircleOutline} className="envios-icon-margin" />
                    {modoEdicion ? "Actualizar Código" : "Marcar como Despachado"}
                  </>
                )}
              </IonButton>

              <IonButton
                expand="block"
                fill="outline"
                color="danger"
                onClick={handleCancelarEdicion}
                className="envios-modal-btn-cancel"
              >
                <IonIcon icon={closeOutline} className="envios-icon-margin" />
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

        {/* Toast para PDF */}
        <IonToast
          isOpen={showToastPDF}
          message={toastPDFMsg}
          duration={3000}
          color="primary"
          onDidDismiss={() => setShowToastPDF(false)}
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
