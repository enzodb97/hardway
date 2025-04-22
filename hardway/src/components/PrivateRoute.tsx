import { Route, Redirect } from 'react-router-dom';
import { IonLoading } from '@ionic/react';
import { useAuth } from '../context/AuthContext';

const PrivateRoute: React.FC<any> = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <IonLoading isOpen={true} message={"Verificando autenticación..."} />;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  );
};

export default PrivateRoute;