import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonFooter,
  IonText,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonModal,
  IonTextarea,
  useIonViewWillEnter,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { pencil, trash, add, search, shirt, document, playBack, playForward, chevronBack, chevronForward, cubeOutline, checkmarkCircle, warningOutline, close } from "ionicons/icons";
import axiosInstance from "../../config/axios";
import {
  obtenerIndumentariaPaginada,
  obtenerIndumentariasNoAptas,
  IndumentariaItem,
  exportarIndumentariaPDF,
  obtenerMotivosNoApta,
  moverANoApta,
  reingresarAStock,
  marcarComoScrap,
  MotivoNoApta,
  Rack,
  obtenerCategoriasDisponibles,
  filtrarPrendasPorCategoria,
} from "../../utils/indumentariaUtils";
import "./Indumentaria.css";

const PAGE_SIZE = 6;

const Indumentaria: React.FC = () => {
  const history = useHistory();
  const [prendas, setPrendas] = useState<IndumentariaItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mostrarNoAptas, setMostrarNoAptas] = useState(false);
  
  // Estados para exportar PDF por categoría
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>([]);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todas');

  const cargarIndumentaria = async () => {
    setLoading(true);
    try {
      const data = mostrarNoAptas 
        ? await obtenerIndumentariasNoAptas(page, PAGE_SIZE, busqueda)
        : await obtenerIndumentariaPaginada(page, PAGE_SIZE, busqueda);
      setPrendas(Array.isArray(data.prendas) ? data.prendas : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } catch (error) {
      setPrendas([]); // fallback seguro
      setTotal(0);
      setAlertMsg("Error al cargar indumentaria.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarIndumentaria();
    // eslint-disable-next-line
  }, [page, busqueda, mostrarNoAptas]);

  // Hook para refrescar automáticamente cuando se ingresa a la página
  useIonViewWillEnter(() => {
    cargarIndumentaria();
  });

    const [showNoAptaAlert, setShowNoAptaAlert] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [cantidadNoApta, setCantidadNoApta] = useState<number>(0);
  const [motivoNoApta, setMotivoNoApta] = useState<string>("");

  // Estados para motivos predefinidos
  const [motivosNoApta, setMotivosNoApta] = useState<MotivoNoApta[]>([]);
  const [idMotivoSeleccionado, setIdMotivoSeleccionado] = useState<number | null>(null);

  // Estados para agregar stock
  const [showAgregarStockAlert, setShowAgregarStockAlert] = useState(false);
  const [cantidadAgregar, setCantidadAgregar] = useState<number>(0);
  const [motivoStock, setMotivoStock] = useState<string>("");

  // Estados para reingreso
  const [showReingresoAlert, setShowReingresoAlert] = useState(false);
  const [cantidadReingreso, setCantidadReingreso] = useState<number>(0);
  const [observacionesReingreso, setObservacionesReingreso] = useState<string>("");

  // Estados para scrap
  const [showScrapAlert, setShowScrapAlert] = useState(false);
  const [cantidadScrap, setCantidadScrap] = useState<number>(0);
  const [observacionesScrap, setObservacionesScrap] = useState<string>("");

  // Cargar motivos predefinidos al montar el componente
  useEffect(() => {
    const cargarMotivos = async () => {
      try {
        const motivos = await obtenerMotivosNoApta();
        setMotivosNoApta(motivos);
      } catch (error) {
        console.error('Error al cargar motivos:', error);
      }
    };
    
    cargarMotivos();
  }, []);

  // Cargar categorías disponibles para el filtro de PDF según el contexto
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        // Obtener las prendas del contexto actual
        const prendasActuales = mostrarNoAptas 
          ? await obtenerIndumentariasNoAptas(1, 9999, '')
          : await obtenerIndumentariaPaginada(1, 9999, '');
        
        // Extraer categorías únicas de las prendas actuales
        const categoriasUnicas = Array.from(
          new Set(
            prendasActuales.prendas
              .map((prenda: IndumentariaItem) => prenda.categoria)
              .filter((cat: string | undefined) => cat)
          )
        ) as string[];
        
        setCategoriasDisponibles(['Todas', ...categoriasUnicas.sort()]);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    
    cargarCategorias();
  }, [mostrarNoAptas]); // Recarga cuando cambia el filtro

  // Manejar agregar stock
  const handleAgregarStock = async (id: string) => {
    console.log('Iniciando proceso de agregar stock para:', id);
    setSelectedItem(id);
    setShowAgregarStockAlert(true);
  };

  // Confirmar agregar stock
  const confirmarAgregarStock = async () => {
    if (!selectedItem || cantidadAgregar <= 0) return;

    try {
      await axiosInstance.post(`/api/indumentaria/stock/movimiento`, {
        codigoIndumentaria: selectedItem,
        cantidad: cantidadAgregar,
        observaciones: motivoStock || "Incremento manual de stock"
      });
      
      cargarIndumentaria();
      setAlertMsg(`Stock incrementado correctamente. Se agregaron ${cantidadAgregar} unidades.`);
      setShowAlert(true);
    } catch (error: any) {
      setAlertMsg(error.response?.data?.error || "Error al agregar stock.");
      setShowAlert(true);
    } finally {
      setShowAgregarStockAlert(false);
      setSelectedItem(null);
      setCantidadAgregar(0);
      setMotivoStock("");
    }
  };

  // Manejar cambio a No Apta
  const handleNoApta = async (id: string) => {
    console.log('Iniciando proceso de No Apta para:', id);
    const prenda = prendas.find(p => p.codigoIndumentaria === id);
    if (!prenda) return;
    
    if (prenda.cantidadIndumentaria <= 0) {
      setAlertMsg("No hay stock disponible para mover a No Apto");
      setShowAlert(true);
      return;
    }
    
    setSelectedItem(id);
    setShowNoAptaAlert(true);
    
    // Actualizar el mensaje del alert para mostrar el stock disponible
    setAlertMsg(`Hay ${prenda.cantidadIndumentaria} unidades disponibles en stock.\nIngrese la cantidad que desea marcar como No Apta:`);
  };

  // Confirmar cambio a No Apta
  const confirmarNoApta = async () => {
    if (!selectedItem || cantidadNoApta <= 0) return;

    try {
      await axiosInstance.post(`/api/indumentaria/${selectedItem}/no-apta`, {
        cantidad: cantidadNoApta,
        motivo: motivoNoApta
      });
      
      cargarIndumentaria();
      setAlertMsg("Stock movido a No Apto correctamente.");
      setShowAlert(true);
    } catch (error: any) {
      setAlertMsg(error.response?.data?.error || "Error al mover stock a No Apto.");
      setShowAlert(true);
    } finally {
      setShowNoAptaAlert(false);
      setSelectedItem(null);
      setCantidadNoApta(0);
      setMotivoNoApta("");
    }
  };

  // Manejar reingreso a stock (desde No Apta)
  const handleReingreso = async (id: string) => {
    console.log('Iniciando proceso de reingreso para:', id);
    const prenda = prendas.find(p => p.codigoIndumentaria === id);
    if (!prenda) return;
    
    if (prenda.cantidadIndumentaria <= 0) {
      setAlertMsg("No hay stock no apto disponible para reingresar");
      setShowAlert(true);
      return;
    }
    
    setSelectedItem(id);
    setCantidadReingreso(1); // 👈 Valor por defecto en 1
    setShowReingresoAlert(true);
  };

  // Confirmar reingreso a stock
  const confirmarReingreso = async () => {
    if (!selectedItem || cantidadReingreso <= 0) {
      setAlertMsg("Por favor ingrese la cantidad a reingresar");
      setShowAlert(true);
      return;
    }

    try {
      const response = await reingresarAStock(
        selectedItem,
        cantidadReingreso,
        observacionesReingreso
      );
      
      cargarIndumentaria();
      setAlertMsg(response?.message || `${cantidadReingreso} unidades reingresadas correctamente a su rack original`);
      setShowAlert(true);
    } catch (error: any) {
      setAlertMsg(error.message || "Error al reingresar a stock");
      setShowAlert(true);
    } finally {
      setShowReingresoAlert(false);
      setSelectedItem(null);
      setCantidadReingreso(0);
      setObservacionesReingreso("");
    }
  };

  // Manejar scrap (desecho)
  const handleScrap = async (id: string) => {
    console.log('Iniciando proceso de scrap para:', id);
    const prenda = prendas.find(p => p.codigoIndumentaria === id);
    if (!prenda) return;
    
    if (prenda.cantidadIndumentaria <= 0) {
      setAlertMsg("No hay stock no apto disponible para marcar como scrap");
      setShowAlert(true);
      return;
    }
    
    setSelectedItem(id);
    setCantidadScrap(1); // 👈 Valor por defecto en 1
    setShowScrapAlert(true);
  };

  // Confirmar scrap
  const confirmarScrap = async () => {
    if (!selectedItem || cantidadScrap <= 0) return;

    try {
      await marcarComoScrap(
        selectedItem,
        cantidadScrap,
        observacionesScrap
      );
      
      cargarIndumentaria();
      setAlertMsg(`${cantidadScrap} unidades marcadas como scrap (desechadas)`);
      setShowAlert(true);
    } catch (error: any) {
      setAlertMsg(error.message || "Error al marcar como scrap");
      setShowAlert(true);
    } finally {
      setShowScrapAlert(false);
      setSelectedItem(null);
      setCantidadScrap(0);
      setObservacionesScrap("");
    }
  };

  // Función para abrir modal de opciones de PDF
  const handleExportarPDF = () => {
    setShowPDFModal(true);
  };

  // Función para generar PDF con filtros
  const generarPDF = async () => {
    try {
      setLoading(true);
      setShowPDFModal(false);
      
      // Obtener todas las prendas según el filtro activo (No Aptas o todas)
      const todasLasPrendas = mostrarNoAptas 
        ? await obtenerIndumentariasNoAptas(1, 9999, busqueda)
        : await obtenerIndumentariaPaginada(1, 9999, busqueda);
      
      // Filtrar por categoría si no es "Todas"
      const prendasFiltradas = filtrarPrendasPorCategoria(
        todasLasPrendas.prendas, 
        categoriaSeleccionada
      );
      
      // Exportar PDF con categoría seleccionada y tipo de filtro
      await exportarIndumentariaPDF(
        prendasFiltradas, 
        busqueda,
        categoriaSeleccionada !== 'Todas' ? categoriaSeleccionada : undefined,
        mostrarNoAptas
      );
      
      setAlertMsg("PDF generado exitosamente");
      setShowAlert(true);
    } catch (error) {
      setAlertMsg("Error al generar el PDF");
      setShowAlert(true);
    } finally {
      setLoading(false);
      setCategoriaSeleccionada('Todas');
    }
  };

  const [showPageDropdown, setShowPageDropdown] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Función para obtener clase de stock según cantidad
  const getStockClass = (cantidad: number) => {
    if (cantidad >= 20) return "alto";
    if (cantidad >= 5) return "medio";
    return "bajo";
  };

  // Función para obtener clase de estado
  const getEstadoClass = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === "apta") return "apta";
    if (estadoLower === "no apta") return "no-apta";
    // Fallback para estados activo/inactivo por compatibilidad
    return estadoLower === "activo" ? "activo" : "inactivo";
  };

  return (
    <IonPage className="indumentaria-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={shirt} style={{ marginRight: '8px' }} />
            Gestión de Indumentaria
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        {/* Buscador y botón nueva prenda */}
        <div className="search-container">
          <IonItem lines="none">
            <IonIcon icon={search} slot="start" style={{ color: '#64748b' }} />
            <IonInput
              placeholder="Buscar por descripción, código, color, talle o categoría..."
              value={busqueda}
              onIonChange={(e) => {
                setPage(1);
                setBusqueda(e.detail.value!);
              }}
              clearInput
            />
            <IonButton
              slot="end"
              color="secondary"
              onClick={handleExportarPDF}
              disabled={loading || prendas.length === 0}
              style={{ marginRight: '8px' }}
            >
              <IonIcon icon={document} slot="start" />
              PDF
            </IonButton>
            <IonButton
              slot="end"
              onClick={() => history.push("/alta-indumentaria")}
              disabled={mostrarNoAptas}
              title={mostrarNoAptas ? "No disponible en vista de No Aptas" : "Agregar nueva indumentaria"}
            >
              <IonIcon icon={add} slot="start" />
              Nueva Indumentaria
            </IonButton>
          </IonItem>
        </div>

        {/* Filtro de indumentarias no aptas */}
        <div className="filter-container" style={{ 
          padding: '12px 16px', 
          backgroundColor: mostrarNoAptas ? '#fff3cd' : 'transparent',
          borderLeft: mostrarNoAptas ? '4px solid #ffc107' : 'none',
          transition: 'all 0.3s ease'
        }}>
          <IonItem lines="none" style={{ '--background': 'transparent' }}>
            <IonLabel style={{ 
              color: mostrarNoAptas ? '#856404' : '#64748b',
              fontWeight: mostrarNoAptas ? 'bold' : 'normal'
            }}>
              {mostrarNoAptas ? '🔍 Mostrando Indumentarias No Aptas' : 'Mostrar solo Indumentarias No Aptas'}
            </IonLabel>
            <IonButton
              slot="end"
              fill={mostrarNoAptas ? "solid" : "outline"}
              color={mostrarNoAptas ? "warning" : "medium"}
              onClick={() => {
                setMostrarNoAptas(!mostrarNoAptas);
                setPage(1); // Resetear a la primera página
              }}
            >
              <IonIcon icon={trash} slot="start" />
              {mostrarNoAptas ? 'Ver Todas' : 'Ver No Aptas'}
            </IonButton>
          </IonItem>
        </div>

        {/* Contador de total */}
        <div className="total-counter">
          <IonIcon icon={shirt} style={{ color: '#fdb40b', fontSize: '1.2em' }} />
          <IonText>
            Total de {mostrarNoAptas ? 'Indumentarias No Aptas' : 'Indumentaria registradas'}: <b>{total}</b>
            {busqueda && (
              <span style={{ color: '#64748b', marginLeft: '8px' }}>
                (filtradas por: "{busqueda}")
              </span>
            )}
            {mostrarNoAptas && (
              <span style={{ color: '#856404', marginLeft: '8px', fontWeight: 'bold' }}>
                ⚠️ (Solo No Aptas - Rack 99)
              </span>
            )}
          </IonText>
        </div>

        {/* Tabla de indumentaria */}
        <IonGrid className="tabla-indumentaria">
          <IonRow className="tabla-header">
            <IonCol size="1">Código</IonCol>
            <IonCol size="1">Nombre</IonCol>
            <IonCol size="1">Color</IonCol>
            <IonCol size="1">Tela</IonCol>
            <IonCol size="0.5">Talle</IonCol>
            <IonCol size="1">Categoría</IonCol>
            <IonCol size="1">Precio</IonCol>
            <IonCol size="1">Estado</IonCol>
            <IonCol size="1">Stock</IonCol>
            <IonCol size="1">Unidad</IonCol>
            <IonCol size="0.5">Rack</IonCol>
            <IonCol size="2">Acciones</IonCol>
          </IonRow>
          
          {loading ? (
            <IonRow>
              <IonCol size="12" className="ion-text-center ion-padding">
                <IonSpinner name="crescent" color="primary" />
                <p style={{ marginTop: '16px', color: '#64748b' }}>
                  Cargando Indumentariass...
                </p>
              </IonCol>
            </IonRow>
          ) : prendas.length === 0 ? (
            <IonRow>
              <IonCol size="12">
                <div className="empty-state">
                  <IonIcon icon={shirt} className="empty-icon" />
                  <h3 className="empty-title">
                    {mostrarNoAptas 
                      ? 'No hay indumentarias no aptas' 
                      : busqueda 
                        ? 'No se encontraron indumentarias' 
                        : 'No hay indumentarias registradas'
                    }
                  </h3>
                  <p className="empty-description">
                    {mostrarNoAptas
                      ? '✅ Excelente! No hay indumentarias marcadas como "No Aptas" en este momento.'
                      : busqueda 
                        ? `No hay Indumentariass que coincidan con "${busqueda}". Intenta con otros términos de búsqueda.`
                        : 'Comienza agregando tu primera Indumentaria al inventario.'
                    }
                  </p>
                  {!busqueda && !mostrarNoAptas && (
                    <IonButton 
                      style={{ marginTop: '20px' }}
                      onClick={() => history.push("/alta-indumentaria")}
                    >
                      <IonIcon icon={add} slot="start" />
                      Agregar Primera Indumentaria
                    </IonButton>
                  )}
                </div>
              </IonCol>
            </IonRow>
          ) : (
            (prendas || []).map((item) => (
              <IonRow key={item.codigoIndumentaria}>
                <IonCol size="1">
                  <span className="codigo-badge">{item.codigoIndumentaria}</span>
                </IonCol>
                <IonCol size="1">{item.nombre}</IonCol>
                <IonCol size="1">{item.color}</IonCol>
                <IonCol size="1">{item.nombreTela}</IonCol>
                <IonCol size="0.5">{item.talle}</IonCol>
                <IonCol size="1">{item.categoria}</IonCol>
                <IonCol size="1">
                  <span className="precio-badge">${item.precio}</span>
                </IonCol>
                <IonCol size="1">
                  <span className={`estado-badge ${getEstadoClass(item.estado)}`}>
                    {item.estado}
                  </span>
                </IonCol>
                <IonCol size="1">
                  <span className={`stock-badge ${getStockClass(item.cantidadIndumentaria)}`}>
                    {item.cantidadIndumentaria}
                  </span>
                </IonCol>
                <IonCol size="1">
                  <span className="unidad-badge">{item.unidad}</span>
                </IonCol>
                <IonCol size="0.5">
                  <span className="rack-badge">#{item.Stock?.numeroRack || 'N/A'}</span>
                </IonCol>
                <IonCol size="2">
                  <div className="actions-container">
                    {mostrarNoAptas ? (
                      <>
                        <IonButton
                          fill="solid"
                          color="success"
                          size="small"
                          onClick={() => handleReingreso(item.codigoIndumentaria)}
                          title="Reingresar a Stock (Reparado)"
                        >
                          <IonIcon icon={cubeOutline} />
                          <span style={{ marginLeft: '4px', fontSize: '0.75rem' }}>Reparar</span>
                        </IonButton>
                        <IonButton
                          fill="solid"
                          color="danger"
                          size="small"
                          onClick={() => handleScrap(item.codigoIndumentaria)}
                          title="Marcar como Scrap (Desecho)"
                        >
                          <IonIcon icon={trash} />
                          <span style={{ marginLeft: '4px', fontSize: '0.75rem' }}>Scrap</span>
                        </IonButton>
                      </>
                    ) : (
                      <>
                        <IonButton
                          fill="solid"
                          color="primary"
                          size="small"
                          onClick={() =>
                            history.push(
                              `/alta-indumentaria/${item.codigoIndumentaria}`
                            )
                          }
                        >
                          <IonIcon icon={pencil} />
                        </IonButton>
                        <IonButton
                          fill="solid"
                          color="success"
                          size="small"
                          onClick={() => handleAgregarStock(item.codigoIndumentaria)}
                          title="Agregar Stock"
                        >
                          <IonIcon icon={cubeOutline} />
                        </IonButton>
                        <IonButton
                          fill="solid"
                          color="warning"
                          size="small"
                          onClick={() => handleNoApta(item.codigoIndumentaria)}
                          title="Mover a No Apta"
                        >
                          <IonIcon icon={trash} />
                        </IonButton>
                      </>
                    )}
                  </div>
                </IonCol>
              </IonRow>
            ))
          )}
        </IonGrid>
      </IonContent>

      {/* Paginación mejorada */}
      {totalPages > 1 && (
        <IonFooter className="pagination-footer">
          <div className="pagination-controls">
            {/* Botón Volver */}
            <IonButton
              color="warning"
              size="small"
              onClick={() => history.push("/dashboard")}
              style={{ marginRight: '16px', minWidth: '90px' }}
            >
              Volver
            </IonButton>
            
            {/* Botón ir al inicio */}
            <IonButton
              fill="outline"
              size="small"
              disabled={page === 1}
              onClick={() => setPage(1)}
              className="pagination-first-last"
            >
              <IonIcon icon={playBack} />
            </IonButton>
            
            {/* Botón anterior */}
            <IonButton
              fill="outline"
              size="small"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <IonIcon icon={chevronBack} slot="icon-only" />
            </IonButton>
            
            {/* Selector de página personalizado */}
            <div className="page-selector">
              <div className="page-select-custom">
                <button 
                  className="page-select-button"
                  onClick={() => setShowPageDropdown(!showPageDropdown)}
                >
                  {page}
                  <span className="dropdown-arrow">▼</span>
                </button>
                
                {showPageDropdown && (
                  <div className={`page-dropdown ${totalPages > 10 ? 'with-scroll' : ''}`}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        className={`page-dropdown-item ${pageNum === page ? 'active' : ''}`}
                        onClick={() => {
                          setPage(pageNum);
                          setShowPageDropdown(false);
                        }}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Overlay para cerrar el dropdown al hacer clic fuera */}
              {showPageDropdown && (
                <div 
                  className="dropdown-overlay"
                  onClick={() => setShowPageDropdown(false)}
                />
              )}
            </div>
            
            {/* Información de páginas */}
            <div className="pagination-info">
              de {totalPages}
            </div>
            
            {/* Botón siguiente */}
            <IonButton
              fill="outline"
              size="small"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <IonIcon icon={chevronForward} slot="icon-only" />
            </IonButton>
            
            {/* Botón ir al final */}
            <IonButton
              fill="outline"
              size="small"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(totalPages)}
              className="pagination-first-last"
            >
              <IonIcon icon={playForward} />
            </IonButton>
          </div>
          
          {/* Información adicional de registros */}
          <div className="pagination-summary">
            Mostrando {((page - 1) * PAGE_SIZE) + 1} - {Math.min(page * PAGE_SIZE, total)} de {total} registros
          </div>
        </IonFooter>
      )}

      <IonAlert
        isOpen={showAlert}
        message={alertMsg}
        buttons={["Aceptar"]}
        onDidDismiss={() => setShowAlert(false)}
      />

      {/* Modal para mover a No Apta */}
      <IonModal 
        isOpen={showNoAptaAlert} 
        onDidDismiss={() => {
          setShowNoAptaAlert(false);
          setSelectedItem(null);
          setIdMotivoSeleccionado(null);
          setCantidadNoApta(0);
          setMotivoNoApta('');
        }}
        className="modal-no-apta"
      >
        <IonHeader>
          <IonToolbar color="warning">
            <IonTitle>
              <IonIcon icon={trash} style={{ marginRight: '8px' }} />
              Mover a No Apta
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="modal-no-apta-container">
            {/* Header con info del producto */}
            <div className="modal-no-apta-header">
              <div className="modal-no-apta-header-content">
                <IonIcon icon={shirt} className="modal-no-apta-header-icon" />
                <h3 className="modal-no-apta-header-title">
                  Indumentaria: <span style={{ 
                    fontFamily: '"Monaco", "Menlo", monospace',
                    background: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    marginLeft: '8px'
                  }}>{selectedItem || 'N/A'}</span>
                </h3>
              </div>
              <p className="modal-no-apta-header-description">
                {alertMsg || `Disponible: ${prendas.find(p => p.codigoIndumentaria === selectedItem)?.cantidadIndumentaria || 0} unidades`}
              </p>
            </div>

            {/* Campo de Cantidad */}
            <IonItem className="modal-no-apta-item">
              <IonLabel position="stacked" className="modal-no-apta-label">
                Cantidad a mover <span className="modal-no-apta-label-required">*</span>
              </IonLabel>
              <IonInput
                type="number"
                placeholder="Ingrese la cantidad"
                min={1}
                max={prendas.find(p => p.codigoIndumentaria === selectedItem)?.cantidadIndumentaria}
                value={cantidadNoApta || ''}
                onIonChange={(e) => setCantidadNoApta(Number(e.detail.value))}
                className="modal-no-apta-input"
              />
            </IonItem>

            {/* Selector de Motivo */}
            <IonItem className="modal-no-apta-item">
              <IonLabel position="stacked" className="modal-no-apta-label">
                Motivo de rechazo <span className="modal-no-apta-label-required">*</span>
              </IonLabel>
              <IonSelect
                placeholder="Seleccione un motivo"
                value={idMotivoSeleccionado}
                onIonChange={(e) => setIdMotivoSeleccionado(Number(e.detail.value))}
                interface="popover"
                className="modal-no-apta-select"
              >
                {motivosNoApta.length > 0 ? (
                  motivosNoApta.map((motivo) => (
                    <IonSelectOption key={motivo.idMotivo} value={motivo.idMotivo}>
                      {motivo.descripcion}
                    </IonSelectOption>
                  ))
                ) : (
                  <IonSelectOption value={0} disabled>
                    Cargando motivos...
                  </IonSelectOption>
                )}
              </IonSelect>
            </IonItem>

            {/* Observaciones opcionales */}
            <IonItem className="modal-no-apta-item">
              <IonLabel position="stacked" className="modal-no-apta-label">
                Observaciones <span className="modal-no-apta-label-optional">(opcional)</span>
              </IonLabel>
              <IonTextarea
                placeholder="Detalles adicionales sobre el estado de la prenda..."
                rows={4}
                value={motivoNoApta}
                onIonChange={(e) => setMotivoNoApta(e.detail.value || '')}
                className="modal-no-apta-textarea"
              />
            </IonItem>

            {/* Nota informativa */}
            <div className="modal-no-apta-info">
              <IonIcon icon={cubeOutline} className="modal-no-apta-info-icon" />
              <IonText className="modal-no-apta-info-text">
                La indumentaria se moverá al <strong>Rack 99</strong> (No Apta) y quedará registrada para su posterior evaluación.
              </IonText>
            </div>
          </div>
        </IonContent>
        <IonFooter className="modal-no-apta-footer">
          <IonToolbar>
            <div className="modal-no-apta-buttons">
              <IonButton 
                expand="block"
                fill="outline"
                color="medium"
                onClick={() => {
                  setShowNoAptaAlert(false);
                  setSelectedItem(null);
                  setIdMotivoSeleccionado(null);
                  setCantidadNoApta(0);
                  setMotivoNoApta('');
                }}
                className="modal-no-apta-btn-cancel"
              >
                Cancelar
              </IonButton>
              <IonButton 
                expand="block"
                color="warning"
                onClick={async () => {
                  if (!selectedItem || cantidadNoApta <= 0 || !idMotivoSeleccionado) {
                    setAlertMsg("Por favor complete todos los campos requeridos (cantidad y motivo)");
                    setShowAlert(true);
                    return;
                  }
                  
                  const prenda = prendas.find(p => p.codigoIndumentaria === selectedItem);
                  if (!prenda) return;
                  
                  if (cantidadNoApta > prenda.cantidadIndumentaria) {
                    setAlertMsg(`No hay suficiente stock disponible. Máximo disponible: ${prenda.cantidadIndumentaria}`);
                    setShowAlert(true);
                    return;
                  }
                  
                  try {
                    const response = await moverANoApta(
                      selectedItem,
                      cantidadNoApta,
                      idMotivoSeleccionado,
                      motivoNoApta || ''
                    );
                    
                    cargarIndumentaria();
                    setAlertMsg(response.message || "Stock movido a No Apto correctamente.");
                    setShowAlert(true);
                    setShowNoAptaAlert(false);
                    setSelectedItem(null);
                    setIdMotivoSeleccionado(null);
                    setCantidadNoApta(0);
                    setMotivoNoApta('');
                  } catch (error: any) {
                    console.error('Error:', error);
                    setAlertMsg(error.message || "Error al mover stock a No Apto.");
                    setShowAlert(true);
                  }
                }}
                className="modal-no-apta-btn-confirm"
                style={{ flex: '2' }}
              >
                <IonIcon icon={trash} slot="start" />
                Mover a No Apta
              </IonButton>
            </div>
          </IonToolbar>
        </IonFooter>
      </IonModal>

      {/* Alert para agregar stock */}
      <IonAlert
        isOpen={showAgregarStockAlert}
        header="Agregar Stock"
        subHeader={selectedItem ? `Indumentaria: ${selectedItem}` : ''}
        message="Ingrese la cantidad de stock que desea agregar:"
        inputs={[
          {
            name: 'cantidad',
            type: 'number',
            placeholder: 'Cantidad a agregar',
            min: 1
          },
          {
            name: 'motivo',
            type: 'text',
            placeholder: 'Motivo/Observación (opcional)',
            value: 'Incremento manual de stock'
          }
        ]}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              setShowAgregarStockAlert(false);
              setSelectedItem(null);
              setCantidadAgregar(0);
              setMotivoStock("");
            }
          },
          {
            text: 'Agregar',
            handler: async (data) => {
              if (!selectedItem || !data.cantidad) {
                setAlertMsg("Por favor ingrese una cantidad");
                setShowAlert(true);
                return false;
              }
              
              const cantidad = Number(data.cantidad);
              if (cantidad <= 0) {
                setAlertMsg("La cantidad debe ser mayor a 0");
                setShowAlert(true);
                return false;
              }
              
              try {
                console.log('Agregando stock:', {
                  codigoIndumentaria: selectedItem,
                  cantidad: cantidad,
                  motivo: data.motivo || 'Incremento manual de stock'
                });
                
                const response = await axiosInstance.post(`/api/indumentaria/stock/movimiento`, {
                  codigoIndumentaria: selectedItem,
                  cantidad: cantidad,
                  observaciones: data.motivo || "Incremento manual de stock"
                });
                
                console.log('Respuesta agregar stock:', response.data);
                
                cargarIndumentaria();
                setAlertMsg(`Stock incrementado correctamente. Se agregaron ${cantidad} unidades.`);
                setShowAlert(true);
                setShowAgregarStockAlert(false);
                setSelectedItem(null);
              } catch (error: any) {
                console.error('Error al agregar stock:', {
                  mensaje: error.message,
                  respuesta: error.response?.data,
                  status: error.response?.status
                });
                setAlertMsg(error.response?.data?.error || "Error al agregar stock.");
                setShowAlert(true);
                return false;
              }
            }
          }
        ]}
      />

      {/* Modal para reingreso a stock */}
      <IonModal 
        isOpen={showReingresoAlert} 
        onDidDismiss={() => {
          setShowReingresoAlert(false);
          setSelectedItem(null);
          setCantidadReingreso(0);
          setObservacionesReingreso('');
        }}
        className="modal-no-apta"
      >
        <IonHeader>
          <IonToolbar color="success">
            <IonTitle>
              <IonIcon icon={cubeOutline} style={{ marginRight: '8px' }} />
              Reingresar a Stock Original
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="modal-no-apta-container">
            {/* Header con info del producto */}
            <div className="modal-reingreso-header">
              <div className="modal-reingreso-header-content">
                <IonIcon icon={shirt} className="modal-reingreso-header-icon" />
                <h3 className="modal-reingreso-header-title">
                  Indumentaria: <span style={{ 
                    fontFamily: '"Monaco", "Menlo", monospace',
                    background: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    marginLeft: '8px'
                  }}>{selectedItem || 'N/A'}</span>
                </h3>
              </div>
              <p className="modal-reingreso-header-description">
                Disponible para reingreso: {prendas.find(p => p.codigoIndumentaria === selectedItem)?.cantidadIndumentaria || 0} unidades
              </p>
            </div>

            {/* Campo de Cantidad */}
            <IonItem className="modal-no-apta-item">
              <IonLabel position="stacked" className="modal-no-apta-label">
                Cantidad a reingresar <span className="modal-no-apta-label-required">*</span>
              </IonLabel>
              <IonInput
                type="number"
                placeholder="Ingrese la cantidad"
                min={1}
                max={prendas.find(p => p.codigoIndumentaria === selectedItem)?.cantidadIndumentaria}
                value={cantidadReingreso || ''}
                onIonChange={(e) => setCantidadReingreso(Number(e.detail.value))}
                className="modal-no-apta-input"
              />
            </IonItem>

            {/* Observaciones opcionales */}
            <IonItem className="modal-no-apta-item">
              <IonLabel position="stacked" className="modal-no-apta-label">
                Observaciones sobre la reparación <span className="modal-no-apta-label-optional">(opcional)</span>
              </IonLabel>
              <IonTextarea
                placeholder="Describa la reparación realizada..."
                rows={4}
                value={observacionesReingreso}
                onIonChange={(e) => setObservacionesReingreso(e.detail.value || '')}
                className="modal-no-apta-textarea"
              />
            </IonItem>

            {/* Nota informativa */}
            <div className="modal-reingreso-info">
              <IonIcon icon={checkmarkCircle} className="modal-reingreso-info-icon" />
              <IonText className="modal-reingreso-info-text">
                <strong>✅ Reingreso automático:</strong> La indumentaria será reparada y regresará <strong>automáticamente a su rack original</strong>, quedando disponible para venta nuevamente.
              </IonText>
            </div>
          </div>
        </IonContent>
        <IonFooter className="modal-no-apta-footer">
          <IonToolbar>
            <div className="modal-no-apta-buttons">
              <IonButton 
                expand="block"
                fill="outline"
                color="medium"
                onClick={() => {
                  setShowReingresoAlert(false);
                  setSelectedItem(null);
                  setCantidadReingreso(0);
                  setObservacionesReingreso('');
                }}
                className="modal-no-apta-btn-cancel"
              >
                Cancelar
              </IonButton>
              <IonButton 
                expand="block"
                color="success"
                onClick={async () => {
                  if (!selectedItem || cantidadReingreso <= 0) {
                    setAlertMsg("Por favor ingrese la cantidad a reingresar");
                    setShowAlert(true);
                    return;
                  }
                  
                  const prenda = prendas.find(p => p.codigoIndumentaria === selectedItem);
                  if (!prenda) return;
                  
                  if (cantidadReingreso > prenda.cantidadIndumentaria) {
                    setAlertMsg(`No hay suficiente stock disponible. Máximo disponible: ${prenda.cantidadIndumentaria}`);
                    setShowAlert(true);
                    return;
                  }
                  
                  try {
                    const response = await reingresarAStock(
                      selectedItem,
                      cantidadReingreso,
                      observacionesReingreso || ''
                    );
                    
                    cargarIndumentaria();
                    setAlertMsg(response?.message || `${cantidadReingreso} unidades reingresadas correctamente a su rack original`);
                    setShowAlert(true);
                    setShowReingresoAlert(false);
                    setSelectedItem(null);
                    setCantidadReingreso(0);
                    setObservacionesReingreso('');
                  } catch (error: any) {
                    console.error('Error:', error);
                    setAlertMsg(error.message || "Error al reingresar a stock.");
                    setShowAlert(true);
                  }
                }}
                className="modal-reingreso-btn-confirm"
                style={{ flex: '2' }}
              >
                <IonIcon icon={checkmarkCircle} slot="start" />
                Reingresar a Rack Original
              </IonButton>
            </div>
          </IonToolbar>
        </IonFooter>
      </IonModal>

      {/* Modal para marcar como scrap */}
      <IonModal 
        isOpen={showScrapAlert} 
        onDidDismiss={() => {
          setShowScrapAlert(false);
          setSelectedItem(null);
          setCantidadScrap(0);
          setObservacionesScrap('');
        }}
        className="modal-no-apta"
      >
        <IonHeader>
          <IonToolbar color="danger">
            <IonTitle>
              <IonIcon icon={warningOutline} style={{ marginRight: '8px' }} />
              Marcar como Scrap (Desecho)
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="modal-no-apta-container">
            {/* Header con info del producto */}
            <div className="modal-scrap-header">
              <div className="modal-scrap-header-content">
                <IonIcon icon={shirt} className="modal-scrap-header-icon" />
                <h3 className="modal-scrap-header-title">
                  Indumentaria: <span style={{ 
                    fontFamily: '"Monaco", "Menlo", monospace',
                    background: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    marginLeft: '8px'
                  }}>{selectedItem || 'N/A'}</span>
                </h3>
              </div>
              <p className="modal-scrap-header-description">
                Disponible para desecho: {prendas.find(p => p.codigoIndumentaria === selectedItem)?.cantidadIndumentaria || 0} unidades
              </p>
            </div>

            {/* Campo de Cantidad */}
            <IonItem className="modal-no-apta-item">
              <IonLabel position="stacked" className="modal-no-apta-label">
                Cantidad a desechar <span className="modal-no-apta-label-required">*</span>
              </IonLabel>
              <IonInput
                type="number"
                placeholder="Ingrese la cantidad"
                min={1}
                max={prendas.find(p => p.codigoIndumentaria === selectedItem)?.cantidadIndumentaria}
                value={cantidadScrap || ''}
                onIonChange={(e) => setCantidadScrap(Number(e.detail.value))}
                className="modal-no-apta-input"
              />
            </IonItem>

            {/* Observaciones - Recomendadas */}
            <IonItem className="modal-no-apta-item">
              <IonLabel position="stacked" className="modal-no-apta-label">
                Motivo del desecho <span style={{ color: '#f59e0b', fontWeight: '500', fontSize: '0.85em' }}>(recomendado)</span>
              </IonLabel>
              <IonTextarea
                placeholder="Describa el motivo por el cual se desecha esta indumentaria..."
                rows={4}
                value={observacionesScrap}
                onIonChange={(e) => setObservacionesScrap(e.detail.value || '')}
                className="modal-no-apta-textarea"
              />
            </IonItem>

            {/* Advertencia de scrap */}
            <div className="modal-scrap-warning">
              <IonIcon icon={warningOutline} className="modal-scrap-warning-icon" />
              <IonText className="modal-scrap-warning-text">
                <strong>⚠️ ADVERTENCIA:</strong> Esta acción marcará la indumentaria como desechada de forma permanente. La indumentaria no podrá ser recuperada ni vendida.
              </IonText>
            </div>
          </div>
        </IonContent>
        <IonFooter className="modal-no-apta-footer">
          <IonToolbar>
            <div className="modal-no-apta-buttons">
              <IonButton 
                expand="block"
                fill="outline"
                color="medium"
                onClick={() => {
                  setShowScrapAlert(false);
                  setSelectedItem(null);
                  setCantidadScrap(0);
                  setObservacionesScrap('');
                }}
                className="modal-no-apta-btn-cancel"
              >
                Cancelar
              </IonButton>
              <IonButton 
                expand="block"
                color="danger"
                onClick={async () => {
                  if (!selectedItem || cantidadScrap <= 0) {
                    setAlertMsg("Por favor ingrese la cantidad a desechar");
                    setShowAlert(true);
                    return;
                  }
                  
                  const prenda = prendas.find(p => p.codigoIndumentaria === selectedItem);
                  if (!prenda) return;
                  
                  if (cantidadScrap > prenda.cantidadIndumentaria) {
                    setAlertMsg(`No hay suficiente stock disponible. Máximo disponible: ${prenda.cantidadIndumentaria}`);
                    setShowAlert(true);
                    return;
                  }
                  
                  try {
                    const response = await marcarComoScrap(
                      selectedItem,
                      cantidadScrap,
                      observacionesScrap || ''
                    );
                    
                    cargarIndumentaria();
                    setAlertMsg(response?.message || `${cantidadScrap} unidades marcadas como scrap (desechadas)`);
                    setShowAlert(true);
                    setShowScrapAlert(false);
                    setSelectedItem(null);
                    setCantidadScrap(0);
                    setObservacionesScrap('');
                  } catch (error: any) {
                    console.error('Error:', error);
                    setAlertMsg(error.message || "Error al marcar como scrap.");
                    setShowAlert(true);
                  }
                }}
                className="modal-scrap-btn-confirm"
                style={{ flex: '2' }}
              >
                <IonIcon icon={trash} slot="start" />
                Confirmar Desecho
              </IonButton>
            </div>
          </IonToolbar>
        </IonFooter>
      </IonModal>

      {/* Modal para seleccionar categoría para PDF */}
      <IonModal 
        isOpen={showPDFModal} 
        onDidDismiss={() => {
          setShowPDFModal(false);
          setCategoriaSeleccionada('Todas');
        }}
        className="modal-pdf-export"
      >
        <IonHeader className="modal-pdf-header-wrapper">
          <IonToolbar className="modal-pdf-toolbar">
            <IonTitle className="modal-pdf-header-title">
              <div className="modal-pdf-header-content">
                <IonIcon icon={document} className="modal-pdf-header-icon" />
                <span>Exportar a PDF</span>
              </div>
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonContent className="modal-pdf-content">
          <div className="modal-pdf-container">
            {/* Sección de encabezado */}
            <div className="modal-pdf-intro">
              <div className="modal-pdf-intro-icon">📄</div>
              <h2 className="modal-pdf-title">Configurar Exportación</h2>
              <p className="modal-pdf-description">
                Configure las opciones para generar su documento PDF personalizado
              </p>
            </div>

            {/* Formulario de selección */}
            <div className="modal-pdf-form">
              <IonItem lines="none" className="modal-pdf-item">
                <IonLabel position="stacked" className="modal-pdf-label">
                  <span className="modal-pdf-label-text">Categoría</span>
                  <span className="modal-pdf-label-required">*</span>
                </IonLabel>
                <IonSelect
                  placeholder="Seleccione una categoría"
                  value={categoriaSeleccionada}
                  onIonChange={(e) => setCategoriaSeleccionada(e.detail.value)}
                  interface="action-sheet"
                  className="modal-pdf-select"
                  interfaceOptions={{
                    header: 'Seleccione una categoría',
                    cssClass: 'modal-pdf-action-sheet'
                  }}
                >
                  {categoriasDisponibles.map((cat) => (
                    <IonSelectOption key={cat} value={cat}>
                      {cat}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              {/* Indicadores de información */}
              <div className="modal-pdf-indicators">
                {/* Indicador de modo No Aptas */}
                {mostrarNoAptas && (
                  <div className="modal-pdf-indicator modal-pdf-indicator-no-aptas">
                    <div className="modal-pdf-indicator-icon">⚠️</div>
                    <div className="modal-pdf-indicator-content">
                      <p className="modal-pdf-indicator-title">Modo No Aptas Activo</p>
                      <p className="modal-pdf-indicator-text">
                        El PDF contendrá <strong>únicamente indumentarias no aptas</strong> (Rack 99)
                      </p>
                    </div>
                  </div>
                )}

                {categoriaSeleccionada !== 'Todas' && (
                  <div className="modal-pdf-indicator modal-pdf-indicator-category">
                    <div className="modal-pdf-indicator-icon">📋</div>
                    <div className="modal-pdf-indicator-content">
                      <p className="modal-pdf-indicator-title">PDF Filtrado</p>
                      <p className="modal-pdf-indicator-text">
                        Se incluirán únicamente productos de: <strong>{categoriaSeleccionada}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {categoriaSeleccionada === 'Todas' && !mostrarNoAptas && (
                  <div className="modal-pdf-indicator modal-pdf-indicator-all">
                    <div className="modal-pdf-indicator-icon">📊</div>
                    <div className="modal-pdf-indicator-content">
                      <p className="modal-pdf-indicator-title">PDF Completo</p>
                      <p className="modal-pdf-indicator-text">
                        Se incluirán productos de todas las categorías disponibles
                      </p>
                    </div>
                  </div>
                )}

                {busqueda && (
                  <div className="modal-pdf-indicator modal-pdf-indicator-search">
                    <div className="modal-pdf-indicator-icon">🔍</div>
                    <div className="modal-pdf-indicator-content">
                      <p className="modal-pdf-indicator-title">Filtro de Búsqueda Activo</p>
                      <p className="modal-pdf-indicator-text">
                        Término de búsqueda: <strong>"{busqueda}"</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </IonContent>
        
        <IonFooter className="modal-pdf-footer">
          <IonToolbar className="modal-pdf-footer-toolbar">
            <div className="modal-pdf-buttons">
              <IonButton 
                expand="block"
                fill="outline"
                onClick={() => {
                  setShowPDFModal(false);
                  setCategoriaSeleccionada('Todas');
                }}
                className="modal-pdf-btn-cancel"
              >
                <IonIcon icon={close} slot="start" />
                Cancelar
              </IonButton>
              <IonButton 
                expand="block"
                onClick={generarPDF}
                disabled={loading}
                className="modal-pdf-btn-generate"
              >
                <IonIcon icon={document} slot="start" />
                {loading ? 'Generando...' : 'Generar PDF'}
              </IonButton>
            </div>
          </IonToolbar>
        </IonFooter>
      </IonModal>
    </IonPage>
  );
};

export default Indumentaria;
