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
  IonTextarea,
  IonRadioGroup,
  IonRadio,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { close, warning, informationCircle } from 'ionicons/icons';
import { useClientes, MotivoBaja } from '../../context/ClientesContext';
import './ModalMotivoBaja.css';

interface ModalMotivoBajaProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  clienteId: number;
  clienteNombre: string;
  onConfirm: (idMotivo: number, observaciones?: string) => void;
}

const ModalMotivoBaja: React.FC<ModalMotivoBajaProps> = ({
  isOpen,
  onDidDismiss,
  clienteId,
  clienteNombre,
  onConfirm,
}) => {
  const [motivos, setMotivos] = useState<MotivoBaja[]>([]);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { obtenerMotivosBaja } = useClientes();

  useEffect(() => {
    if (isOpen) {
      cargarMotivos();
      // Resetear estado
      setMotivoSeleccionado(null);
      setObservaciones('');
      setError('');
    }
  }, [isOpen]);

  const cargarMotivos = async () => {
    setLoading(true);
    try {
      const data = await obtenerMotivosBaja();
      setMotivos(data);
    } catch (error) {
      console.error('Error al cargar motivos:', error);
      setError('Error al cargar los motivos de baja');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = () => {
    if (!motivoSeleccionado) {
      setError('Debe seleccionar un motivo de baja');
      return;
    }

    // Validar que si el motivo es "Otro", se requieran observaciones
    const motivoOtro = motivos.find(m => m.idMotivo === motivoSeleccionado);
    if (motivoOtro?.descripcion.includes('Otro') && !observaciones.trim()) {
      setError('Para el motivo "Otro" debe especificar observaciones');
      return;
    }

    onConfirm(motivoSeleccionado, observaciones.trim() || undefined);
    onDidDismiss();
  };

  const handleCancelar = () => {
    setMotivoSeleccionado(null);
    setObservaciones('');
    setError('');
    onDidDismiss();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss} className="modal-motivo-baja">
      <IonHeader className="modal-header">
        <IonToolbar>
          <IonTitle className="modal-title">
            <div className="title-content">
              <IonIcon icon={warning} className="warning-icon" />
              <span>Dar de Baja Cliente</span>
            </div>
          </IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            onClick={handleCancelar}
            className="close-button"
          >
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="modal-content">
        <div className="cliente-info-card">
          <IonIcon icon={informationCircle} className="info-icon" />
          <div className="info-text">
            <h3>Cliente a dar de baja</h3>
            <p><strong>{clienteNombre}</strong></p>
            <p className="subtitle">ID: {clienteId}</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando motivos...</p>
          </div>
        ) : (
          <>
            <div className="motivos-section">
              <h4>Seleccione el motivo de la baja</h4>
              <IonRadioGroup
                value={motivoSeleccionado}
                onIonChange={(e) => {
                  setMotivoSeleccionado(e.detail.value);
                  setError('');
                }}
              >
                <IonList className="motivos-list">
                  {motivos.map((motivo) => (
                    <IonItem key={motivo.idMotivo} className="motivo-item">
                      <IonRadio
                        slot="start"
                        value={motivo.idMotivo}
                        color="danger"
                      />
                      <IonLabel className="motivo-label">
                        {motivo.descripcion}
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonRadioGroup>
            </div>

            <div className="observaciones-section">
              <h4>Observaciones {motivos.find(m => m.idMotivo === motivoSeleccionado)?.descripcion.includes('Otro') && <span className="required">*</span>}</h4>
              <IonTextarea
                value={observaciones}
                onIonChange={(e) => setObservaciones(e.detail.value || '')}
                placeholder="Agregue detalles adicionales sobre la baja (opcional)"
                rows={4}
                className="observaciones-textarea"
                maxlength={255}
              />
              <IonText color="medium" className="char-count">
                {observaciones.length}/255 caracteres
              </IonText>
            </div>

            {error && (
              <div className="error-message">
                <IonIcon icon={warning} />
                <span>{error}</span>
              </div>
            )}
          </>
        )}
      </IonContent>

      <div className="modal-footer">
        <IonButton
          fill="clear"
          color="medium"
          onClick={handleCancelar}
          className="cancel-btn"
        >
          Cancelar
        </IonButton>
        <IonButton
          fill="solid"
          color="danger"
          onClick={handleConfirmar}
          disabled={loading || !motivoSeleccionado}
          className="confirm-btn"
        >
          <IonIcon icon={warning} slot="start" />
          Confirmar Baja
        </IonButton>
      </div>
    </IonModal>
  );
};

export default ModalMotivoBaja;
