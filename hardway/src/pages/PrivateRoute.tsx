import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ component: Component, ...rest }: any) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default PrivateRoute;
