// src/pages/Pedidos/Pedidos.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { obtenerClaseDeEstado } from "../../utils/pedidosUtils";
import { obtenerIconoEstado } from "../../utils/pedidosUtils";
import { formatFechaHoraCorta } from "../../utils/dateFormatters";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonMenuButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonAlert,
  IonItem,
  IonLabel,
  IonTextarea,
  useIonViewWillEnter,
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonFooter,
} from "@ionic/react";
import {
  cargarPedidos,
  filtrarPedidos,
  filtrarPedidosPorFecha,
  Pedido,
  marcarPedidoComoAbonado,
  fetchPickers,
  asignarPicker,
  handleConfirmFinalizar,
  obtenerPickerAsignado,
  exportarPDF,
  handleCancelarPedido,
  iniciarFlujoPago,
  confirmarAbono,
  limpiarEstadoAbono,
  toggleEstadoFiltro,
  limpiarFiltrosEstado,
  obtenerNombreEstado,
} from "../../utils/pedidosUtils";
import { useHistory, useLocation } from "react-router-dom";
import axiosInstance from "../../config/axios";
import { pencil, trash, documentText, chevronDown, cash, close, notificationsOutline, checkmarkCircleOutline } from "ionicons/icons";
import { IonPopover, IonList, IonModal } from "@ionic/react";
import "./Pedidos.css";

const Pedidos: React.FC = () => {
  const { username } = useAuth(); // Obtener el usuario autenticado
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showPickerDropdown, setShowPickerDropdown] = useState<string | null>(
    null
  );
  const [pickers, setPickers] = useState<any[]>([]);
  const [selectedPicker, setSelectedPicker] = useState<any>(null);
  const [pedidoParaAsignar, setPedidoParaAsignar] = useState<string | null>(
    null
  );
  const [showConfirmAsignar, setShowConfirmAsignar] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [showFinalizarConfirm, setShowFinalizarConfirm] = useState(false);
  const [pedidoParaFinalizar, setPedidoParaFinalizar] = useState<string | null>(
    null
  );
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState<string | null>(
    null
  );
  const [motivosCancelacion, setMotivosCancelacion] = useState<any[]>([]);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<number | null>(
    null
  );
  const [observacionPersonalizada, setObservacionPersonalizada] =
    useState<string>("");
  const [showMotivoModal, setShowMotivoModal] = useState(false);

  // Estados para manejar errores de autorización
  const [showAuthError, setShowAuthError] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState("");

  // Estados para las alertas de abono
  const [showConfirmAbono, setShowConfirmAbono] = useState(false);
  const [showAbonoExitoso, setShowAbonoExitoso] = useState(false);
  const [pedidoParaAbonar, setPedidoParaAbonar] = useState<string | null>(null);

  // Estados para el filtro por estados
  const [estadosFiltrados, setEstadosFiltrados] = useState<string[]>([]);
  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);

  // Estados para el filtro de fechas
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);

  // Estados para notificaciones de problemas de picking
  const [notificacionesProblemas, setNotificacionesProblemas] = useState<any[]>([]);
  const [showNotificacionesModal, setShowNotificacionesModal] = useState(false);
  const [idUsuarioActual, setIdUsuarioActual] = useState<number | null>(null);

  // Lista de todos los estados posibles
  const todosLosEstados = [
    { id: 1, nombre: "En Curso", clase: "en-curso" },
    { id: 2, nombre: "Pendiente de Pago", clase: "pendiente-pago" },
    { id: 3, nombre: "Abonado", clase: "abonado" },
    { id: 4, nombre: "Despachado", clase: "despachado" },
    { id: 5, nombre: "Finalizado", clase: "finalizado" },
    { id: 6, nombre: "Cancelado", clase: "cancelado" },
  ];

  const porPagina = 6;
  const history = useHistory();
  const location = useLocation();

  // Función para actualizar pedidos y resetear estados
  const actualizarPedidos = async () => {
    try {
      const pedidosActualizados = await cargarPedidos();
      setPedidos(pedidosActualizados);
      // Resetear paginación al actualizar
      setPagina(1);
    } catch (error: any) {
      console.error("Error al cargar pedidos:", error);
      setAuthErrorMsg(error.message);
      setShowAuthError(true);
    }
  };

  // Función para cargar notificaciones de problemas de picking
  const cargarNotificacionesProblemas = async () => {
    try {
      // Obtener ID del usuario actual
      const res = await axiosInstance.get('/api/auth/profile');
      const idUsuario = res.data.idUsuario;
      setIdUsuarioActual(idUsuario);

      // Obtener TODAS las notificaciones del usuario
      const notifRes = await axiosInstance.get(`/api/pedidos/notificaciones/${idUsuario}`);

      // Filtrar solo notificaciones de problemas de picking
      // Excluir pedidos completados (estados 2-6) o con flag completado=1
      const notificacionesProblemasActivas = notifRes.data.filter(
        (n: any) =>
          n.tipoNotificacion === 'problema_picking' &&
          // Excluir pedidos completados
          ![2, 3, 4, 5, 6].includes(n.estadoPedido) &&
          n.completado !== 1 &&
          // Excluir problemas ya resueltos
          n.estadoResolucion !== 'resuelto'
      );

      setNotificacionesProblemas(notificacionesProblemasActivas);
    } catch (error) {
      console.error('Error al cargar notificaciones de problemas:', error);
    }
  };

  // Función para marcar una notificación como leída
  const marcarProblemaLeido = async (idNotificacion: number) => {
    try {
      await axiosInstance.put(`/api/pedidos/notificaciones/${idNotificacion}/marcar-leida`);
      // Recargar notificaciones después de marcar como leída
      await cargarNotificacionesProblemas();
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  // Función para verificar si un pedido tiene problemas pendientes
  const verificarProblemasPendientes = (numeroPedido: string) => {
    const problemasPendientes = notificacionesProblemas.filter(
      (n) => n.numeroPedido === numeroPedido && n.estadoResolucion === 'pendiente'
    );
    return {
      tieneProblemas: problemasPendientes.length > 0,
      cantidad: problemasPendientes.length
    };
  };

  // Actualizar cuando se entra a la vista (navegación Ionic)
  useIonViewWillEnter(() => {
    actualizarPedidos();
    cargarNotificacionesProblemas();
  });

  // Actualizar cuando cambia la ubicación (redirecciones)
  useEffect(() => {
    if (location.pathname === '/pedidos') {
      actualizarPedidos();
      cargarNotificacionesProblemas();
    }
  }, [location]);

  const mostrarTodos = busqueda === " ";

  // Aplicar filtros en secuencia: texto, estados y fechas
  let pedidosFiltradosTemp = filtrarPedidos(
    pedidos,
    busqueda === " " ? "" : busqueda
  );

  // Filtro por estados
  pedidosFiltradosTemp = pedidosFiltradosTemp.filter((pedido) => {
    const cumpleEstado =
      estadosFiltrados.length === 0 ||
      estadosFiltrados.includes(pedido.idEstado.toString());
    return cumpleEstado;
  });

  // Filtro por fechas
  pedidosFiltradosTemp = filtrarPedidosPorFecha(
    pedidosFiltradosTemp,
    fechaDesde,
    fechaHasta
  );

  // Ordenar por fecha
  const pedidosFiltrados = pedidosFiltradosTemp.sort(
    (a, b) =>
      (b.fechaPedido ? new Date(b.fechaPedido).getTime() : 0) -
      (a.fechaPedido ? new Date(a.fechaPedido).getTime() : 0)
  );
  const totalPaginas = Math.ceil(pedidosFiltrados.length / porPagina);
  const pedidosPaginados = pedidosFiltrados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );
  const pedidosAMostrar = mostrarTodos
    ? pedidosFiltrados
    : busqueda.trim() === ""
    ? pedidosFiltrados.slice(0, 5)
    : pedidosFiltrados;

  // --- FUNCIONES UTILITARIAS Y DE NEGOCIO ---
  // Ahora delegadas a pedidosUtils.ts
  // handleCancelarPedido, iniciarFlujoPago, confirmarAbono, limpiarEstadoAbono,
  // toggleEstadoFiltro, limpiarFiltrosEstado, obtenerNombreEstado

  // Título dinámico SOLO para el PDF exportado
  const tituloPDF = (() => {
    if (estadosFiltrados.length === 0) return "Todos los pedidos";
    if (estadosFiltrados.length === 1) {
      const estado = todosLosEstados.find(
        (e) => e.id.toString() === estadosFiltrados[0]
      );
      return estado ? `Pedidos: ${estado.nombre}` : "Pedidos filtrados";
    }
    return "Pedidos: Varios estados";
  })();

  return (
    <IonPage className="pedidos-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>PEDIDOS</IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            onClick={() => setShowNotificacionesModal(true)}
            className="notifications-btn"
          >
            <IonIcon icon={notificationsOutline} color="light" size="medium" />
            {notificacionesProblemas.filter(n => n.leida === 0).length > 0 && (
              <IonBadge color="danger" className="notifications-badge">
                {notificacionesProblemas.filter(n => n.leida === 0).length}
              </IonBadge>
            )}
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="pedidos-content">
        <IonGrid>
          {/* Fila 1: Buscador */}
          <IonRow>
            <IonCol size="10">
              <div className="pedidos-buscador">
                <IonInput
                  placeholder="Buscar por cliente, fecha, N° de pedido o documento"
                  value={busqueda === " " ? "" : busqueda}
                  onIonChange={(e) => setBusqueda(e.detail.value!)}
                  clearInput
                />
              </div>
            </IonCol>
            <IonCol size="2" className="ion-text-right pedidos-total-col">
              <span className="pedidos-total-badge">
                Total: {pedidosFiltrados.length}
              </span>
            </IonCol>
          </IonRow>

          {/* Fila 1.5: Filtros de fecha */}
          <IonRow className="fecha-filtros-row">
            <IonCol size="6">
              <div className="fecha-filtro-container">
                <label className="fecha-filtro-label">Desde:</label>
                <DatePicker
                  selected={fechaDesde}
                  onChange={(date: Date | null) => setFechaDesde(date)}
                  placeholderText="Seleccionar fecha desde"
                  dateFormat="dd/MM/yyyy"
                  className="fecha-picker-input"
                  isClearable
                />
              </div>
            </IonCol>
            <IonCol size="6">
              <div className="fecha-filtro-container">
                <label className="fecha-filtro-label">Hasta:</label>
                <DatePicker
                  selected={fechaHasta}
                  onChange={(date: Date | null) => setFechaHasta(date)}
                  placeholderText="Seleccionar fecha hasta"
                  dateFormat="dd/MM/yyyy"
                  className="fecha-picker-input"
                  isClearable
                  minDate={fechaDesde || undefined}
                />
              </div>
            </IonCol>
          </IonRow>
          {/* Fila 2: Tabla */}
          <IonRow>
            <IonCol size="12">
              <div className="pedidos-table-wrapper">
                <IonGrid className="pedidos-table">
                  <IonRow className="table-header">
                    <IonCol className="text-center">
                      <strong>N° Pedido</strong>
                    </IonCol>
                    <IonCol className="text-center">
                      <IonButton
                        fill="clear"
                        className="estado-filter-button"
                        id="estado-filter-trigger"
                        onClick={() =>
                          setShowEstadoDropdown(!showEstadoDropdown)
                        }
                      >
                        <strong>Estado</strong>
                        <IonIcon icon={chevronDown} />
                        {estadosFiltrados.length > 0 && (
                          <span className="filter-badge">
                            {estadosFiltrados.length}
                          </span>
                        )}
                      </IonButton>
                    </IonCol>
                    <IonCol className="text-center">
                      <strong>Cliente</strong>
                    </IonCol>
                    <IonCol className="text-center">
                      <strong>Fecha y Hora</strong>
                    </IonCol>
                    <IonCol className="text-center">
                      <strong>Acciones</strong>
                    </IonCol>
                  </IonRow>
                  {pedidosPaginados.map((pedido) => (
                    <IonRow key={pedido.numeroPedido} className="table-row">
                      <IonCol className="text-center">
                        {pedido.numeroPedido}
                      </IonCol>
                      <IonCol className="text-center">
                        <span
                          className={`status-badge ${obtenerClaseDeEstado(
                            pedido.EstadoPedido?.tipoEstado || ""
                          )}`}
                        >
                          <IonIcon
                            icon={obtenerIconoEstado(
                              pedido.EstadoPedido?.tipoEstado || ""
                            )}
                            className="estado-icono"
                          />
                          {pedido.EstadoPedido?.tipoEstado || "Sin estado"}
                        </span>
                      </IonCol>
                      <IonCol className="text-center">
                        {pedido.Cliente?.Persona
                          ? `${pedido.Cliente.Persona.nombre} ${
                              pedido.Cliente.Persona.apellido ?? ""
                            }`.trim()
                          : "Sin cliente"}
                      </IonCol>
                      <IonCol className="text-center">
                        {pedido.fechaPedido
                          ? formatFechaHoraCorta(pedido.fechaPedido)
                          : ""}
                      </IonCol>
                      <IonCol className="text-center">
                        <div className="action-buttons">
                          {/* Botón Editar solo para estados permitidos */}
                          {(() => {
                            const estado = pedido.EstadoPedido?.tipoEstado
                              ?.trim()
                              .toLowerCase();
                            const idEstado = pedido.EstadoPedido?.idEstado;
                            const puedeEditar =
                              estado === "en curso" ||
                              estado === "pendiente de pago";
                            // Solo NO puede cancelar si está Finalizado (5) o ya Cancelado (6)
                            const puedeCancelar =
                              idEstado !== 5 && idEstado !== 6;
                            return (
                              <>
                                {puedeEditar && (
                                  <IonButton
                                    fill="clear"
                                    onClick={() =>
                                      history.push(
                                        `/alta-pedido/${pedido.numeroPedido}`
                                      )
                                    }
                                  >
                                    <IonIcon icon={pencil} color="primary" />
                                  </IonButton>
                                )}
                                {/* Botón Cancelar visible salvo si está Finalizado */}
                                {puedeCancelar && (
                                  <IonButton
                                    fill="clear"
                                    onClick={() =>
                                      handleCancelarPedido(
                                        pedido.numeroPedido,
                                        setPedidoParaCancelar,
                                        setMotivosCancelacion,
                                        setMotivoSeleccionado,
                                        setShowMotivoModal,
                                        setAlertMsg,
                                        setShowAlert
                                      )
                                    }
                                    className="cancel-btn"
                                  >
                                    <IonIcon icon={trash} color="danger" />
                                  </IonButton>
                                )}
                              </>
                            );
                          })()}
                          <IonButton
                            fill="clear"
                            onClick={() =>
                              history.push(
                                `/detalle-pedido/${pedido.numeroPedido}`
                              )
                            }
                            className="detail-btn"
                          >
                            <IonIcon icon={documentText} color="medium" />
                          </IonButton>
                          {/* Botón Asignar Picker */}
                          {(() => {
                            const estado = pedido.EstadoPedido?.tipoEstado
                              ?.trim()
                              .toLowerCase();
                            if (estado === "en curso") {
                              return (
                                <IonButton
                                  fill="outline"
                                  color="success"
                                  onClick={async (e) => {
                                    // Verificar si hay problemas pendientes
                                    const { tieneProblemas, cantidad } = verificarProblemasPendientes(pedido.numeroPedido);
                                    if (tieneProblemas) {
                                      setAlertMsg(
                                        `Este pedido tiene ${cantidad} problema(s) de picking pendiente(s). Debe resolver los problemas antes de reasignar el picker.`
                                      );
                                      setShowAlert(true);
                                      return;
                                    }

                                    const pickerAsignado =
                                      await obtenerPickerAsignado(
                                        pedido.numeroPedido
                                      );
                                    if (
                                      pickerAsignado &&
                                      pickerAsignado.nombre
                                    ) {
                                      setAlertMsg(
                                        `Este pedido ya fue asignado al picker '${pickerAsignado.nombre}'. ¿Desea cambiarlo?`
                                      );
                                      setShowAlert(true);
                                      setShowPickerDropdown(null);
                                      setPedidoParaAsignar(pedido.numeroPedido);
                                      fetchPickers(
                                        setPickers,
                                        setAlertMsg,
                                        setShowAlert
                                      );
                                    } else {
                                      setShowPickerDropdown(
                                        pedido.numeroPedido
                                      );
                                      setPedidoParaAsignar(pedido.numeroPedido);
                                      fetchPickers(
                                        setPickers,
                                        setAlertMsg,
                                        setShowAlert
                                      );
                                    }
                                  }}
                                  className="asignar-picker-btn"
                                >
                                  + <IonIcon icon={chevronDown} slot="end" />
                                </IonButton>
                              );
                            }
                            return null;
                          })()}
                          {/* Botón Abonar */}
                          {(() => {
                            const estado = pedido.EstadoPedido?.tipoEstado
                              ?.trim()
                              .toLowerCase();
                            if (estado === "pendiente de pago") {
                              return (
                                <IonButton
                                  fill="outline"
                                  color="warning"
                                  onClick={() =>
                                    iniciarFlujoPago(
                                      pedido.numeroPedido,
                                      setPedidoParaAbonar,
                                      setShowConfirmAbono
                                    )
                                  }
                                  className="abonar-btn"
                                >
                                  <IonIcon icon={cash} slot="icon-only" />
                                </IonButton>
                              );
                            }
                            return null;
                          })()}
                          {/* Botón Finalizar para estado 'despachado' */}
                          {(() => {
                            const estado = pedido.EstadoPedido?.tipoEstado
                              ?.trim()
                              .toLowerCase();
                            if (estado === "despachado") {
                              return (
                                <IonButton
                                  fill="outline"
                                  color="success"
                                  onClick={() => {
                                    setPedidoParaFinalizar(pedido.numeroPedido);
                                    setShowFinalizarConfirm(true);
                                  }}
                                  className="finalizar-btn"
                                >
                                  Finalizar
                                </IonButton>
                              );
                            }
                            return null;
                          })()}
                          {/* Popover para seleccionar picker */}
                          <IonPopover
                            isOpen={showPickerDropdown === pedido.numeroPedido}
                            onDidDismiss={() => setShowPickerDropdown(null)}
                            className="picker-selection-popover"
                            showBackdrop={true}
                            dismissOnSelect={true}
                            side="bottom"
                            alignment="center"
                          >
                            <div className="picker-modal-content">
                              <div className="picker-modal-header">
                                <h3 className="picker-modal-header-title">
                                  Seleccionar Picker
                                </h3>
                              </div>
                              <IonList className="picker-modal-list">
                                {pickers.length === 0 && (
                                  <IonItem lines="none" className="picker-modal-empty">
                                    <IonLabel className="picker-modal-empty-label">
                                      No hay pickers disponibles
                                    </IonLabel>
                                  </IonItem>
                                )}
                                {pickers.map((picker, index) => (
                                  <IonItem
                                    button
                                    lines="none"
                                    key={picker.id || index}
                                    className="picker-modal-item"
                                    onClick={() => {
                                      console.log(
                                        "📌 Picker seleccionado:",
                                        picker
                                      );
                                      setSelectedPicker(picker);
                                      setShowConfirmAsignar(true);
                                      setShowPickerDropdown(null);
                                    }}
                                  >
                                    <IonLabel className="picker-modal-item-label">
                                      <div className="picker-modal-item-content">
                                        <div className="picker-modal-item-name">
                                          {picker.nombre}
                                        </div>
                                        <div className="picker-modal-item-legajo">
                                          Legajo: {picker.legajo}
                                        </div>
                                      </div>
                                    </IonLabel>
                                  </IonItem>
                                ))}
                              </IonList>
                            </div>
                          </IonPopover>
                        </div>
                      </IonCol>
                    </IonRow>
                  ))}
                </IonGrid>
              </div>
            </IonCol>
          </IonRow>
          {/* Paginación */}
          {totalPaginas > 1 && (
            <IonRow className="pedidos-paginacion-row">
              <IonCol size="12" className="pedidos-paginacion-col">
                <IonButton
                  color="warning"
                  size="small"
                  onClick={() => history.push("/dashboard")}
                  style={{ marginRight: '16px' }}
                >
                  Volver
                </IonButton>
                <IonButton
                  size="small"
                  disabled={pagina === 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </IonButton>
                <span className="pedidos-paginacion-text">
                  Página {pagina} de {totalPaginas} &nbsp;|&nbsp; Mostrando{" "}
                  {pedidosFiltrados.length === 0
                    ? 0
                    : (pagina - 1) * porPagina + 1}
                  -{Math.min(pagina * porPagina, pedidosFiltrados.length)} de{" "}
                  {pedidosFiltrados.length}
                </span>
                <IonButton
                  size="small"
                  disabled={pagina === totalPaginas}
                  onClick={() =>
                    setPagina((p) => Math.min(totalPaginas, p + 1))
                  }
                >
                  Siguiente
                </IonButton>
              </IonCol>
            </IonRow>
          )}
          {/* Fila 3: Botón */}
          <IonRow>
            <IonCol size="12">
              <IonButton routerLink="/alta-pedido" expand="block">
                Nuevo Pedido
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonButton
                expand="block"
                onClick={() => {
                  // Obtener nombres de los estados seleccionados
                  let estadosSeleccionados: string[] = [];
                  if (estadosFiltrados.length > 0) {
                    estadosSeleccionados = estadosFiltrados
                      .map((id) => {
                        const estado = todosLosEstados.find(
                          (e) => e.id.toString() === id
                        );
                        return estado ? estado.nombre : id;
                      })
                      .filter(Boolean);
                  }
                  exportarPDF(
                    pedidosFiltrados,
                    tituloPDF,
                    estadosSeleccionados
                  );
                }}
                disabled={pedidosFiltrados.length === 0}
              >
                Exportar lista de pedidos a PDF
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Advertencia"
          message={alertMsg}
          buttons={
            alertMsg === "El pedido fue marcado como finalizado correctamente." ||
            alertMsg === "Picker asignado correctamente"
              ? [{ text: "Aceptar", handler: () => setShowAlert(false) }]
              : [
                  {
                    text: "Cancelar",
                    role: "cancel",
                    handler: () => setShowAlert(false),
                  },
                  {
                    text: "Cambiar Picker",
                    handler: () => {
                      // Verificar si hay problemas pendientes antes de cambiar picker
                      if (!pedidoParaAsignar) return;
                      
                      const { tieneProblemas, cantidad } = verificarProblemasPendientes(pedidoParaAsignar);
                      if (tieneProblemas) {
                        setAlertMsg(
                          `Este pedido tiene ${cantidad} problema(s) de picking pendiente(s). Debe resolver los problemas antes de reasignar el picker.`
                        );
                        return;
                      }
                      setShowPickerDropdown(pedidoParaAsignar);
                      setShowAlert(false);
                    },
                  },
                ]
          }
        />
        <IonAlert
          isOpen={showDeleteSuccess}
          message="El pedido fue cancelado correctamente."
          buttons={[
            {
              text: "Aceptar",
              handler: () => setShowDeleteSuccess(false),
            },
          ]}
        />
        <IonAlert
          isOpen={showConfirmAsignar}
          onDidDismiss={() => setShowConfirmAsignar(false)}
          header="Confirmar asignación"
          message={`¿Asignar picker '${selectedPicker?.nombre}' al pedido ${pedidoParaAsignar}?`}
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
              handler: () => setShowConfirmAsignar(false),
            },
            {
              text: "Asignar",
              handler: () =>
                asignarPicker(
                  pedidoParaAsignar,
                  selectedPicker,
                  setAlertMsg,
                  setShowAlert,
                  setShowConfirmAsignar,
                  setShowPickerDropdown,
                  setSelectedPicker,
                  setPedidoParaAsignar,
                  setPedidos
                ),
            },
          ]}
        />
        <IonAlert
          isOpen={showFinalizarConfirm}
          onDidDismiss={() => setShowFinalizarConfirm(false)}
          header="Confirmar"
          message={`¿Desea dar como Finalizado el Pedido '${pedidoParaFinalizar}'?`}
          buttons={[
            {
              text: "Finalizar",
              handler: async () => {
                await handleConfirmFinalizar(
                  pedidoParaFinalizar,
                  setAlertMsg,
                  setShowAlert,
                  setShowFinalizarConfirm,
                  setPedidoParaFinalizar,
                  setPedidos
                );
              },
            },
          ]}
        />
        <IonModal
          isOpen={showMotivoModal}
          onDidDismiss={() => {
            setShowMotivoModal(false);
            setMotivoSeleccionado(null);
            setObservacionPersonalizada("");
          }}
          className="motivo-cancelacion-modal"
        >
          <div className="motivo-cancelacion-content">
            <h2 className="motivo-cancelacion-header">Motivo de cancelación</h2>
            <div className="motivo-cancelacion-pedido-info">
              Pedido: {pedidoParaCancelar}
            </div>
            <div className="motivo-cancelacion-options">
              {motivosCancelacion.map((motivo) => (
                <div
                  key={motivo.idMotivo}
                  className={`motivo-option ${
                    motivoSeleccionado === motivo.idMotivo ? "selected" : ""
                  }`}
                  onClick={() => setMotivoSeleccionado(motivo.idMotivo)}
                >
                  <input
                    type="radio"
                    name="motivo"
                    value={motivo.idMotivo}
                    checked={motivoSeleccionado === motivo.idMotivo}
                    onChange={() => setMotivoSeleccionado(motivo.idMotivo)}
                  />
                  <div className="motivo-option-content">
                    <div className="motivo-option-radio"></div>
                    <div className="motivo-option-text">
                      {motivo.descripcion}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Campo de observación personalizada - solo visible cuando el motivo es "Otro" (id 6) */}
            {motivoSeleccionado === 6 && (
              <div className="observacion-personalizada">
                <IonItem className="observacion-input-item">
                  <IonLabel position="stacked">
                    Observación personalizada *
                  </IonLabel>
                  <IonTextarea
                    value={observacionPersonalizada}
                    onIonInput={(e: any) =>
                      setObservacionPersonalizada(e.detail.value!)
                    }
                    placeholder="Ingrese el motivo de cancelación..."
                    rows={3}
                    maxlength={500}
                    counter={true}
                    className="observacion-textarea"
                  />
                </IonItem>
              </div>
            )}
            <div className="motivo-cancelacion-buttons">
              <IonButton
                onClick={() => {
                  setShowMotivoModal(false);
                  setPedidoParaCancelar(null);
                  setMotivoSeleccionado(null);
                  setObservacionPersonalizada("");
                }}
                className="motivo-cancelacion-btn-cancelar"
              >
                Cancelar
              </IonButton>
              <IonButton
                disabled={
                  !motivoSeleccionado ||
                  !pedidoParaCancelar ||
                  (motivoSeleccionado === 6 && !observacionPersonalizada.trim())
                }
                className="motivo-cancelacion-btn-confirmar"
                onClick={async () => {
                  if (!motivoSeleccionado || !pedidoParaCancelar || !username)
                    return;

                  // Validar observación si el motivo es "Otro" (id 6)
                  if (
                    motivoSeleccionado === 6 &&
                    !observacionPersonalizada.trim()
                  ) {
                    setAlertMsg(
                      "La observación es requerida cuando el motivo es 'Otro'"
                    );
                    setShowAlert(true);
                    return;
                  }

                  try {
                    // Primero obtener el ID del usuario por su nombre de usuario
                    const userResponse = await fetch(
                      `/api/auth/usuarios/buscar-por-nombre/${username}`,
                      {
                        headers: {
                          nombreUsuario: username, // Agregar header de autorización si es necesario
                        },
                      }
                    );
                    let idUsuarioCancelo = null;

                    if (userResponse.ok) {
                      const userData = await userResponse.json();
                      idUsuarioCancelo = userData.idUsuario;
                    }

                    if (!idUsuarioCancelo) {
                      setAlertMsg(
                        "Error: No se pudo identificar el usuario que cancela"
                      );
                      setShowAlert(true);
                      return;
                    }

                    // Preparar el cuerpo de la petición
                    const requestBody: any = {
                      idMotivo: motivoSeleccionado,
                      idUsuarioCancelo: idUsuarioCancelo,
                    };

                    // Solo incluir observación si el motivo es "Otro" y hay texto
                    if (
                      motivoSeleccionado === 6 &&
                      observacionPersonalizada.trim()
                    ) {
                      requestBody.observacionCancelacion =
                        observacionPersonalizada.trim();
                    }

                    // Proceder con la cancelación
                    const response = await fetch(
                      `/api/pedidos/${pedidoParaCancelar}/cancelar`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          nombreUsuario: username, // Agregar header de autorización
                        },
                        body: JSON.stringify(requestBody),
                      }
                    );

                    if (!response.ok) {
                      const errorData = await response.json();
                      setAlertMsg(
                        errorData.error || "Error al cancelar el pedido."
                      );
                      setShowAlert(true);
                      setShowMotivoModal(false);
                      setPedidoParaCancelar(null);
                      setMotivoSeleccionado(null);
                      setObservacionPersonalizada("");
                      return;
                    }

                    setShowDeleteSuccess(true);
                    cargarPedidos().then(setPedidos);
                    setShowMotivoModal(false);
                    setPedidoParaCancelar(null);
                    setMotivoSeleccionado(null);
                    setObservacionPersonalizada("");
                  } catch (error) {
                    setAlertMsg("Error de conexión al cancelar el pedido.");
                    setShowAlert(true);
                    setShowMotivoModal(false);
                    setPedidoParaCancelar(null);
                    setMotivoSeleccionado(null);
                    setObservacionPersonalizada("");
                  }
                }}
              >
                Confirmar Cancelación
              </IonButton>
            </div>
          </div>
        </IonModal>

        {/* Alerta de Error de Autorización */}
        <IonAlert
          isOpen={showAuthError}
          onDidDismiss={() => setShowAuthError(false)}
          header="Acceso Denegado"
          message={authErrorMsg}
          buttons={[
            {
              text: "Entendido",
              handler: () => {
                setShowAuthError(false);
                // Opcional: redirigir al dashboard o página principal
                history.push("/dashboard");
              },
            },
          ]}
        />
        {/* Alerta de Confirmación de Abono */}
        <IonAlert
          isOpen={showConfirmAbono}
          onDidDismiss={() => setShowConfirmAbono(false)}
          header="Confirmar Abono"
          message={`¿Está seguro de que desea marcar como abonado el pedido '${pedidoParaAbonar}'?`}
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
              handler: () => setShowConfirmAbono(false),
            },
            {
              text: "Aceptar",
              handler: () => {
                confirmarAbono(
                  pedidoParaAbonar,
                  setShowConfirmAbono,
                  setShowAbonoExitoso,
                  setPedidos,
                  setAlertMsg,
                  setShowAlert
                );
              },
            },
          ]}
        />
        {/* Alerta de Éxito al Abonar */}
        <IonAlert
          isOpen={showAbonoExitoso}
          onDidDismiss={() =>
            limpiarEstadoAbono(setShowAbonoExitoso, setPedidoParaAbonar)
          }
          header="Éxito"
          message="El pedido fue abonado correctamente."
          buttons={[
            {
              text: "Aceptar",
              handler: () => {
                limpiarEstadoAbono(setShowAbonoExitoso, setPedidoParaAbonar);
              },
            },
          ]}
        />

        {/* Popover para filtrar por estados */}
        <IonPopover
          isOpen={showEstadoDropdown}
          onDidDismiss={() => setShowEstadoDropdown(false)}
          trigger="estado-filter-trigger"
          triggerAction="click"
          showBackdrop={true}
          className="estado-filter-popover"
          side="bottom"
          alignment="center"
          dismissOnSelect={false}
          size="auto"
        >
          <IonContent>
            <div className="estado-filter-header">
              <strong>Filtrar por Estado</strong>
              {estadosFiltrados.length > 0 && (
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={() => limpiarFiltrosEstado(setEstadosFiltrados)}
                  className="clear-filter-btn"
                >
                  <IonIcon
                    icon={close}
                    color="danger"
                    style={{ fontSize: 24 }}
                  />
                </IonButton>
              )}
            </div>
            <IonList>
              {todosLosEstados.map((estado) => (
                <IonItem
                  key={estado.id}
                  button
                  onClick={() =>
                    toggleEstadoFiltro(
                      estado.id.toString(),
                      setEstadosFiltrados
                    )
                  }
                  className="estado-filter-item-row"
                >
                  <IonLabel className="ion-text-center">
                    <div className="estado-filter-item">
                      <span className="estado-filter-checkbox">
                        {estadosFiltrados.includes(estado.id.toString())
                          ? "✓"
                          : ""}
                      </span>
                      <span className={`status-badge status--${estado.clase}`}>
                        {obtenerNombreEstado(
                          estado.id.toString(),
                          todosLosEstados
                        )}
                      </span>
                    </div>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonContent>
        </IonPopover>

        {/* Modal de notificaciones de problemas de picking */}
        <IonModal 
          isOpen={showNotificacionesModal} 
          onDidDismiss={() => setShowNotificacionesModal(false)}
          className="notificaciones-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Problemas Reportados</IonTitle>
              {/*<IonButton 
                slot="end" 
                fill="clear" 
                onClick={() => setShowNotificacionesModal(false)}
              >
                <IonIcon icon={close} />
              </IonButton>*/}
            </IonToolbar>
          </IonHeader>
          
          <IonContent>
            {notificacionesProblemas.length === 0 ? (
              <div className="notificaciones-empty">
                <IonIcon icon={notificationsOutline} />
                <h3>No hay problemas reportados</h3>
                <p>Todos los pedidos están en orden</p>
              </div>
            ) : (
              <IonList>
                {notificacionesProblemas.map((notif) => (
                  <IonCard 
                    key={notif.idNotificacion} 
                    className={`notificacion-card ${notif.leida === 1 ? 'notificacion-leida' : ''}`}
                  >
                    <IonCardHeader>
                      {/* Badge "Nueva" o "Leída" */}
                      <IonBadge 
                        color={notif.leida === 1 ? "light" : "danger"}
                        className="notificacion-estado-badge"
                      >
                        {notif.leida === 1 ? "✓ Leída" : "🔔 Nueva"}
                      </IonBadge>
                      
                      {/* Badge para mostrar el picker si es admin */}
                      {notif.idUsuarioDestino !== idUsuarioActual && (
                        <IonBadge color="warning" className="notificacion-picker-badge">
                          👤 Picker: {notif.pickerAsignado}
                        </IonBadge>
                      )}
                      
                      <IonCardTitle>Pedido: {notif.numeroPedido}</IonCardTitle>
                    </IonCardHeader>
                    
                    <IonCardContent>
                      <div className="notificacion-mensaje">
                        <p>{notif.mensaje}</p>
                      </div>
                      
                      <div className="notificacion-footer">
                        <span className="notificacion-fecha">
                          📅 {formatFechaHoraCorta(notif.fechaNotificacion)}
                        </span>
                        
                        <div className="notificacion-acciones">
                          {/* Botón Ver Detalle */}
                          <IonButton 
                            size="small" 
                            color="primary"
                            onClick={() => {
                              setShowNotificacionesModal(false);
                              history.push(`/detalle-pedido/${notif.numeroPedido}`);
                            }}
                          >
                            Ver Detalle
                          </IonButton>
                          
                          {/* Botón Marcar como leída */}
                          {notif.leida === 1 ? (
                            <IonButton 
                              size="small" 
                              color="light" 
                              disabled
                            >
                              <IonIcon icon={checkmarkCircleOutline} slot="start" />
                              ✓ Leída
                            </IonButton>
                          ) : (
                            <IonButton 
                              size="small" 
                              color="success"
                              onClick={() => marcarProblemaLeido(notif.idNotificacion)}
                            >
                              <IonIcon icon={checkmarkCircleOutline} slot="start" />
                              Marcar como leída
                            </IonButton>
                          )}
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                ))}
              </IonList>
            )}
          </IonContent>
          
          <IonFooter>
            <IonToolbar>
              <IonButton 
                expand="full" 
                fill="clear" 
                onClick={() => setShowNotificacionesModal(false)}
              >
                Cerrar
              </IonButton>
            </IonToolbar>
          </IonFooter>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Pedidos;
