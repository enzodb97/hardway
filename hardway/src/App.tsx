import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import Menu from "./components/Menu";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ClientesProvider } from "./context/ClientesContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Clientes from "./pages/Clientes/Clientes";
import AltaCliente from "./pages/AltaCliente/AltaCliente";

import "@ionic/react/css/core.css";
import "./theme/variables.css";

setupIonicReact();

const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  return (
    <IonReactRouter>
      <IonSplitPane contentId="main" when={isAuthenticated}>
        {isAuthenticated && <Menu />}
        <IonRouterOutlet id="main">
          <Route exact path="/login" component={Login} />
          <PrivateRoute exact path="/dashboard" component={Dashboard} />
          <PrivateRoute exact path="/Clientes" component={Clientes} />
          <PrivateRoute exact path="/alta-cliente" component={AltaCliente} />
          <Route exact path="/">
            {isAuthenticated ? (
              <Redirect to="/dashboard" />
            ) : (
              <Redirect to="/login" />
            )}
          </Route>
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <ClientesProvider>
          <AppRouter />
        </ClientesProvider>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
