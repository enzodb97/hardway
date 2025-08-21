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
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { pencil, trash, add, search, shirt } from "ionicons/icons";
import axiosInstance from "../../config/axios";
import {
  obtenerIndumentariaPaginada,
  IndumentariaItem,
} from "../../utils/indumentariaUtils";
import "./Indumentaria.css";

const PAGE_SIZE = 10;

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

  // Eliminar prenda
  const handleEliminar = async (id: string) => {
    if (window.confirm("¿Seguro que desea eliminar esta prenda?")) {
      try {
        await axiosInstance.delete(`/api/indumentaria/${id}`);
        cargarIndumentaria();
        setAlertMsg("Prenda eliminada exitosamente.");
        setShowAlert(true);
      } catch (error) {
        setAlertMsg("Error al eliminar prenda.");
        setShowAlert(true);
      }
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
              onClick={() => history.push("/alta-indumentaria")}
            >
              <IonIcon icon={add} slot="start" />
              Nueva Prenda
            </IonButton>
          </IonItem>
        </div>

        {/* Contador de total */}
        <div className="total-counter">
          <IonIcon icon={shirt} style={{ color: '#fdb40b', fontSize: '1.2em' }} />
          <IonText>
            Total de prendas registradas: <b>{total}</b>
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
                  Cargando prendas...
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
                      ? `No hay prendas que coincidan con "${busqueda}". Intenta con otros términos de búsqueda.`
                      : 'Comienza agregando tu primera prenda al inventario.'
                    }
                  </p>
                  {!busqueda && (
                    <IonButton 
                      style={{ marginTop: '20px' }}
                      onClick={() => history.push("/alta-indumentaria")}
                    >
                      <IonIcon icon={add} slot="start" />
                      Agregar Primera Prenda
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
                      color="danger"
                      size="small"
                      onClick={() => handleEliminar(item.codigoIndumentaria)}
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

      {/* Paginación */}
      {totalPages > 1 && (
        <IonFooter className="pagination-footer">
          <div className="pagination-controls">
            <IonButton
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </IonButton>
            
            <div className="pagination-info">
              Página {page} de {totalPages}
            </div>
            
            <IonButton
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </IonButton>
          </div>
        </IonFooter>
      )}

      <IonAlert
        isOpen={showAlert}
        message={alertMsg}
        buttons={["Aceptar"]}
        onDidDismiss={() => setShowAlert(false)}
      />
    </IonPage>
  );
};

export default Indumentaria;
