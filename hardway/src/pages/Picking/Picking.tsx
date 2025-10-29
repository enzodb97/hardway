import React, { useEffect, useState } from "react";
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
} from "ionicons/icons";
import { useAuth } from "../../context/AuthContext";
import { useHistory } from "react-router-dom";
import {
  cargarTareasPicking,
  verPickingList,
  completarTareaPicking,
  exportarPedidoPDF,
} from "../../utils/pickingUtils";
import "./Picking.css";

const PAGE_SIZE = 6; // Cantidad de tareas por página

const Picking: React.FC = () => {
  const { username, rol, legajoPicker } = useAuth();
  const history = useHistory();
  const [tareas, setTareas] = useState<any[]>([]);
  const [tareasFiltradas, setTareasFiltradas] = useState<any[]>([]);
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [tareaSeleccionada, setTareaSeleccionada] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pickingList, setPickingList] = useState<any[]>([]);
  const [showPickingList, setShowPickingList] = useState(false);
  
  // Estados de paginación
  const [page, setPage] = useState(1);
  const [showPageDropdown, setShowPageDropdown] = useState(false);

  const cargarTareas = async () => {
    setLoading(true);
    try {
      // Usar legajoPicker si el rol es Picker, sino username (para admin no importa)
      const pickerId = rol === "Picker" ? legajoPicker : username;
      const data = await cargarTareasPicking(rol || "", pickerId || "");
      console.log("📋 Tareas cargadas desde backend:", data);
      console.log("📊 Estados de las tareas:", data.map((t: any) => ({ pedido: t.numeroPedido, idEstado: t.idEstado, completado: t.completado })));
      setTareas(data);
      setTareasFiltradas(data); // Inicialmente mostrar todas las tareas
    } catch (err) {
      setAlertMsg("Error al cargar tareas");
      setShowAlert(true);
    }
    setLoading(false);
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

  useEffect(() => {
    cargarTareas();
    // eslint-disable-next-line
  }, []);

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
      }

      // Transformamos los datos para tener un formato compatible con el componente
      if (response && response.pedido && response.pedido.DetallePedidos) {
        // Convertir los detalles del pedido al formato esperado por el componente
        const itemsFormateados = response.pedido.DetallePedidos.map(
          (detalle: any) => {
            // Extraemos los datos anidados
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
              cantidad: detalle.cantidad,
              rack:
                indumentaria.Stock?.Rack?.numeroRack ||
                indumentaria.Stock?.idRack?.toString() ||
                "Sin asignar",
              categoria: categoria.categoria || "Sin categoría",
              color: color.color || "N/A",
              talle: talle.talle || "N/A",
            };
          }
        );

        setPickingList(itemsFormateados);
      } else {
        // Si no hay datos o el formato es inesperado, inicializamos como array vacío
        setPickingList([]);
      }

      setShowPickingList(true);
    } catch (err) {
      console.error("Error detallado:", err);
      setAlertMsg("Error al obtener picking list");
      setShowAlert(true);
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
      if (!idAsignacion && rol === "Administrador") {
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
              <IonCol size="12" sizeMd="4">
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
              <IonCol size="12" sizeMd="4">
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
              <IonCol size="12" sizeMd="4">
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
                              <span>Pedido {tarea.numeroPedido}</span>
                            </div>
                            {rol === "Administrador" && tarea.pickerAsignado && (
                              <div className="picker-badge">
                                {tarea.pickerAsignado}
                              </div>
                            )}
                          </div>
                          
                          <div className="task-info">
                            <div className="info-item">
                              <IonIcon icon={timeOutline} />
                              <span>
                                {new Date(tarea.fechaAsignacion).toLocaleString("es-AR")}
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
                                  const productos = (response?.pedido?.DetallePedidos || []).map((detalle: any) => {
                                    const indumentaria = detalle.Indumentarium || {};
                                    const detalleInd = indumentaria.DetalleIndumentarium || {};
                                    const nombreInd = detalleInd.NombreIndumentarium || {};
                                    const color = detalleInd.Color || {};
                                    const talle = detalleInd.Talle || {};
                                    const categoria = detalleInd.CategoriaIndumentarium || {};
                                    return {
                                      id: indumentaria.idIndumentaria || detalle.codigoIndumentaria || "-",
                                      nombre: nombreInd.nombre || "Sin nombre",
                                      cantidad: detalle.cantidad || 0,
                                      rack: indumentaria.Stock?.Rack?.numeroRack || indumentaria.Stock?.idRack?.toString() || "Sin asignar",
                                      categoria: categoria.categoria || "Sin categoría",
                                      color: color.color || "N/A",
                                      talle: talle.talle || "N/A",
                                    };
                                  });
                                  exportarPedidoPDF({
                                    id: tarea.numeroPedido,
                                    productos,
                                  });
                                } catch (err) {
                                  setAlertMsg("Error al exportar el pedido a PDF");
                                  setShowAlert(true);
                                }
                              }}
                            >
                              <IonIcon icon={printOutline} slot="start" />
                              PDF
                            </IonButton>
                            
                            <IonButton
                              size="small"
                              color="primary"
                              fill="outline"
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
                              <span className="detail-value">{item.cantidad ?? "-"}</span>
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
          header="Confirmar Finalización"
          message="¿Estás seguro de que deseas marcar esta tarea como completada? Esta acción actualizará el estado del pedido."
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
              cssClass: "alert-button-cancel",
            },
            {
              text: "Completar Tarea",
              cssClass: "alert-button-confirm",
              handler: () => {
                if (!tareaSeleccionada || !tareaSeleccionada.idAsignacion) {
                  setAlertMsg("Error: No se encontró ID de asignación para esta tarea");
                  setShowAlert(true);
                  return false;
                }
                return handleCompletarTarea(
                  tareaSeleccionada.idAsignacion,
                  tareaSeleccionada.numeroPedido
                );
              },
            },
          ]}
        />
        
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
      </IonContent>
    </IonPage>
  );
};

export default Picking;
