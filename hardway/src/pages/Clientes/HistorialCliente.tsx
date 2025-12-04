import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonNote,
  IonSkeletonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonChip,
  IonAvatar,
  IonProgressBar,
} from '@ionic/react';
import { 
  close, 
  time, 
  person, 
  checkmarkCircle, 
  closeCircle, 
  trendingUp, 
  trendingDown,
  calendar,
  analytics,
  document,
  alertCircle,
  chatbubbleEllipses
} from 'ionicons/icons';
import { useClientes } from '../../context/ClientesContext';
import './HistorialCliente.css';

interface HistorialClienteProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  clienteId: number;
  clienteNombre: string;
}

interface HistorialItem {
  idHistorial: number;
  idCliente: number;
  idEstado: number;
  estadoDescripcion: string;
  fechaCambio: string;
  idUsuarioModifico: number;
  usuarioModifico: string;
  idMotivo?: number;
  motivoDescripcion?: string;
  observaciones?: string;
}

const HistorialCliente: React.FC<HistorialClienteProps> = ({
  isOpen,
  onDidDismiss,
  clienteId,
  clienteNombre,
}) => {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { obtenerHistorialCliente } = useClientes();

  useEffect(() => {
    if (isOpen && clienteId) {
      cargarHistorial();
    }
  }, [isOpen, clienteId]);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const data = await obtenerHistorialCliente(clienteId);
      setHistorial(data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearFechaRelativa = (fechaString: string) => {
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`;
    return `Hace ${Math.floor(dias / 365)} años`;
  };

  const getEstadoInfo = (estado: number) => {
    if (estado === 1) {
      return {
        color: 'success',
        icon: checkmarkCircle,
        text: 'Activo',
        bgClass: 'estado-activo'
      };
    } else {
      return {
        color: 'danger',
        icon: closeCircle,
        text: 'Inactivo',
        bgClass: 'estado-inactivo'
      };
    }
  };

  const getTendencia = (index: number) => {
    if (index === historial.length - 1) return null; // Primer registro
    
    const estadoActual = historial[index].idEstado;
    const estadoAnterior = historial[index + 1].idEstado;
    
    if (estadoActual > estadoAnterior) {
      return { icon: trendingUp, color: 'success', text: 'Reactivación' };
    } else {
      return { icon: trendingDown, color: 'warning', text: 'Baja' };
    }
  };

  const getEstadisticas = () => {
    const totalCambios = historial.length;
    const altas = historial.filter(h => h.idEstado === 1).length;
    const bajas = historial.filter(h => h.idEstado === 0).length;
    const estadoActual = historial[0]?.idEstado;
    
    return { totalCambios, altas, bajas, estadoActual };
  };

  const estadisticas = historial.length > 0 ? getEstadisticas() : null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss} className="historial-modal">
      <IonHeader className="historial-header">
        <IonToolbar>
          <IonTitle className="historial-title">
            <div className="title-content">
              <IonIcon icon={analytics} />
              <span>Historial de Estados</span>
            </div>
          </IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            onClick={onDidDismiss}
            className="close-button"
          >
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="historial-content">
        {/* Header del cliente */}
        <div className="cliente-header">
          <div className="cliente-avatar">
            <IonIcon icon={person} />
          </div>
          <div className="cliente-info">
            <h2>{clienteNombre}</h2>
            <p>ID: {clienteId}</p>
            {estadisticas && (
              <IonChip 
                color={getEstadoInfo(estadisticas.estadoActual).color}
                className="estado-actual-chip"
              >
                <IonIcon icon={getEstadoInfo(estadisticas.estadoActual).icon} />
                <IonLabel>{getEstadoInfo(estadisticas.estadoActual).text}</IonLabel>
              </IonChip>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <IonProgressBar type="indeterminate" />
            <div className="skeleton-cards">
              {[1, 2, 3].map(i => (
                <IonCard key={i} className="skeleton-card">
                  <IonCardContent>
                    <IonSkeletonText animated style={{ width: '60%', height: '20px' }} />
                    <IonSkeletonText animated style={{ width: '100%', height: '16px' }} />
                    <IonSkeletonText animated style={{ width: '80%', height: '16px' }} />
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          </div>
        ) : historial.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <IonIcon icon={document} />
            </div>
            <h3>Sin historial</h3>
            <p>No hay registros de cambios de estado para este cliente.</p>
          </div>
        ) : (
          <div className="historial-container">
            {/* Estadísticas */}
            {estadisticas && (
              <IonCard className="estadisticas-card">
                <IonCardHeader>
                  <IonCardTitle className="stats-title">
                    <IonIcon icon={analytics} />
                    Resumen de Actividad
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-number">{estadisticas.totalCambios}</div>
                      <div className="stat-label">Total de cambios</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number success">{estadisticas.altas}</div>
                      <div className="stat-label">Activaciones</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number danger">{estadisticas.bajas}</div>
                      <div className="stat-label">Desactivaciones</div>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            )}

            {/* Timeline del historial */}
            <div className="timeline-container">
              <div className="timeline-header">
                <h3>
                  <IonIcon icon={time} />
                  Línea de Tiempo
                </h3>
              </div>

              <div className="timeline">
                {historial.map((item, index) => {
                  const estadoInfo = getEstadoInfo(item.idEstado);
                  const tendencia = getTendencia(index);
                  const esReciente = index === 0;
                  
                  return (
                    <div key={item.idHistorial} className={`timeline-item ${estadoInfo.bgClass} ${esReciente ? 'reciente' : ''}`}>
                      <div className="timeline-marker">
                        <div className={`marker-icon ${estadoInfo.color}`}>
                          <IonIcon icon={estadoInfo.icon} />
                        </div>
                        {index < historial.length - 1 && <div className="timeline-line" />}
                      </div>
                      
                      <div className="timeline-content">
                        <IonCard className="timeline-card">
                          <IonCardContent>
                            <div className="timeline-header-content">
                              <div className="estado-info">
                                <IonBadge color={estadoInfo.color} className="estado-badge">
                                  {estadoInfo.text}
                                </IonBadge>
                                {tendencia && (
                                  <IonChip color={tendencia.color} className="tendencia-chip">
                                    <IonIcon icon={tendencia.icon} />
                                    <IonLabel>{tendencia.text}</IonLabel>
                                  </IonChip>
                                )}
                                {esReciente && (
                                  <IonChip color="primary" className="reciente-chip">
                                    <IonLabel>Más reciente</IonLabel>
                                  </IonChip>
                                )}
                              </div>
                              
                              <div className="orden-numero">
                                #{historial.length - index}
                              </div>
                            </div>
                            
                            <div className="fecha-info">
                              <div className="fecha-principal">
                                <IonIcon icon={calendar} />
                                <span>{formatearFecha(item.fechaCambio)}</span>
                              </div>
                              <div className="fecha-relativa">
                                {formatearFechaRelativa(item.fechaCambio)}
                              </div>
                            </div>
                            
                            {item.usuarioModifico && (
                              <div className="usuario-info">
                                <IonIcon icon={person} />
                                <span>Modificado por: <strong>{item.usuarioModifico}</strong></span>
                              </div>
                            )}
                            
                            {/* Mostrar motivo de baja si existe */}
                            {item.idMotivo && item.motivoDescripcion && (
                              <div className="motivo-info">
                                <IonIcon icon={alertCircle} />
                                <span>Motivo: <strong>{item.motivoDescripcion}</strong></span>
                              </div>
                            )}
                            
                            {/* Mostrar observaciones si existen */}
                            {item.observaciones && (
                              <div className="observaciones-info">
                                <IonIcon icon={chatbubbleEllipses} />
                                <span><strong>Observaciones:</strong> {item.observaciones}</span>
                              </div>
                            )}
                          </IonCardContent>
                        </IonCard>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default HistorialCliente;
