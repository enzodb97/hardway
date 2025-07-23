import React from "react";
import {
  IonPage,
  IonCard,
  IonCardContent,
  IonIcon,
  IonText,
} from "@ionic/react";
import { warning } from "ionicons/icons";

interface AccesoRestringidoProps {
  rol?: string;
  requiredRoles?: string[];
}

const AccesoRestringido: React.FC<AccesoRestringidoProps> = ({
  rol,
  requiredRoles,
}) => (
  <IonPage>
    <div className="access-denied-container">
      <IonCard className="access-denied-card">
        <IonCardContent>
          <div className="access-denied-icon-container">
            <IonIcon icon={warning} className="access-denied-lock-icon" />
          </div>
          <IonText color="danger">
            <h2>Acceso Restringido</h2>
            <p className="access-denied-message">
              <IonIcon icon={warning} className="access-denied-warning-icon" />
              No tienes los permisos necesarios para acceder a esta sección.
              <br />
              Tu rol: {rol || "No definido"}
              <br />
              Roles requeridos:{" "}
              {requiredRoles && requiredRoles.length > 0
                ? requiredRoles.join(", ")
                : "No definidos"}
              <br />
              Contacta a tu administrador si necesitas acceso.
            </p>
          </IonText>
        </IonCardContent>
      </IonCard>
    </div>
  </IonPage>
);

export default AccesoRestringido;
