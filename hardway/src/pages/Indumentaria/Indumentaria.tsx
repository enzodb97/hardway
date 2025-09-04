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
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { pencil, trash, add, search, shirt, document, playBack, playForward, chevronBack, chevronForward } from "ionicons/icons";
import axiosInstance from "../../config/axios";
import {
  obtenerIndumentariaPaginada,
  IndumentariaItem,
  exportarIndumentariaPDF,
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

  const cargarIndumentaria = async () => {
    setLoading(true);
    try {
      const data = await obtenerIndumentariaPaginada(page, PAGE_SIZE, busqueda);
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
  }, [page, busqueda]);

    const [showNoAptaAlert, setShowNoAptaAlert] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [cantidadNoApta, setCantidadNoApta] = useState<number>(0);
  const [motivoNoApta, setMotivoNoApta] = useState<string>("");

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

  // Función para exportar PDF
  const handleExportarPDF = async () => {
    try {
      setLoading(true);
      // Obtener todas las prendas (sin paginación) para el PDF
      const todasLasPrendas = await obtenerIndumentariaPaginada(1, 9999, busqueda);
      await exportarIndumentariaPDF(todasLasPrendas.prendas, busqueda);
      setAlertMsg("PDF generado exitosamente");
      setShowAlert(true);
    } catch (error) {
      setAlertMsg("Error al generar el PDF");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

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
              placeholder="Buscar por descripción, código, color o talle..."
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
            >
              <IonIcon icon={add} slot="start" />
              Nueva Indumentaria
            </IonButton>
          </IonItem>
        </div>

        {/* Contador de total */}
        <div className="total-counter">
          <IonIcon icon={shirt} style={{ color: '#fdb40b', fontSize: '1.2em' }} />
          <IonText>
            Total de Indumentaria registradas: <b>{total}</b>
            {busqueda && (
              <span style={{ color: '#64748b', marginLeft: '8px' }}>
                (filtradas por: "{busqueda}")
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
            <IonCol size="1">Talle</IonCol>
            <IonCol size="1">Categoría</IonCol>
            <IonCol size="1">Precio</IonCol>
            <IonCol size="1">Estado</IonCol>
            <IonCol size="1">Stock</IonCol>
            <IonCol size="1">Unidad</IonCol>
            <IonCol size="1">Rack</IonCol>
            <IonCol size="1">Acciones</IonCol>
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
                    {busqueda ? 'No se encontraron prendas' : 'No hay prendas registradas'}
                  </h3>
                  <p className="empty-description">
                    {busqueda 
                      ? `No hay Indumentariass que coincidan con "${busqueda}". Intenta con otros términos de búsqueda.`
                      : 'Comienza agregando tu primera Indumentaria al inventario.'
                    }
                  </p>
                  {!busqueda && (
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
                <IonCol size="1">{item.talle}</IonCol>
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
                <IonCol size="1">
                  <span className="rack-badge">#{item.Stock?.numeroRack || 'N/A'}</span>
                </IonCol>
                <IonCol size="1">
                  <div className="actions-container">
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
                      color="warning"
                      size="small"
                      onClick={() => handleNoApta(item.codigoIndumentaria)}
                    >
                      <IonIcon icon={trash} />
                    </IonButton>
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
            
            {/* Selector de página */}
            <div className="page-selector">
              <IonSelect
                value={page}
                onIonChange={(e) => setPage(e.detail.value)}
                interface="popover"
                className="page-select"
                interfaceOptions={{
                  side: 'top',
                  displayflex: 'center',
                  justifyContent: 'center',
                  alignment: 'center',
                  size: 'auto',
                  showBackdrop: true,
                  translucent: false,
                  cssClass: 'page-selector-popover'
                }}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <IonSelectOption key={pageNum} value={pageNum}>
                    {pageNum}
                  </IonSelectOption>
                ))}
              </IonSelect>
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

      {/* Alert para mover a No Apta */}
      <IonAlert
        isOpen={showNoAptaAlert}
        header="Mover a No Apta"
        subHeader={selectedItem ? `Indumentaria: ${selectedItem}` : ''}
        message={alertMsg}
        inputs={[
          {
            name: 'cantidad',
            type: 'number',
            placeholder: 'Cantidad',
            min: 1,
            max: selectedItem ? prendas.find(p => p.codigoIndumentaria === selectedItem)?.cantidadIndumentaria : undefined
          },
          {
            name: 'motivo',
            type: 'text',
            placeholder: 'Motivo (opcional)'
          }
        ]}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              setShowNoAptaAlert(false);
              setSelectedItem(null);
            }
          },
          {
            text: 'Confirmar',
            handler: async (data) => {
              if (!selectedItem || !data.cantidad) {
                setAlertMsg("Por favor ingrese una cantidad");
                setShowAlert(true);
                return false;
              }
              
              const prenda = prendas.find(p => p.codigoIndumentaria === selectedItem);
              if (!prenda) return false;
              
              const cantidad = Number(data.cantidad);
              if (cantidad <= 0) {
                setAlertMsg("La cantidad debe ser mayor a 0");
                setShowAlert(true);
                return false;
              }
              
              if (cantidad > prenda.cantidadIndumentaria) {
                setAlertMsg(`No hay suficiente stock disponible. Máximo disponible: ${prenda.cantidadIndumentaria}`);
                setShowAlert(true);
                return false;
              }
              
              try {
                console.log('Enviando datos:', {
                  cantidad: cantidad,
                  motivo: data.motivo || ''
                });
                
                const response = await axiosInstance.post(`/api/indumentaria/${selectedItem}/no-apta`, {
                  cantidad: cantidad,
                  motivo: data.motivo || ''
                });
                
                console.log('Respuesta:', response.data);
                
                cargarIndumentaria();
                setAlertMsg("Stock movido a No Apto correctamente.");
                setShowAlert(true);
                setShowNoAptaAlert(false);
                setSelectedItem(null);
              } catch (error: any) {
                console.error('Error detallado:', {
                  mensaje: error.message,
                  respuesta: error.response?.data,
                  status: error.response?.status
                });
                setAlertMsg(error.response?.data?.error || "Error al mover stock a No Apto.");
                setShowAlert(true);
                return false;
              }
            }
          }
        ]}
      />
    </IonPage>
  );
};

export default Indumentaria;
