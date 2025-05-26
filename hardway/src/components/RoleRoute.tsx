import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
          <div style={{ padding: 40, textAlign: "center", color: "red" }}>
            <h2>No tienes acceso a esta sección</h2>
          </div>
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default RoleRoute;
