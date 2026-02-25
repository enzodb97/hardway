import React, { useState, useEffect } from 'react';
import { formatFechaHoraCompleta } from '../../utils/dateFormatters';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonSkeletonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonChip,
  IonLabel,
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
import { obtenerHistorialUsuario } from '../../utils/usuariosUtils';
import './HistorialUsuario.css';

interface HistorialUsuarioProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  usuarioId: number;
  usuarioNombre: string;
}

interface HistorialItem {
  idHistorial: number;
  idUsuario: number;
  estaActivo: number;
  fechaCambio: string;
  idUsuarioModifico: number | null;
  usuarioModifico: string;
  idMotivoInactivacion?: number;
  motivoDescripcion?: string;
  observaciones?: string;
}

const HistorialUsuario: React.FC<HistorialUsuarioProps> = ({
  isOpen,
  onDidDismiss,
  usuarioId,
  usuarioNombre,
}) => {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && usuarioId) {
      cargarHistorial();
    }
  }, [isOpen, usuarioId]);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const data = await obtenerHistorialUsuario(usuarioId);
      setHistorial(data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaString: string) => {
    return formatFechaHoraCompleta(fechaString);
  };

  const formatearFechaRelativa = (fechaString: string) => {
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) return 'Hoy';
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
    if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} meses`;
    return `Hace ${Math.floor(diffDias / 365)} años`;
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
    
    const estadoActual = historial[index].estaActivo;
    const estadoAnterior = historial[index + 1].estaActivo;
    
    if (estadoActual > estadoAnterior) {
      return { icon: trendingUp, color: 'success', text: 'Reactivación' };
    } else {
      return { icon: trendingDown, color: 'warning', text: 'Inactivación' };
    }
  };

  const getEstadisticas = () => {
    const totalCambios = historial.length;
    const activaciones = historial.filter(h => h.estaActivo === 1).length;
    const inactivaciones = historial.filter(h => h.estaActivo === 0).length;
    const estadoActual = historial[0]?.estaActivo;
    
    return { totalCambios, activaciones, inactivaciones, estadoActual };
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
        {/* Header del usuario */}
        <div className="usuario-header">
          <div className="usuario-avatar">
            <IonIcon icon={person} />
          </div>
          <div className="usuario-info">
            <h2>{usuarioNombre}</h2>
            <p>ID: {usuarioId}</p>
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
            <p>No hay registros de cambios de estado para este usuario.</p>
          </div>
        ) : (
          <div className="historial-container">
            {/* Estadísticas */}
            {estadisticas && (
              <IonCard className="estadisticas-card">
                <IonCardHeader>
                  <IonCardTitle color="light">
                    <IonIcon icon={analytics} />
                    Estadísticas
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-value">{estadisticas.totalCambios}</div>
                      <div className="stat-label">Total de Cambios</div>
                    </div>
                    <div className="stat-item stat-success">
                      <div className="stat-value">{estadisticas.activaciones}</div>
                      <div className="stat-label">Activaciones</div>
                    </div>
                    <div className="stat-item stat-danger">
                      <div className="stat-value">{estadisticas.inactivaciones}</div>
                      <div className="stat-label">Inactivaciones</div>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            )}

            {/* Timeline de historial */}
            <div className="timeline-section">
              <div className="timeline-header">
                <h3>
                  <IonIcon icon={time} />
                  Línea de Tiempo
                </h3>
              </div>

              <div className="timeline">
                {historial.map((item, index) => {
                  const estadoInfo = getEstadoInfo(item.estaActivo);
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
                            
                            {/* Mostrar motivo de inactivación si existe */}
                            {item.idMotivoInactivacion && item.motivoDescripcion && (
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

export default HistorialUsuario;
