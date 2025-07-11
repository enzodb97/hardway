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
} from '@ionic/react';
import { close, time, person, checkmark, close as closeIcon } from 'ionicons/icons';
import { useClientes } from '../context/ClientesContext';

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
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstadoColor = (estado: number) => {
    return estado === 1 ? 'success' : 'danger';
  };

  const getEstadoIcon = (estado: number) => {
    return estado === 1 ? checkmark : closeIcon;
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Historial de {clienteNombre}</IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            onClick={onDidDismiss}
          >
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {loading ? (
          <div>
            <IonCard>
              <IonCardHeader>
                <IonSkeletonText animated style={{ width: '60%' }} />
              </IonCardHeader>
              <IonCardContent>
                <IonSkeletonText animated style={{ width: '100%' }} />
                <IonSkeletonText animated style={{ width: '80%' }} />
              </IonCardContent>
            </IonCard>
            <IonCard>
              <IonCardHeader>
                <IonSkeletonText animated style={{ width: '60%' }} />
              </IonCardHeader>
              <IonCardContent>
                <IonSkeletonText animated style={{ width: '100%' }} />
                <IonSkeletonText animated style={{ width: '80%' }} />
              </IonCardContent>
            </IonCard>
          </div>
        ) : historial.length === 0 ? (
          <IonCard>
            <IonCardContent>
              <p style={{ textAlign: 'center', color: '#666' }}>
                No hay historial de cambios para este cliente.
              </p>
            </IonCardContent>
          </IonCard>
        ) : (
          <div>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={time} style={{ marginRight: '8px' }} />
                  Historial de Estados
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>Total de cambios: <strong>{historial.length}</strong></p>
                <p>Estado actual: 
                  <IonBadge 
                    color={getEstadoColor(historial[0]?.idEstado)} 
                    style={{ marginLeft: '8px' }}
                  >
                    {historial[0]?.estadoDescripcion}
                  </IonBadge>
                </p>
              </IonCardContent>
            </IonCard>

            <IonList>
              {historial.map((item, index) => (
                <IonItem key={item.idHistorial}>
                  <IonIcon 
                    icon={getEstadoIcon(item.idEstado)} 
                    color={getEstadoColor(item.idEstado)}
                    slot="start" 
                  />
                  <IonLabel>
                    <h3>
                      <IonBadge color={getEstadoColor(item.idEstado)}>
                        {item.estadoDescripcion}
                      </IonBadge>
                    </h3>
                    <p>
                      <IonIcon icon={time} style={{ marginRight: '4px' }} />
                      {formatearFecha(item.fechaCambio)}
                    </p>
                    {item.usuarioModifico && (
                      <p>
                        <IonIcon icon={person} style={{ marginRight: '4px' }} />
                        Modificado por: {item.usuarioModifico}
                      </p>
                    )}
                  </IonLabel>
                  <IonNote slot="end" color="medium">
                    #{index + 1}
                  </IonNote>
                </IonItem>
              ))}
            </IonList>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default HistorialCliente;
