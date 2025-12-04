import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IonCard, IonCardContent, IonIcon, IonText, IonLoading } from "@ionic/react";
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
  const { isAuthenticated, roles, hasAnyRole, loading } = useAuth(); // ✅ Usar roles, hasAnyRole y loading

  return (
    <Route
      {...rest}
      render={(props) => {
        // ✅ Mostrar loading mientras se valida
        if (loading) {
          return <IonLoading isOpen={true} message="Verificando permisos..." />;
        }

        // ✅ Verificar si el usuario tiene ALGUNO de los roles requeridos
        if (isAuthenticated && hasAnyRole(requiredRoles)) {
          return <Component {...props} />;
        } else if (isAuthenticated) {
          return (
            <Redirect
              to={{
                pathname: "/acceso-restringido",
                state: { roles, requiredRoles }, // ✅ Pasar roles (array)
              }}
            />
          );
        } else {
          return <Redirect to="/login" />;
        }
      }}
    />
  );
};

export default RoleRoute;
