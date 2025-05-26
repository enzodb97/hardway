import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import Menu from "./components/Menu";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ClientesProvider } from "./context/ClientesContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Clientes from "./pages/Clientes/Clientes";
import AltaCliente from "./pages/AltaCliente/AltaCliente";
import RoleRoute from "./components/RoleRoute";
import Usuarios from "./pages/Usuarios/Usuarios";
import Pedidos from "./pages/Pedidos/Pedidos";
import AltaPedido from "./pages/Pedidos/AltaPedido";

import "@ionic/react/css/core.css";
import "./theme/variables.css";

setupIonicReact();

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <IonReactRouter>
      {isAuthenticated ? (
        <IonSplitPane contentId="main" when="md">
          <Menu />
          <IonRouterOutlet id="main">
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <RoleRoute
              exact
              path="/clientes"
              component={Clientes}
              requiredRoles={["admin", "vendedor"]}
            />
            <RoleRoute
              exact
              path="/alta-cliente/:id?"
              component={AltaCliente}
              requiredRoles={["admin", "vendedor"]}
            />
            <RoleRoute
              exact
              path="/usuarios"
              component={Usuarios}
              requiredRoles={["admin"]}
            />
            <RoleRoute
              exact
              path="/pedidos"
              component={Pedidos}
              requiredRoles={["admin", "vendedor"]}
            />
            <RoleRoute
              exact
              path="/alta-pedido"
              component={AltaPedido}
              requiredRoles={["admin", "vendedor"]}
            />
            <Route exact path="/">
              <Redirect to="/dashboard" />
            </Route>
          </IonRouterOutlet>
        </IonSplitPane>
      ) : (
        <IonRouterOutlet>
          <Route exact path="/login" component={Login} />
          <Redirect to="/login" />
        </IonRouterOutlet>
      )}
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
