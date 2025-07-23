import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IonCard, IonCardContent, IonIcon, IonText } from "@ionic/react";
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
      render={(props) => {
        if (isAuthenticated && rol && requiredRoles.includes(rol)) {
          return <Component {...props} />;
        } else if (isAuthenticated) {
          return (
            <Redirect
              to={{
                pathname: "/acceso-restringido",
                state: { rol, requiredRoles },
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
