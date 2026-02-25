import React, { useEffect, useState } from "react";
import { formatFechaHoraCorta } from "../../utils/dateFormatters";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonAlert,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonModal,
  IonInput,
  IonFooter,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonText,
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  checkmarkCircleOutline,
  closeOutline,
  printOutline,
  cubeOutline,
  locationOutline,
  pricetagOutline,
  colorPaletteOutline,
  resizeOutline,
  clipboardOutline,
  refreshOutline,
  timeOutline,
  statsChartOutline,
  playBackOutline,
  playForwardOutline,
  playSkipBackOutline,
  playSkipForwardOutline,
  chevronDownOutline,
  notificationsOutline,
} from "ionicons/icons";
import { useAuth } from "../../context/AuthContext";
import { useHistory } from "react-router-dom";
import {
  cargarTareasPicking,
  verPickingList,
  completarTareaPicking,
  exportarPedidoPDF,
  obtenerMotivosProblemas,
  completarTareaConProblema,
  marcarNotificacionLeida,
  obtenerNotificacionesPedido,
} from "../../utils/pickingUtils";
import axiosInstance from "../../config/axios";
import "./Picking.css";

const PAGE_SIZE = 6; // Cantidad de tareas por página

const Picking: React.FC = () => {
  const { username, roles, hasRole, legajoPicker } = useAuth();
  const history = useHistory();
  const [tareas, setTareas] = useState<any[]>([]);
  const [tareasFiltradas, setTareasFiltradas] = useState<any[]>([]);
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [tareaSeleccionada, setTareaSeleccionada] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProblemaModal, setShowProblemaModal] = useState(false);
  const [motivosProblemas, setMotivosProblemas] = useState<any[]>([]);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<number | null>(null);
  const [observacionesProblema, setObservacionesProblema] = useState("");
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<any | null>(null);
  const [cantidadProblema, setCantidadProblema] = useState<number>(0);
  const [pickingList, setPickingList] = useState<any[]>([]);
  const [showPickingList, setShowPickingList] = useState(false);
  
  // Estados para notificaciones de resolución
  const [notificacionesResolucion, setNotificacionesResolucion] = useState<any[]>([]);
  const [idUsuarioActual, setIdUsuarioActual] = useState<number | null>(null);
  const [showNotificacionesModal, setShowNotificacionesModal] = useState(false);
  const [mostrarLeidas, setMostrarLeidas] = useState(true);
  
  // Estados de paginación
  const [page, setPage] = useState(1);
  const [showPageDropdown, setShowPageDropdown] = useState(false);

  // Función para mapear idPresentacion a nombrePresentacion
  const obtenerNombrePresentacion = (idPresentacion: number | null | undefined): string => {
    if (!idPresentacion) return "Unidad";
    
    switch (idPresentacion) {
      case 1:
        return "Unidad";
      case 2:
        return "Caja Cerrada";
      case 3:
        return "Pack";
      default:
        return "Unidad";
    }
  };

  // Función auxiliar para formatear items del picking list (elimina triplicación)
  const formatearItemsPickingList = (detallesPedido: any[]) => {
    return detallesPedido.map((detalle: any) => {
      const indumentaria = detalle.Indumentarium || {};
      const detalleInd = indumentaria.DetalleIndumentarium || {};
      const nombreInd = detalleInd.NombreIndumentarium || {};
      const color = detalleInd.Color || {};
      const talle = detalleInd.Talle || {};
      const categoria = detalleInd.CategoriaIndumentarium || {};
      return {
        nombre_producto: nombreInd.nombre || "Sin nombre",
        codigoIndumentaria: detalle.codigoIndumentaria,
        referencia: indumentaria.codigoIndumentaria,
        id: indumentaria.idIndumentaria || detalle.codigoIndumentaria || "-",
        cantidad: detalle.cantidad,
        rack: indumentaria.Stock?.Rack?.numeroRack || indumentaria.Stock?.idRack?.toString() || "Sin asignar",
        categoria: categoria.categoria || "Sin categoría",
        color: color.color || "N/A",
        talle: talle.talle || "N/A",
        nombrePresentacion: obtenerNombrePresentacion(detalle.idPresentacion),
        cantidadPresentaciones: detalle.cantidadPresentaciones,
        unidadesTotales: detalle.unidadesTotales,
      };
    });
  };

  // Helper para mostrar alertas (reduce código repetitivo)
  const mostrarAlerta = (mensaje: string) => {
    setAlertMsg(mensaje);
    setShowAlert(true);
  };

  // Función para limpiar formulario de problemas
  const limpiarFormularioProblema = () => {
    setMotivoSeleccionado(null);
    setObservacionesProblema("");
    setArticuloSeleccionado(null);
    setCantidadProblema(0);
  };

  // Función para verificar si hay problemas pendientes de resolución
  const verificarProblemasPendientes = async (numeroPedido: string): Promise<boolean> => {
    try {
      const notificaciones = await obtenerNotificacionesPedido(numeroPedido);
      const pendientes = notificaciones.filter(
        (n: any) => n.tipoNotificacion === 'problema_picking' && n.estadoResolucion === 'pendiente'
      );
      return pendientes.length > 0;
    } catch (error) {
      console.error("Error al verificar problemas pendientes:", error);
      return false; // En caso de error, permitir continuar
    }
  };



  const cargarTareas = async () => {
    setLoading(true);
    try {
      // Usar legajoPicker si el usuario es Picker, sino username (para admin no importa)
      const pickerId = hasRole("Picker") ? legajoPicker : username;
      // Determinar el rol principal para el backend (mantener compatibilidad)
      const rolPrincipal = hasRole("Administrador") ? "Administrador" : hasRole("Encargado de Picking") ? "Encargado de Picking" : "Picker";
      const data = await cargarTareasPicking(rolPrincipal, pickerId || "");
      console.log("📋 Tareas cargadas desde backend:", data);
      console.log("📊 Estados de las tareas:", data.map((t: any) => ({ pedido: t.numeroPedido, idEstado: t.idEstado, completado: t.completado })));
      setTareas(data);
      setTareasFiltradas(data); // Inicialmente mostrar todas las tareas
      
      // Si es picker y no tiene tareas, mostrar mensaje informativo
      if (data.length === 0 && hasRole("Picker")) {
        mostrarAlerta("Todavía no tiene ningún pedido asignado");
      }
    } catch (err: any) {
      console.error("Error al cargar tareas:", err);
      
      // Diferenciar entre diferentes tipos de error
      if (err.response?.data?.codigo === "PICKER_NOT_CONFIGURED") {
        // Usuario Picker sin configuración completa
        setAlertMsg(err.response.data.mensaje || "Todavía no tiene ningún pedido asignado");
      } else if (hasRole("Picker") && (err.response?.status === 404 || err.response?.data?.message?.includes("sin tareas"))) {
        // Picker válido sin tareas asignadas
        setAlertMsg("Todavía no tiene ningún pedido asignado");
      } else if (err.response?.status === 403 || err.response?.status === 401) {
        // Error de autenticación o autorización
        setAlertMsg("No tiene permisos para acceder a esta sección. Contacte al administrador.");
      } else {
        // Error general del servidor
        setAlertMsg("Error al cargar tareas. Por favor, intente nuevamente.");
      }
      
      setShowAlert(true);
      setTareas([]);
      setTareasFiltradas([]);
    }
    setLoading(false);
  };

  // Función para cargar notificaciones de resolución
  const cargarNotificacionesResolucion = async () => {
    try {
      // Obtener idUsuario del usuario autenticado
      const res = await axiosInstance.get('/api/auth/profile');
      const idUsuario = res.data.idUsuario;
      setIdUsuarioActual(idUsuario);
      
      // Obtener todas las notificaciones de tipo 'resolucion_vendedor'
      // Si es administrador, recibirá TODAS las notificaciones
      const notifRes = await axiosInstance.get(`/api/pedidos/notificaciones/${idUsuario}`);
      
      // Filtrar notificaciones de resolución
      const notificacionesResoluciones = notifRes.data.filter(
        (n: any) => n.tipoNotificacion === 'resolucion_vendedor'
      );
      
      // Estados que indican que un pedido está completado
      const estadosCompletados = [2, 3, 4, 5, 6];
      
      // Filtrar solo las notificaciones cuyo pedido NO esté completado
      const notificacionesActivas = notificacionesResoluciones.filter((notif: any) => {
        // Buscar si existe una tarea con este número de pedido
        const tareaAsociada = tareas.find((t: any) => t.numeroPedido === notif.numeroPedido);
        
        if (tareaAsociada) {
          // Si la tarea está completada (completado=1 o estado completado), NO mostrar la notificación
          const pedidoCompletado = tareaAsociada.completado === 1 || estadosCompletados.includes(tareaAsociada.idEstado);
          return !pedidoCompletado; // Solo mostrar si el pedido NO está completado
        }
        
        // Si no se encuentra la tarea, mostrar la notificación por defecto
        return true;
      });
      
      setNotificacionesResolucion(notificacionesActivas);
    } catch (error) {
      console.error("Error al cargar notificaciones de resolución:", error);
      setNotificacionesResolucion([]);
    }
  };

  // Función para marcar notificación como leída y recargar tareas
  const marcarResolucionLeida = async (idNotificacion: number) => {
    try {
      await marcarNotificacionLeida(idNotificacion);
      await cargarNotificacionesResolucion();
      await cargarTareas(); // Recargar tareas porque puede haber cambios en los pedidos
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  // Función para filtrar tareas
  const filtrarTareas = (tipo: string) => {
    setFiltroActivo(tipo);
    setPage(1); // Resetear a la primera página al filtrar
    
    // Estados completados: Pendiente de Pago (2), Abonado (3), Despachado (4), Finalizado (5), Cancelado (6)
    const estadosCompletados = [2, 3, 4, 5, 6];
    
    switch (tipo) {
      case 'todos':
        setTareasFiltradas(tareas);
        break;
      case 'pendientes':
        // Tareas con estado "En Curso" (1) Y que no estén marcadas como completadas
        setTareasFiltradas(tareas.filter(tarea => tarea.idEstado === 1 && !tarea.completado));
        break;
      case 'completadas':
        // Tareas completadas: pueden tener completado=1 O estar en estados finales
        setTareasFiltradas(tareas.filter(tarea => 
          tarea.completado === 1 || estadosCompletados.includes(tarea.idEstado)
        ));
        break;
      default:
        setTareasFiltradas(tareas);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarMotivos();
    // eslint-disable-next-line
  }, []);

  // Recargar datos cada vez que la vista entra (para sincronización automática)
  useIonViewWillEnter(() => {
    cargarTareas();
    cargarNotificacionesResolucion();
  });

  const cargarMotivos = async () => {
    try {
      const motivos = await obtenerMotivosProblemas();
      setMotivosProblemas(motivos);
    } catch (error) {
      console.error("Error al cargar motivos de problemas:", error);
    }
  };

  // Actualizar tareas filtradas cuando cambian las tareas
  useEffect(() => {
    filtrarTareas(filtroActivo);
    // eslint-disable-next-line
  }, [tareas]);

  const handleVerPickingList = async (numeroPedido: string) => {
    try {
      const response = await verPickingList(numeroPedido);

      // Log para diagnóstico de la estructura de datos
      console.log("Respuesta del endpoint picking list:", response);
      if (response?.pedido?.DetallePedidos?.length > 0) {
        console.log("Primer item detalle:", response.pedido.DetallePedidos[0]);
        console.log(
          "Indumentarium del primer item:",
          response.pedido.DetallePedidos[0].Indumentarium
        );
        console.log(
          "DetalleIndumentarium:",
          response.pedido.DetallePedidos[0].Indumentarium?.DetalleIndumentarium
        );
        console.log(
          "Stock del primer item:",
          response.pedido.DetallePedidos[0].Indumentarium?.Stock
        );
        console.log(
          "Rack del primer item:",
          response.pedido.DetallePedidos[0].Indumentarium?.Stock?.Rack
        );
        console.log("🔍 DIAGNÓSTICO DE PRESENTACIÓN:");
        console.log("  - nombrePresentacion directo:", response.pedido.DetallePedidos[0].nombrePresentacion);
        console.log("  - PedidoIndumentarium:", response.pedido.DetallePedidos[0].PedidoIndumentarium);
        console.log("  - idPresentacion:", response.pedido.DetallePedidos[0].idPresentacion);
        console.log("  - cantidadPresentaciones:", response.pedido.DetallePedidos[0].cantidadPresentaciones);
        console.log("  - unidadesTotales:", response.pedido.DetallePedidos[0].unidadesTotales);
        console.log("  - Detalle completo:", JSON.stringify(response.pedido.DetallePedidos[0], null, 2));
      }

      // Transformamos los datos para tener un formato compatible con el componente
      if (response && response.pedido && response.pedido.DetallePedidos) {
        const itemsFormateados = formatearItemsPickingList(response.pedido.DetallePedidos);
        setPickingList(itemsFormateados);
      } else {
        // Si no hay datos o el formato es inesperado, inicializamos como array vacío
        setPickingList([]);
      }

      setShowPickingList(true);
    } catch (err) {
      console.error("Error detallado:", err);
      mostrarAlerta("Error al obtener picking list");
    }
  };

  const handleCompletarTarea = async (
    idAsignacion: number,
    numeroPedido: string
  ) => {
    try {
      console.log(
        "Enviando completar tarea con idAsignacion:",
        idAsignacion,
        "tipo:",
        typeof idAsignacion
      );
      if (!idAsignacion && hasRole("Administrador")) {
        console.error(
          "Error: Se requiere idAsignacion para completar tarea como admin"
        );
        setAlertMsg(
          "Error: Se requiere ID de asignación para completar tarea como administrador"
        );
        setShowAlert(true);
        return;
      }

      const resultado = await completarTareaPicking(idAsignacion, numeroPedido);
      setAlertMsg(
        `Tarea completada. El pedido ahora está en estado "${
          resultado.estado || "Pendiente de Pago"
        }"`
      );
      setShowAlert(true);
      cargarTareas();
      setShowPickingList(false);
    } catch (err) {
      console.error("Error en handleCompletarTarea:", err);
      setAlertMsg(
        "Error al completar tarea. Verifica la consola para más detalles."
      );
      setShowAlert(true);
    }
  };

  const handleReportarProblema = async () => {
    // Cerrar confirm y cargar la lista de artículos antes de abrir el modal
    setShowConfirm(false);
    
    try {
      // SIEMPRE recargar los artículos del pedido para asegurar datos actualizados
      // (el usuario pudo haber editado el pedido desde otra vista)
      if (tareaSeleccionada) {
        const response = await verPickingList(tareaSeleccionada.numeroPedido);
        
        if (response && response.pedido && response.pedido.DetallePedidos) {
          const itemsFormateados = formatearItemsPickingList(response.pedido.DetallePedidos);
          setPickingList(itemsFormateados);
        } else {
          setPickingList([]);
        }
      }
      
      // Abrir modal de reporte de problemas
      setShowProblemaModal(true);
    } catch (err) {
      console.error("Error al cargar artículos para reporte:", err);
      mostrarAlerta("Error al cargar la lista de artículos");
    }
  };

  const handleCompletarConProblema = async () => {
    try {
      // Validaciones
      if (!articuloSeleccionado) {
        mostrarAlerta("Por favor seleccione el artículo con problema");
        return;
      }

      if (!cantidadProblema || cantidadProblema <= 0) {
        const tipoCantidad = articuloSeleccionado.nombrePresentacion && 
                            articuloSeleccionado.nombrePresentacion !== 'Unidad'
          ? articuloSeleccionado.nombrePresentacion
          : 'unidades';
        mostrarAlerta(`Por favor ingrese la cantidad de ${tipoCantidad} con problema`);
        return;
      }

      // Validar cantidad máxima según presentación
      const maxCantidad = articuloSeleccionado.nombrePresentacion && 
                         articuloSeleccionado.nombrePresentacion !== 'Unidad'
        ? articuloSeleccionado.cantidadPresentaciones
        : articuloSeleccionado.cantidad;
      
      const tipoCantidad = articuloSeleccionado.nombrePresentacion && 
                          articuloSeleccionado.nombrePresentacion !== 'Unidad'
        ? articuloSeleccionado.nombrePresentacion + '(s)'
        : 'unidades';

      if (cantidadProblema > maxCantidad) {
        mostrarAlerta(`La cantidad no puede superar ${maxCantidad} ${tipoCantidad}`);
        return;
      }

      if (!motivoSeleccionado) {
        mostrarAlerta("Por favor seleccione un motivo para el problema");
        return;
      }

      if (!tareaSeleccionada || !tareaSeleccionada.idAsignacion) {
        mostrarAlerta("Error: No se encontró ID de asignación para esta tarea");
        return;
      }

      // Buscar el idDetallePedido del artículo seleccionado
      // Necesitamos hacer una petición para obtener el idDetallePedido
      const response = await verPickingList(tareaSeleccionada.numeroPedido);
      const detalleCompleto = response.pedido.DetallePedidos.find(
        (d: any) => d.codigoIndumentaria === articuloSeleccionado.codigoIndumentaria
      );

      if (!detalleCompleto || !detalleCompleto.idDetallePedido) {
        mostrarAlerta("Error: No se encontró el ID del detalle del pedido");
        return;
      }

      const resultado = await completarTareaConProblema(
        tareaSeleccionada.idAsignacion,
        tareaSeleccionada.numeroPedido,
        true, // tieneProblemas
        motivoSeleccionado,
        observacionesProblema,
        false, // completarParcial - siempre esperar resolución
        detalleCompleto.idDetallePedido,
        cantidadProblema
      );

      mostrarAlerta(resultado.message || "Problema reportado correctamente");
      setShowProblemaModal(false);
      
      // Limpiar formulario
      limpiarFormularioProblema();
      
      cargarTareas();
      setShowPickingList(false);
    } catch (err: any) {
      console.error("Error en handleCompletarConProblema:", err);
      mostrarAlerta(err.response?.data?.error || "Error al reportar problema. Verifica la consola para más detalles.");
    }
  };



  // Calcular estadísticas
  const estadosCompletados = [2, 3, 4, 5, 6];
  
  const stats = {
    total: tareas.length,
    pendientes: tareas.filter(tarea => tarea.idEstado === 1 && !tarea.completado).length,
    completadas: tareas.filter(tarea => tarea.completado === 1 || estadosCompletados.includes(tarea.idEstado)).length,
  };

  // Lógica de paginación
  const totalPages = Math.ceil(tareasFiltradas.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const tareasPaginadas = tareasFiltradas.slice(startIndex, endIndex);

  // Funciones de navegación de página
  const goToFirstPage = () => setPage(1);
  const goToLastPage = () => setPage(totalPages);
  const goToPreviousPage = () => setPage(Math.max(1, page - 1));
  const goToNextPage = () => setPage(Math.min(totalPages, page + 1));

  return (
    <IonPage className="picking-page">
      <IonHeader>
        <IonToolbar className="picking-toolbar">
          <IonTitle>Gestión de Picking</IonTitle>
          
          {/* Botón de Notificaciones con Badge */}
          <IonButton 
            slot="end" 
            fill="clear" 
            onClick={() => setShowNotificacionesModal(true)}
            className="notifications-btn"
          >
            <IonIcon icon={notificationsOutline} />
            {notificacionesResolucion.filter((n: any) => n.leida === 0).length > 0 && (
              <IonBadge 
                color="danger"
                className="notifications-badge"
              >
                {notificacionesResolucion.filter((n: any) => n.leida === 0).length}
              </IonBadge>
            )}
          </IonButton>
          
          <IonButton 
            slot="end" 
            fill="clear" 
            onClick={cargarTareas}
            className="refresh-btn"
          >
            <IonIcon icon={refreshOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="picking-content">
        {/* Dashboard de Estadísticas */}
        <div className="stats-dashboard">
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="3">
                <div 
                  className={`stat-card total ${filtroActivo === 'todos' ? 'active' : ''}`}
                  onClick={() => filtrarTareas('todos')}
                >
                  <div className="stat-icon">
                    <IonIcon icon={clipboardOutline} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Total Tareas</div>
                  </div>
                </div>
              </IonCol>
              <IonCol size="12" sizeMd="3">
                <div 
                  className={`stat-card pending ${filtroActivo === 'pendientes' ? 'active' : ''}`}
                  onClick={() => filtrarTareas('pendientes')}
                >
                  <div className="stat-icon">
                    <IonIcon icon={timeOutline} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.pendientes}</div>
                    <div className="stat-label">Pendientes</div>
                  </div>
                </div>
              </IonCol>
              <IonCol size="12" sizeMd="3">
                <div 
                  className={`stat-card completed ${filtroActivo === 'completadas' ? 'active' : ''}`}
                  onClick={() => filtrarTareas('completadas')}
                >
                  <div className="stat-icon">
                    <IonIcon icon={checkmarkCircleOutline} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.completadas}</div>
                    <div className="stat-label">Completadas</div>
                  </div>
                </div>
              </IonCol>
              <IonCol size="12" sizeMd="3">
                <div 
                  className="stat-card stock-report"
                  onClick={() => history.push('/reportes/stock-actual')}
                >
                  <div className="stat-icon">
                    <IonIcon icon={statsChartOutline} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">📊</div>
                    <div className="stat-label">Stock Actual</div>
                  </div>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* Contenido Principal */}
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" className="loading-spinner" />
            <p className="loading-text">Cargando tareas de picking...</p>
          </div>
        ) : (
          <div className="tasks-container">
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  
                  {tareasFiltradas.length === 0 ? (
                    <div className="empty-state">
                      <IonIcon icon={clipboardOutline} className="empty-icon" />
                      <h2>
                        {filtroActivo === 'todos' ? 'No hay tareas disponibles' : 
                         `No hay tareas ${
                           filtroActivo === 'pendientes' ? 'pendientes' :
                           filtroActivo === 'completadas' ? 'completadas' : ''
                         }`}
                      </h2>
                      <p>
                        {filtroActivo === 'todos' ? 
                          'No tienes tareas de picking en este momento.' :
                          `No hay tareas ${
                            filtroActivo === 'pendientes' ? 'pendientes' :
                            filtroActivo === 'completadas' ? 'completadas' : ''
                          } disponibles.`}
                      </p>
                      <IonButton 
                        color="primary" 
                        onClick={cargarTareas}
                        className="refresh-btn"
                      >
                        <IonIcon icon={refreshOutline} />
                        Actualizar
                      </IonButton>
                    </div>
                  ) : (
                    <div className="tasks-grid">
                      {tareasPaginadas.map((tarea) => (
                        <div key={tarea.idAsignacion} className="task-card">
                          <div className="task-header">
                            <div className="task-title">
                              <IonIcon icon={cubeOutline} />
                              <span>{tarea.numeroPedido}</span>
                            </div>
                            {hasRole("Administrador") && tarea.pickerAsignado && (
                              <div className="picker-badge">
                                {tarea.pickerAsignado}
                              </div>
                            )}
                          </div>
                          
                          <div className="task-info">
                            <div className="info-item">
                              <IonIcon icon={timeOutline} />
                              <span>
                                {formatFechaHoraCorta(tarea.fechaAsignacion)}
                              </span>
                            </div>
                          </div>

                          <div className="task-actions">
                            <IonButton
                              size="small"
                              color="warning"
                              fill="outline"
                              onClick={async () => {
                                try {
                                  const response = await verPickingList(tarea.numeroPedido);
                                  const itemsFormateados = formatearItemsPickingList(response?.pedido?.DetallePedidos || []);
                                  const productos = itemsFormateados.map(item => ({
                                    id: item.id,
                                    nombre: item.nombre_producto,
                                    cantidad: item.cantidad,
                                    rack: item.rack,
                                    categoria: item.categoria,
                                    color: item.color,
                                    talle: item.talle,
                                    nombrePresentacion: item.nombrePresentacion,
                                    cantidadPresentaciones: item.cantidadPresentaciones,
                                  }));
                                  exportarPedidoPDF({
                                    id: tarea.numeroPedido,
                                    productos,
                                  });
                                } catch (err) {
                                  mostrarAlerta("Error al exportar el pedido a PDF");
                                }
                              }}
                            >
                              <IonIcon icon={printOutline} slot="start" />
                              PDF
                            </IonButton>
                            
                            <IonButton
                              size="small"
                              color="primary"
                              onClick={() => handleVerPickingList(tarea.numeroPedido)}
                            >
                              <IonIcon icon={locationOutline} slot="start" />
                              Ver Lista
                            </IonButton>
                            
                            {/* Solo mostrar botón Completar si el estado es "En Curso" (1) Y no está completado */}
                            {tarea.idEstado === 1 && !tarea.completado && (
                              <IonButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  setTareaSeleccionada(tarea);
                                  setShowConfirm(true);
                                }}
                              >
                                <IonIcon icon={checkmarkCircleOutline} slot="start" />
                                Completar
                              </IonButton>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        )}

        {/* Paginación mejorada */}
        {totalPages > 1 && (
          <div className="pagination-footer">
            <div className="pagination-controls">
              {/* Botón Volver */}
              <IonButton
                color="warning"
                size="small"
                onClick={() => history.push("/dashboard")}
              >
                Volver
              </IonButton>

              {/* Ir al inicio */}
              <IonButton
                fill="clear"
                size="small"
                onClick={goToFirstPage}
                disabled={page === 1}
                title="Primera página"
              >
                <IonIcon icon={playSkipBackOutline} />
              </IonButton>

              {/* Página anterior */}
              <IonButton
                fill="clear"
                size="small"
                onClick={goToPreviousPage}
                disabled={page === 1}
                title="Página anterior"
              >
                <IonIcon icon={playBackOutline} />
              </IonButton>

              {/* Selector de página */}
              <div className="page-selector-wrapper">
                <IonButton
                  fill="outline"
                  size="small"
                  onClick={() => setShowPageDropdown(!showPageDropdown)}
                  className="page-selector-button"
                >
                  Página {page} de {totalPages}
                  <IonIcon icon={chevronDownOutline} slot="end" />
                </IonButton>
                
                {showPageDropdown && (
                  <div className="page-dropdown">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <div
                        key={pageNum}
                        onClick={() => {
                          setPage(pageNum);
                          setShowPageDropdown(false);
                        }}
                        className={`page-option ${pageNum === page ? 'active' : ''}`}
                      >
                        Página {pageNum}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Página siguiente */}
              <IonButton
                fill="clear"
                size="small"
                onClick={goToNextPage}
                disabled={page === totalPages}
                title="Página siguiente"
              >
                <IonIcon icon={playForwardOutline} />
              </IonButton>

              {/* Ir al final */}
              <IonButton
                fill="clear"
                size="small"
                onClick={goToLastPage}
                disabled={page === totalPages}
                title="Última página"
              >
                <IonIcon icon={playSkipForwardOutline} />
              </IonButton>
            </div>
            
            {/* Información adicional de registros */}
            <div className="pagination-summary">
              Mostrando {startIndex + 1} - {Math.min(endIndex, tareasFiltradas.length)} de {tareasFiltradas.length} tareas
            </div>
          </div>
        )}

        {/* Modal Picking List con diseño profesional */}
        <IonModal
          isOpen={showPickingList}
          onDidDismiss={() => setShowPickingList(false)}
          className="picking-modal"
        >
          <IonHeader>
            <IonToolbar className="picking-modal-toolbar">
              <IonTitle>Lista de Picking</IonTitle>
              <IonButton
                slot="end"
                fill="clear"
                onClick={() => setShowPickingList(false)}
                className="modal-close-btn"
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          
          <IonContent className="picking-modal-content">
            {pickingList.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={cubeOutline} className="empty-icon" />
                <h2>Sin productos</h2>
                <p>No hay productos disponibles para este pedido.</p>
              </div>
            ) : (
              <div className="picking-items-container">
                <div className="picking-items-header">
                  <h3>Productos a recoger ({pickingList.length})</h3>
                </div>
                
                <div className="picking-items-grid">
                  {pickingList.map((item: any, idx: number) => (
                    <div className="picking-item-card" key={idx}>
                      <div className="item-header">
                        <h4 className="item-name">{item.nombre_producto ?? "-"}</h4>
                        {item.nombrePresentacion && (
                          <div style={{ 
                            fontSize: '0.85em', 
                            marginTop: '4px',
                            padding: '4px 8px',
                            backgroundColor: '#e8f4f8',
                            borderRadius: '4px',
                            color: '#0066cc',
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}>
                            📦 {item.nombrePresentacion}
                          </div>
                        )}
                        <span className="item-reference">
                          {item.referencia || item.codigoIndumentaria || "-"}
                        </span>
                      </div>
                      
                      <div className="item-details">
                        <div className="detail-row">
                          <div className="detail-item">
                            <IonIcon icon={cubeOutline} />
                            <div className="detail-content">
                              <span className="detail-label">Cantidad</span>
                              <span className="detail-value">
                                {item.cantidadPresentaciones ?? item.cantidad ?? "-"}
                              </span>
                              {item.cantidadPresentaciones && item.unidadesTotales && (
                                <div style={{ 
                                  fontSize: '0.75em', 
                                  marginTop: '4px',
                                  color: '#ffffffff'
                                }}>
                                  ({item.cantidadPresentaciones} {item.nombrePresentacion}(s) × {item.unidadesTotales / item.cantidadPresentaciones} u. = {item.unidadesTotales} u. totales)
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="detail-item rack-info">
                            <IonIcon icon={locationOutline} />
                            <div className="detail-content">
                              <span className="detail-label">Rack</span>
                              <span className="detail-value highlight">{item.rack ?? "Sin asignar"}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-item">
                            <IonIcon icon={pricetagOutline} />
                            <div className="detail-content">
                              <span className="detail-label">Categoría</span>
                              <span className="detail-value">{item.categoria ?? "-"}</span>
                            </div>
                          </div>
                          
                          <div className="detail-item">
                            <IonIcon icon={colorPaletteOutline} />
                            <div className="detail-content">
                              <span className="detail-label">Color</span>
                              <span className="detail-value">{item.color ?? "-"}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-item size-info">
                            <IonIcon icon={resizeOutline} />
                            <div className="detail-content">
                              <span className="detail-label">Talle</span>
                              <span className="detail-value highlight">{item.talle ?? "-"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="modal-actions">
              <IonButton
                expand="block"
                color="medium"
                onClick={() => setShowPickingList(false)}
                className="close-modal-btn"
              >
                <IonIcon icon={closeOutline} slot="start" />
                Cerrar
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
        {/* Modal de confirmación con diseño profesional */}
        <IonAlert
          isOpen={showConfirm}
          onDidDismiss={() => setShowConfirm(false)}
          cssClass="picking-confirm-alert"
          header="Completar Tarea"
          message="¿Hubo algún problema con los productos de este pedido?"
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
              cssClass: "alert-button-cancel",
            },
            {
              text: "Reportar Problema",
              cssClass: "alert-button-warning",
              handler: () => {
                handleReportarProblema();
              },
            },
            {
              text: "Completar sin problemas",
              cssClass: "alert-button-confirm",
              handler: async () => {
                if (!tareaSeleccionada || !tareaSeleccionada.idAsignacion) {
                  mostrarAlerta("Error: No se encontró ID de asignación para esta tarea");
                  return false;
                }
                
                // Validar si hay problemas pendientes
                const tienePendientes = await verificarProblemasPendientes(tareaSeleccionada.numeroPedido);
                
                if (tienePendientes) {
                  mostrarAlerta("⚠️ No se puede completar. Este pedido tiene problemas reportados pendientes de resolución. El vendedor debe resolver los problemas primero.");
                  return false;
                }
                
                // Si no hay problemas pendientes, completar normalmente
                await handleCompletarTarea(
                  tareaSeleccionada.idAsignacion,
                  tareaSeleccionada.numeroPedido
                );
                return true;
              },
            },
          ]}
        />

        {/* Modal de reporte de problema */}
        <IonModal
          isOpen={showProblemaModal}
          onDidDismiss={() => {
            setShowProblemaModal(false);
            limpiarFormularioProblema();
          }}
          className="problema-modal"
        >
          <IonHeader>
            <IonToolbar className="problema-modal-toolbar">
              <IonTitle>Reportar Problema</IonTitle>
              <IonButton
                slot="end"
                fill="clear"
                onClick={() => {
                  setShowProblemaModal(false);
                  limpiarFormularioProblema();
                }}
                className="modal-close-btn"
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          
          <IonContent className="problema-modal-content">
            <div className="problema-form">
              <div className="problema-header">
                <h3>⚠️ Reporte de Problema</h3>
                <p>Seleccione el artículo y la cantidad con problema</p>
              </div>

              <IonList>
                <IonItem>
                  <IonLabel position="stacked" style={{ color: 'white', fontSize: '20px', fontWeight: '500' }}>
                    Artículo con problema <span style={{ color: '#ff6b6b' }}>*</span>
                  </IonLabel>
                  <IonSelect
                    value={articuloSeleccionado?.codigoIndumentaria}
                    placeholder="Seleccionar artículo"
                    onIonChange={(e: any) => {
                      const articulo = pickingList.find(
                        (item) => item.codigoIndumentaria === e.detail.value
                      );
                      setArticuloSeleccionado(articulo);
                      setCantidadProblema(0); // Reset cantidad al cambiar artículo
                    }}
                  >
                    {pickingList.map((item) => {
                      // Formatear la descripción según la presentación
                      let descripcionCantidad = '';
                      if (item.nombrePresentacion && item.cantidadPresentaciones && item.nombrePresentacion !== 'Unidad') {
                        // Tiene presentación especial (Pack o Caja Cerrada)
                        descripcionCantidad = `${item.cantidadPresentaciones} ${item.nombrePresentacion}(s) = ${item.unidadesTotales} unidades`;
                      } else {
                        // Solo unidades
                        descripcionCantidad = `${item.cantidad} unidad(es)`;
                      }
                      
                      return (
                        <IonSelectOption
                          key={item.codigoIndumentaria}
                          value={item.codigoIndumentaria}
                        >
                          {item.nombre_producto} - {item.color} - {item.talle} ({descripcionCantidad})
                        </IonSelectOption>
                      );
                    })}
                  </IonSelect>
                </IonItem>

                {articuloSeleccionado && (
                  <>
                    {/* Mostrar información de presentación si existe */}
                    {articuloSeleccionado.nombrePresentacion && 
                     articuloSeleccionado.cantidadPresentaciones && 
                     articuloSeleccionado.nombrePresentacion !== 'Unidad' && (
                      <div style={{
                        margin: '12px 16px',
                        padding: '12px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '8px',
                        borderLeft: '4px solid #2196f3'
                      }}>
                        <div style={{ fontSize: '13px', color: '#1976d2', marginBottom: '6px' }}>
                          <strong>📦 Presentación: {articuloSeleccionado.nombrePresentacion}</strong>
                        </div>
                        <div style={{ fontSize: '12px', color: '#555' }}>
                          • Cantidad disponible: <strong>{articuloSeleccionado.cantidadPresentaciones} {articuloSeleccionado.nombrePresentacion}(s)</strong>
                        </div>
                        <div style={{ fontSize: '12px', color: '#555' }}>
                          • Equivalente a: <strong>{articuloSeleccionado.unidadesTotales} unidades totales</strong>
                        </div>
                        <div style={{ fontSize: '12px', color: '#555' }}>
                          • Unidades por {articuloSeleccionado.nombrePresentacion}: <strong>{articuloSeleccionado.unidadesTotales / articuloSeleccionado.cantidadPresentaciones}</strong>
                        </div>
                      </div>
                    )}
                    
                    <IonItem>
                      <IonLabel position="stacked" style={{ color: 'white', fontSize: '20px', fontWeight: '500' }}>
                        {articuloSeleccionado.nombrePresentacion && 
                         articuloSeleccionado.nombrePresentacion !== 'Unidad'
                          ? `Cantidad de ${articuloSeleccionado.nombrePresentacion}(s) con problema`
                          : 'Cantidad de unidades con problema'
                        } <span style={{ color: '#ff6b6b' }}>*</span>
                      </IonLabel>
                      <IonInput
                        type="number"
                        value={cantidadProblema}
                        placeholder={
                          articuloSeleccionado.nombrePresentacion && 
                          articuloSeleccionado.nombrePresentacion !== 'Unidad'
                            ? `Máximo: ${articuloSeleccionado.cantidadPresentaciones} ${articuloSeleccionado.nombrePresentacion}(s)`
                            : `Máximo: ${articuloSeleccionado.cantidad} unidades`
                        }
                        min="1"
                        max={
                          articuloSeleccionado.nombrePresentacion && 
                          articuloSeleccionado.nombrePresentacion !== 'Unidad'
                            ? articuloSeleccionado.cantidadPresentaciones
                            : articuloSeleccionado.cantidad
                        }
                        onIonChange={(e) => {
                          const valor = parseInt(e.detail.value || "0");
                          const max = articuloSeleccionado.nombrePresentacion && 
                                     articuloSeleccionado.nombrePresentacion !== 'Unidad'
                            ? articuloSeleccionado.cantidadPresentaciones
                            : articuloSeleccionado.cantidad;
                          
                          // Validar rango: mínimo 1, máximo el disponible
                          if (valor < 1) {
                            setCantidadProblema(1);
                          } else if (valor > max) {
                            setCantidadProblema(max);
                          } else {
                            setCantidadProblema(valor);
                          }
                        }}
                      />
                    </IonItem>
                    
                    {/* Mostrar conversión a unidades si es presentación especial */}
                    {articuloSeleccionado.nombrePresentacion && 
                     articuloSeleccionado.nombrePresentacion !== 'Unidad' && 
                     cantidadProblema > 0 && (
                      <div style={{
                        margin: '8px 16px',
                        padding: '8px 12px',
                        backgroundColor: '#fff3cd',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#856404'
                      }}>
                        💡 <strong>{cantidadProblema} {articuloSeleccionado.nombrePresentacion}(s)</strong> equivalen a <strong>{cantidadProblema * (articuloSeleccionado.unidadesTotales / articuloSeleccionado.cantidadPresentaciones)} unidades</strong>
                      </div>
                    )}
                  </>
                )}

                <IonItem>
                  <IonLabel position="stacked" style={{ color: 'white', fontSize: '20px', fontWeight: '500' }}>
                    Motivo del problema <span style={{ color: '#ff6b6b' }}>*</span>
                  </IonLabel>
                  <IonSelect
                    value={motivoSeleccionado}
                    placeholder="Seleccionar motivo"
                    onIonChange={(e: any) => setMotivoSeleccionado(e.detail.value)}
                  >
                    {motivosProblemas.map((motivo) => (
                      <IonSelectOption key={motivo.idMotivo} value={motivo.idMotivo}>
                        {motivo.descripcion}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked" style={{ color: 'white', fontSize: '20px', fontWeight: '500' }}>Observaciones adicionales</IonLabel>
                  <IonInput
                    value={observacionesProblema}
                    placeholder="Detalles del problema (opcional)"
                    onIonChange={(e) => setObservacionesProblema(e.detail.value || "")}
                  />
                </IonItem>

                <div className="problema-opciones">
                  <div style={{
                    margin: '16px',
                    padding: '16px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    borderLeft: '4px solid #ffc107'
                  }}>
                    <h4 style={{ color: '#856404', marginBottom: '8px' }}>ℹ️ Acción del sistema</h4>
                    <p style={{ color: '#856404', fontSize: '14px', margin: 0 }}>
                      El pedido quedará pendiente hasta que el problema sea resuelto por el vendedor o administrador.
                    </p>
                  </div>
                </div>
              </IonList>

              <div className="problema-actions">
                <IonButton
                  expand="block"
                  color="medium"
                  onClick={() => {
                    setShowProblemaModal(false);
                    limpiarFormularioProblema();
                  }}
                >
                  Cancelar
                </IonButton>
                <IonButton
                  expand="block"
                  color="warning"
                  onClick={handleCompletarConProblema}
                  disabled={!motivoSeleccionado}
                >
                  Confirmar Reporte
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>
        
        {/* Modal de notificaciones */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          cssClass="picking-notification-alert"
          header="Notificación"
          message={alertMsg}
          buttons={[
            {
              text: "Entendido",
              cssClass: "alert-button-primary",
            }
          ]}
        />
        
        {/* Modal de Notificaciones de Resolución */}
        <IonModal
          isOpen={showNotificacionesModal}
          onDidDismiss={() => setShowNotificacionesModal(false)}
          className="notificaciones-modal"
        >
          <IonHeader>
            <IonToolbar style={{ 
              '--background': 'linear-gradient(135deg, rgba(253, 180, 11, 0.95), rgba(243, 156, 18, 0.95))',
              '--color': '#ffffff',
              padding: '4px 8px'
            }}>
              <IonTitle style={{ 
                fontWeight: '700',
                fontSize: '20px',
                letterSpacing: '-0.02em',
                color: '#000000',
              }}>
                Notificaciones de Resolución
              </IonTitle>
              <IonButton 
                slot="end" 
                fill="solid"
                color={mostrarLeidas ? "light" : "success"}
                onClick={() => setMostrarLeidas(!mostrarLeidas)}
                style={{ 
                  marginRight: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  '--border-radius': '8px',
                  '--padding-start': '12px',
                  '--padding-end': '12px',
                  '--box-shadow': mostrarLeidas 
                    ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
                    : '0 4px 12px rgba(40, 167, 69, 0.3)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                <IonIcon 
                  icon={mostrarLeidas ? closeOutline : checkmarkCircleOutline} 
                  slot="start"
                  style={{ fontSize: '18px' }}
                />
                <span>{mostrarLeidas ? 'Ocultar leídas' : 'Mostrar leídas'}</span>
                {!mostrarLeidas && notificacionesResolucion.filter(n => n.leida !== 1).length > 0 && (
                  <IonBadge 
                    color="danger"
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      fontSize: '11px',
                      fontWeight: '800',
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.5)',
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    {notificacionesResolucion.filter(n => n.leida !== 1).length}
                  </IonBadge>
                )}
              </IonButton>
              {/*<IonButton 
                slot="end" 
                fill="clear" 
                onClick={() => setShowNotificacionesModal(false)}
                style={{
                  '--color': '#ffffff',
                  '--color-hover': '#fdb40b',
                  fontSize: '24px'
                }}
              >
                <IonIcon icon={closeOutline} />
              </IonButton>*/}
            </IonToolbar>
          </IonHeader>
          
          <IonContent>
            {(() => {
              // Filtrar notificaciones según el estado de mostrarLeidas
              const notificacionesFiltradas = mostrarLeidas 
                ? notificacionesResolucion 
                : notificacionesResolucion.filter(n => n.leida !== 1);
              
              if (notificacionesFiltradas.length === 0) {
                return (
                  <div className="notificaciones-empty">
                    <IonIcon icon={notificationsOutline} />
                    <h3>No hay notificaciones</h3>
                    <p>
                      {mostrarLeidas 
                        ? 'Todas las notificaciones de resolución aparecerán aquí' 
                        : 'No hay notificaciones sin leer'}
                    </p>
                  </div>
                );
              }
              
              return (
                <IonList>
                  {notificacionesFiltradas.map((notif) => (
                  <IonCard 
                    key={notif.idNotificacion} 
                    className={`notificacion-card ${notif.leida === 1 ? 'notificacion-leida' : ''}`}
                  >
                    <IonCardHeader>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '12px' 
                      }}>
                        {/* Fila superior: Badges de estado */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          flexWrap: 'wrap'
                        }}>
                          {/* Badge para indicar si es nueva o leída */}
                          {notif.leida === 1 ? (
                            <IonBadge color="medium" style={{ 
                              fontSize: '12px',
                              padding: '4px 10px',
                              fontWeight: '600'
                            }}>
                              ✓ Leída
                            </IonBadge>
                          ) : (
                            <IonBadge color="danger" style={{ 
                              fontSize: '12px',
                              padding: '4px 10px',
                              fontWeight: '600',
                              animation: 'pulse 2s infinite'
                            }}>
                              🔔 Nueva
                            </IonBadge>
                          )}
                          
                          <IonBadge color="success" style={{ 
                            fontSize: '12px',
                            padding: '4px 10px',
                            fontWeight: '600'
                          }}>
                            Resolución
                          </IonBadge>
                          
                          {/* Mostrar destinatario si es administrador viendo notificaciones de otros */}
                          {notif.idUsuarioDestino && idUsuarioActual && notif.idUsuarioDestino !== idUsuarioActual && (
                            <IonBadge color="warning" style={{ 
                              fontSize: '12px',
                              padding: '4px 10px',
                              fontWeight: '600'
                            }}>
                              👤 Para: {notif.pickerAsignado || `Usuario #${notif.idUsuarioDestino}`}
                            </IonBadge>
                          )}
                        </div>
                        
                        {/* Fila inferior: Título del pedido */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <IonCardTitle style={{ 
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1f2937'
                          }}>
                            Pedido: {notif.numeroPedido}
                          </IonCardTitle>
                        </div>
                      </div>
                    </IonCardHeader>
                    
                    <IonCardContent>
                      <div className="notificacion-mensaje">
                        <p>{notif.mensaje}</p>
                      </div>
                      
                      <div className="notificacion-footer">
                        <span className="notificacion-fecha">
                          📅 {formatFechaHoraCorta(notif.fechaNotificacion)}
                        </span>
                        
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
                            onClick={async () => {
                              await marcarResolucionLeida(notif.idNotificacion);
                              // NO cerrar modal, mantenerlo abierto
                            }}
                          >
                            <IonIcon icon={checkmarkCircleOutline} slot="start" />
                            Marcar como leída
                          </IonButton>
                        )}
                      </div>
                    </IonCardContent>
                  </IonCard>
                  ))}
                </IonList>
              );
            })()}
          </IonContent>
          
          <IonFooter>
            <IonToolbar>
              <IonButton 
                expand="full" 
                onClick={() => setShowNotificacionesModal(false)}
                fill="clear"
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

export default Picking;
