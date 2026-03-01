import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonText,
  IonProgressBar,
  IonItem,
  IonLabel,
  IonNote,
  IonCard,
  IonCardContent,
  IonList,
  IonSpinner,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import {
  close,
  lockClosed,
  checkmarkCircle,
  alertCircle,
  keyOutline,
  timeOutline,
  shieldCheckmarkOutline,
  caretDownSharp,
} from 'ionicons/icons';
import { solicitarRecuperacion, restablecerPassword, obtenerMotivosRecuperacion, verificarCodigoRecuperacion } from '../../services/recuperacionPasswordService';
import './ModalRecuperacionPassword.css';

interface ModalRecuperacionPasswordProps {
  isOpen: boolean;
  onDidDismiss: () => void;
}

type EstadoModal = 'solicitar' | 'esperando' | 'restablecer' | 'exito';

interface MotivoRecuperacion {
  idMotivo: number;
  descripcion: string;
}

const ModalRecuperacionPassword: React.FC<ModalRecuperacionPasswordProps> = ({
  isOpen,
  onDidDismiss,
}) => {
  const [estadoActual, setEstadoActual] = useState<EstadoModal>('solicitar');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [motivos, setMotivos] = useState<MotivoRecuperacion[]>([]);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<number | undefined>();
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validaciones de contraseña
  const [validaciones, setValidaciones] = useState({
    longitud: false,
    numero: false,
    letra: false,
    especial: false,
  });

  useEffect(() => {
    if (isOpen) {
      // Resetear estado al abrir modal
      resetearFormulario();
      // Cargar motivos
      cargarMotivos();
    }
  }, [isOpen]);

  const cargarMotivos = async () => {
    try {
      const motivosData = await obtenerMotivosRecuperacion();
      setMotivos(motivosData);
    } catch (error) {
      console.error('Error al cargar motivos:', error);
    }
  };

  useEffect(() => {
    // Actualizar validaciones en tiempo real
    if (nuevaPassword) {
      setValidaciones({
        longitud: nuevaPassword.length >= 8,
        numero: /\d/.test(nuevaPassword),
        letra: /[a-zA-Z]/.test(nuevaPassword),
        especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(nuevaPassword),
      });
    } else {
      setValidaciones({
        longitud: false,
        numero: false,
        letra: false,
        especial: false,
      });
    }
  }, [nuevaPassword]);

  const resetearFormulario = () => {
    setEstadoActual('solicitar');
    setNombreUsuario('');
    setMotivoSeleccionado(undefined);
    setCodigo('');
    setNuevaPassword('');
    setConfirmarPassword('');
    setError('');
    setLoading(false);
  };

  const handleSolicitarRecuperacion = async () => {
    if (!nombreUsuario.trim()) {
      setError('Por favor ingrese su nombre de usuario');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Enviar motivo si fue seleccionado
      const motivoTexto = motivoSeleccionado 
        ? motivos.find(m => m.idMotivo === motivoSeleccionado)?.descripcion 
        : undefined;
      
      await solicitarRecuperacion(
        nombreUsuario.trim(), 
        motivoSeleccionado,
        motivoTexto
      );
      setEstadoActual('esperando');
    } catch (err: any) {
      console.error('Error al solicitar recuperación:', err);
      setError(
        err.response?.data?.error ||
          'Error al procesar la solicitud. Verifique su nombre de usuario.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVolverASolicitar = () => {
    // No resetear nombreUsuario, solo limpiar código y contraseñas
    setEstadoActual('solicitar');
    setMotivoSeleccionado(undefined);
    setCodigo('');
    setNuevaPassword('');
    setConfirmarPassword('');
    setError('');
    setLoading(false);
  };

  const handlePasarARestablecer = async () => {
    // Validar nombre de usuario
    if (!nombreUsuario.trim()) {
      setError('Error: nombre de usuario no especificado');
      setEstadoActual('solicitar');
      return;
    }

    // Validar código
    if (!codigo.trim() || codigo.length !== 4) {
      setError('Por favor ingrese el código de 4 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Verificando código antes de continuar...', {
        nombreUsuario,
        codigo: codigo.substring(0, 2) + '**'
      });

      // Verificar el código con el backend
      await verificarCodigoRecuperacion(nombreUsuario.trim(), codigo.trim());

      console.log('✅ Código verificado - permitiendo continuar');
      setEstadoActual('restablecer');
    } catch (err: any) {
      console.error('Error al verificar código:', err);
      const mensajeError = err.response?.data?.error || 'Error al verificar el código';
      const codigoError = err.response?.data?.codigo;

      // Determinar el tipo de error
      if (codigoError === 'CODIGO_BLOQUEADO') {
        setError('❌ ' + mensajeError);
      } else if (mensajeError.includes('incorrecto') || mensajeError.includes('quedan')) {
        setError('⚠️ ' + mensajeError);
      } else {
        setError(mensajeError);
      }

      // Limpiar el código para que el usuario ingrese uno nuevo
      setCodigo('');
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecerPassword = async () => {
    // Validaciones
    if (!nombreUsuario.trim()) {
      setError('Error: nombre de usuario no especificado');
      setEstadoActual('solicitar');
      return;
    }

    if (!codigo.trim() || codigo.length !== 4) {
      setError('Por favor ingrese el código de 4 dígitos');
      return;
    }

    if (!nuevaPassword) {
      setError('Por favor ingrese una nueva contraseña');
      return;
    }

    // Verificar que cumpla todos los requisitos
    const todosRequisitos = Object.values(validaciones).every((v) => v === true);
    if (!todosRequisitos) {
      setError('La contraseña debe cumplir todos los requisitos');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Intentando restablecer con:', { nombreUsuario, codigo: codigo.substring(0, 2) + '**' });
      await restablecerPassword(nombreUsuario.trim(), codigo.trim(), nuevaPassword);
      setEstadoActual('exito');
    } catch (err: any) {
      console.error('Error al restablecer contraseña:', err);
      const mensajeError =
        err.response?.data?.error || 'Error al restablecer la contraseña';
      
      // Si el código es inválido, volver al estado de esperando
      if (mensajeError.includes('inválido') || mensajeError.includes('expirado') || mensajeError.includes('incorrecto')) {
        setError(mensajeError);
        setEstadoActual('esperando');
        setCodigo('');
      } else {
        setError(mensajeError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarExito = () => {
    resetearFormulario();
    onDidDismiss();
  };

  const renderContenido = () => {
    switch (estadoActual) {
      case 'solicitar':
        return (
          <div className="modal-recuperacion-body">
            <div className="modal-recuperacion-icon">
              <IonIcon icon={lockClosed} />
            </div>
            <h2>¿Olvidaste tu contraseña?</h2>
            <p className="modal-recuperacion-description">
              Ingresa tu nombre de usuario y enviaremos una solicitud al administrador
              para restablecer tu contraseña.
            </p>

            <IonList className="modal-recuperacion-form" style={{ height: 'auto' }}>
              <IonItem>
                <IonLabel position="stacked">Nombre de Usuario</IonLabel>
                <IonInput
                  value={nombreUsuario}
                  onIonChange={(e) => setNombreUsuario(e.detail.value || '')}
                  placeholder="Ingrese su nombre de usuario"
                  disabled={loading}
                  clearInput
                />
              </IonItem>

              <IonItem>
                <IonSelect
                  className="always-flip"
                  toggleIcon={caretDownSharp}
                  interface="popover"
                  label="Motivo de recuperación"
                  placeholder="Seleccione un motivo (opcional)"
                  value={motivoSeleccionado}
                  onIonChange={(e) => setMotivoSeleccionado(e.detail.value)}
                  disabled={loading}
                  cancelText="Cancelar"
                >
                  {motivos.map((motivo) => (
                    <IonSelectOption key={motivo.idMotivo} value={motivo.idMotivo}>
                      {motivo.descripcion}  
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonList>

            {error && (
              <div className="modal-recuperacion-error">
                <IonIcon icon={alertCircle} />
                <IonText color="danger">{error}</IonText>
              </div>
            )}

            <div className="modal-recuperacion-actions">
              <IonButton expand="block" onClick={handleSolicitarRecuperacion} disabled={loading}>
                {loading ? <IonSpinner name="crescent" /> : 'Solicitar Recuperación'}
              </IonButton>
              <IonButton 
                expand="block" 
                fill="outline" 
                onClick={() => {
                  if (!nombreUsuario.trim()) {
                    setError('Por favor ingrese su nombre de usuario primero');
                    return;
                  }
                  setError('');
                  setEstadoActual('esperando');
                }} 
                disabled={loading}
              >
                Ya tengo el código
              </IonButton>
              <IonButton expand="block" fill="solid" onClick={onDidDismiss} disabled={loading} color={'danger'}>
                Cancelar
              </IonButton>
            </div>
          </div>
        );

      case 'esperando':
        return (
          <div className="modal-recuperacion-body">
            <div className="modal-recuperacion-icon success">
              <IonIcon icon={timeOutline} />
            </div>
            <h2>Solicitud Enviada</h2>
            <p className="modal-recuperacion-description">
              Tu solicitud ha sido enviada al administrador. Una vez aprobada, recibirás un
              código de 4 dígitos para restablecer tu contraseña.
            </p>

            <IonCard className="modal-recuperacion-info-card">
              <IonCardContent>
                <div className="modal-recuperacion-info-card-item">
                  <IonIcon icon={keyOutline} />
                  <div>
                    <strong>Código de 4 dígitos</strong>
                    <p>El administrador te proporcionará este código cuando apruebe tu solicitud.</p>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>

            <IonList className="modal-recuperacion-form">
              <IonItem>
                <IonLabel position="stacked">Ingrese el código recibido</IonLabel>
                <IonInput
                  value={codigo}
                  onIonChange={(e) => {
                    const valor = e.detail.value || '';
                    // Solo permitir dígitos y máximo 4
                    if (/^\d{0,4}$/.test(valor)) {
                      setCodigo(valor);
                      setError('');
                    }
                  }}
                  placeholder="0000"
                  maxlength={4}
                  inputmode="numeric"
                  disabled={loading}
                />
                <IonNote slot="helper">Solo dígitos (0-9)</IonNote>
              </IonItem>
            </IonList>

            {error && (
              <div className="modal-recuperacion-error">
                <IonIcon icon={alertCircle} />
                <IonText color="danger">{error}</IonText>
              </div>
            )}

            <div className="modal-recuperacion-actions">
              <IonButton
                expand="block"
                onClick={handlePasarARestablecer}
                disabled={codigo.length !== 4 || loading}
              >
                Continuar
              </IonButton>
              <IonButton expand="block" fill="outline" onClick={handleVolverASolicitar} disabled={loading}>
                Solicitar Nuevo Código
              </IonButton>
              <IonButton expand="block" fill="solid" onClick={onDidDismiss} disabled={loading} color={'danger'}>
                Cancelar
              </IonButton>
            </div>
          </div>
        );

      case 'restablecer':
        return (
          <div className="modal-recuperacion-body">
            <div className="modal-recuperacion-icon">
              <IonIcon icon={shieldCheckmarkOutline} />
            </div>
            <h2>Restablecer Contraseña</h2>
            <p className="modal-recuperacion-description">
              Ingresa tu nueva contraseña. Debe cumplir con los requisitos de seguridad.
            </p>

            <IonList className="modal-recuperacion-form">
              <IonItem>
                <IonLabel position="stacked">Nueva Contraseña</IonLabel>
                <IonInput
                  type="password"
                  value={nuevaPassword}
                  onIonChange={(e) => setNuevaPassword(e.detail.value || '')}
                  placeholder="Ingrese contraseña"
                  disabled={loading}
                  clearInput
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Confirmar Contraseña</IonLabel>
                <IonInput
                  type="password"
                  value={confirmarPassword}
                  onIonChange={(e) => setConfirmarPassword(e.detail.value || '')}
                  placeholder="Confirme contraseña"
                  disabled={loading}
                  clearInput
                />
              </IonItem>
            </IonList>

            {/* Indicadores de validación */}
            <div className="modal-recuperacion-validaciones">
              <h4>Requisitos de la contraseña:</h4>
              <div className={`modal-recuperacion-validacion-item ${validaciones.longitud ? 'modal-recuperacion-valido' : ''}`}>
                <IonIcon icon={validaciones.longitud ? checkmarkCircle : alertCircle} />
                <span>Mínimo 8 caracteres</span>
              </div>
              <div className={`modal-recuperacion-validacion-item ${validaciones.numero ? 'modal-recuperacion-valido' : ''}`}>
                <IonIcon icon={validaciones.numero ? checkmarkCircle : alertCircle} />
                <span>Al menos un número</span>
              </div>
              <div className={`modal-recuperacion-validacion-item ${validaciones.letra ? 'modal-recuperacion-valido' : ''}`}>
                <IonIcon icon={validaciones.letra ? checkmarkCircle : alertCircle} />
                <span>Al menos una letra</span>
              </div>
              <div className={`modal-recuperacion-validacion-item ${validaciones.especial ? 'modal-recuperacion-valido' : ''}`}>
                <IonIcon icon={validaciones.especial ? checkmarkCircle : alertCircle} />
                <span>Al menos un carácter especial (!@#$%...)</span>
              </div>
            </div>

            {error && (
              <div className="modal-recuperacion-error">
                <IonIcon icon={alertCircle} />
                <IonText color="danger">{error}</IonText>
              </div>
            )}

            <div className="modal-recuperacion-actions">
              <IonButton expand="block" onClick={handleRestablecerPassword} disabled={loading}>
                {loading ? <IonSpinner name="crescent" /> : 'Cambiar Contraseña'}
              </IonButton>
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => {
                  setEstadoActual('esperando');
                  setNuevaPassword('');
                  setConfirmarPassword('');
                  setError('');
                }}
                disabled={loading}
              >
                Volver
              </IonButton>
            </div>
          </div>
        );

      case 'exito':
        return (
          <div className="modal-recuperacion-body">
            <div className="modal-recuperacion-icon success">
              <IonIcon icon={checkmarkCircle} />
            </div>
            <h2>¡Contraseña Actualizada!</h2>
            <p className="modal-recuperacion-description">
              Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con
              tu nueva contraseña.
            </p>

            <div className="modal-recuperacion-actions">
              <IonButton expand="block" onClick={handleCerrarExito}>
                Aceptar
              </IonButton>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss} className="modal-recuperacion-password">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Recuperar Contraseña</IonTitle>
        </IonToolbar>
        {loading && <IonProgressBar type="indeterminate" />}
      </IonHeader>

      <IonContent className="modal-recuperacion-content">{renderContenido()}</IonContent>
    </IonModal>
  );
};

export default ModalRecuperacionPassword;
