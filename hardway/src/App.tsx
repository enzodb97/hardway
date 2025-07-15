import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact,
  IonAlert,
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
import DetallePedido from "./pages/Pedidos/DetallePedido";
import Indumentaria from "./pages/Indumentaria/Indumentaria";
import AltaIndumentaria from "./pages/Indumentaria/AltaIndumentaria";
import Reportes from "./pages/Reportes/Reportes";
import ClientesMasPedidos from "./pages/Reportes/ClientesMasPedidos";
import AnalisisCancelaciones from "./pages/Reportes/AnalisisCancelaciones";
import StockActual from "./pages/Reportes/StockActual";
import ProductosMasPedidos from "./pages/Reportes/ProductosMasPedidos";
import Picking from "./pages/Picking/Picking";
import Envios from "./pages/Envios/Envios";
import DebugAuth from "./pages/DebugAuth";
import UsuariosSimple from "./pages/UsuariosSimple";
import "@ionic/react/css/core.css";
import "./theme/variables.css";

setupIonicReact();

const AppRouter = () => {
  const { isAuthenticated, showWelcome, setShowWelcome, username } = useAuth();

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
              requiredRoles={["Administrador", "Vendedor"]}
            />
            <RoleRoute
              exact
              path="/alta-cliente/:id?"
              component={AltaCliente}
              requiredRoles={["Administrador", "Vendedor"]}
            />
            <RoleRoute
              exact
              path="/usuarios"
              component={Usuarios}
              requiredRoles={["Administrador"]}
            />
            <RoleRoute
              exact
              path="/pedidos"
              component={Pedidos}
              requiredRoles={["Administrador", "Vendedor"]}
            />
            <RoleRoute
              exact
              path="/alta-pedido"
              component={AltaPedido}
              requiredRoles={["Administrador", "Vendedor"]}
            />
            <RoleRoute
              exact
              path="/alta-pedido/:id"
              component={AltaPedido}
              requiredRoles={["Administrador", "Vendedor"]}
            />
            <RoleRoute
              exact
              path="/indumentaria"
              component={Indumentaria}
              requiredRoles={["Administrador"]}
            />
            <RoleRoute
              exact
              path="/alta-indumentaria"
              component={AltaIndumentaria}
              requiredRoles={["Administrador"]}
            />
            <RoleRoute
              exact
              path="/alta-indumentaria/:id"
              component={AltaIndumentaria}
              requiredRoles={["Administrador"]}
            />
            <RoleRoute
              exact
              path="/picking"
              component={Picking}
              requiredRoles={["Picker", "Administrador"]}
            />
            <RoleRoute
              exact
              path="/envios"
              component={Envios}
              requiredRoles={[
                "Encargado de Logística",
                "Administrador",
                "Envios",
              ]}
            />
            <Route exact path="/detalle-pedido/:id">
              <DetallePedido />
            </Route>
            <Route exact path="/debug-auth">
              <DebugAuth />
            </Route>
            <Route exact path="/">
              <Redirect to="/dashboard" />
            </Route>
            <RoleRoute
              path="/reportes"
              component={Reportes}
              requiredRoles={["Administrador"]}
              exact
            />
            <Route
              path="/reportes/clientes-mas-pedidos"
              component={ClientesMasPedidos}
              exact
            />
            <Route
              path="/reportes/stock-actual"
              component={StockActual}
              exact
            />
            <Route
              path="/reportes/productos-mas-pedidos"
              component={ProductosMasPedidos}
              exact
            />
            <Route
              path="/reportes/analisis-cancelaciones"
              component={AnalisisCancelaciones}
              exact
            />
            <Route exact path="/debug-auth" component={DebugAuth} />
          </IonRouterOutlet>
        </IonSplitPane>
      ) : (
        <IonRouterOutlet>
          <Route exact path="/login" component={Login} />
          <Redirect to="/login" />
        </IonRouterOutlet>
      )}
      <IonAlert
        isOpen={showWelcome}
        onDidDismiss={() => setShowWelcome(false)}
        header="¡Bienvenido!"
        message={`Bienvenido ${username || ""} al Sistema Pegasus`}
        buttons={["Aceptar"]}
      />
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
