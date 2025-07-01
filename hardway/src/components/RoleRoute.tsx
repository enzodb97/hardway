import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  IonCard, 
  IonCardContent, 
  IonIcon, 
  IonText 
} from "@ionic/react";
import { lockClosed, warning } from "ionicons/icons";
import "./RoleRoute.css";

interface RoleRouteProps {
  component: React.ComponentType<any>;
  requiredRoles: string[];
  [key: string]: any;
}

const RoleRoute: React.FC<RoleRouteProps> = ({
  component: Component,
  requiredRoles,
  ...rest
}) => {
  const { isAuthenticated, rol } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated && rol && requiredRoles.includes(rol) ? (
          <Component {...props} />
        ) : isAuthenticated ? (
          <div className="access-denied-container">
            <IonCard className="access-denied-card">
              <IonCardContent>
                <div className="access-denied-icon-container">
                  <IonIcon 
                    icon={lockClosed} 
                    className="access-denied-lock-icon"
                  />
                </div>
                <IonText>
                  <h2 className="access-denied-title">
                    Acceso Restringido
                  </h2>
                </IonText>
                <IonText>
                  <p className="access-denied-message">
                    <IonIcon 
                      icon={warning} 
                      className="access-denied-warning-icon"
                    />
                    No tienes los permisos necesarios para acceder a esta sección.
                    <br />
                    Contacta a tu administrador si necesitas acceso.
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </div>
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default RoleRoute;
