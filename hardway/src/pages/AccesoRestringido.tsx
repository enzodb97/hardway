import React from "react";
import {
  IonPage,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonContent,
} from "@ionic/react";
import { lockClosedOutline, shieldCheckmarkOutline, arrowBack } from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import "./AccesoRestringido.css";

interface AccesoRestringidoProps {
  rol?: string;
  requiredRoles?: string[];
}

const AccesoRestringido: React.FC<AccesoRestringidoProps> = ({
  rol,
  requiredRoles,
}) => {
  const history = useHistory();
  const location = useLocation();
  
  // Obtener roles del state si están disponibles
  const state = location.state as { roles?: string[]; requiredRoles?: string[] } | undefined;
  const userRoles = state?.roles || (rol ? [rol] : []);
  const rolesRequeridos = state?.requiredRoles || requiredRoles || [];

  return (
    <IonPage>
      <IonContent className="access-denied-content">
        <div className="access-denied-container">
          <IonCard className="access-denied-card">
            <IonCardContent className="access-denied-card-content">
              {/* Icono principal */}
              <div className="access-denied-icon-wrapper">
                <div className="access-denied-icon-circle">
                  <IonIcon icon={lockClosedOutline} className="access-denied-main-icon" />
                </div>
              </div>

              {/* Título */}
              <h1 className="access-denied-title">Acceso Restringido</h1>
              
              {/* Mensaje principal */}
              <p className="access-denied-description">
                No tienes los permisos necesarios para acceder a esta sección.
              </p>

              {/* Información de roles */}
              <div className="access-denied-roles-info">
                <div className="access-denied-role-section">
                  <div className="access-denied-role-header">
                    <IonIcon icon={shieldCheckmarkOutline} className="access-denied-role-icon" />
                    <span className="access-denied-role-label">Tus roles:</span>
                  </div>
                  <div className="access-denied-role-badges">
                    {userRoles.length > 0 ? (
                      userRoles.map((r, index) => (
                        <span key={index} className="access-denied-badge badge-user">
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className="access-denied-badge badge-undefined">No definido</span>
                    )}
                  </div>
                </div>

                <div className="access-denied-divider"></div>

                <div className="access-denied-role-section">
                  <div className="access-denied-role-header">
                    <IonIcon icon={lockClosedOutline} className="access-denied-role-icon required" />
                    <span className="access-denied-role-label">Roles requeridos:</span>
                  </div>
                  <div className="access-denied-role-badges">
                    {rolesRequeridos.length > 0 ? (
                      rolesRequeridos.map((r, index) => (
                        <span key={index} className="access-denied-badge badge-required">
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className="access-denied-badge badge-undefined">No definidos</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mensaje de ayuda */}
              <div className="access-denied-help">
                <p className="access-denied-help-text">
                  Si crees que deberías tener acceso a esta sección, contacta a tu administrador del sistema.
                </p>
              </div>

              {/* Botón de regreso */}
              <IonButton
                expand="block"
                onClick={() => history.push("/dashboard")}
                className="access-denied-button"
              >
                <IonIcon slot="start" icon={arrowBack} />
                Volver al Inicio
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AccesoRestringido;
