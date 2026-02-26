import React from "react";
import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact,
  IonAlert,
  IonLoading,
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
import Chatbot from "./pages/Chatbot";
import Reportes from "./pages/Reportes/Reportes";
import ClientesMasPedidos from "./pages/Reportes/ClientesMasPedidos";
import AnalisisCancelaciones from "./pages/Reportes/AnalisisCancelaciones";
import StockActual from "./pages/Reportes/StockActual";
import ProductosMasPedidos from "./pages/Reportes/ProductosMasPedidos";
import TendenciasEmpresaEnvios from "./pages/Reportes/TendenciasEmpresaEnvios";
import Picking from "./pages/Picking/Picking";
import Envios from "./pages/Envios/Envios";
import DebugAuth from "./pages/DebugAuth";
import AccesoRestringido from "./pages/AccesoRestringido";
import NotFound from "./pages/NotFound";
import NotFound from "./pages/NotFound";
import "@ionic/react/css/core.css";
import "./theme/variables.css";

setupIonicReact();

const AppRouter = () => {
  const { isAuthenticated, showWelcome, setShowWelcome, username, loading } = useAuth();
  const [forceRender, setForceRender] = React.useState(false);

  console.log("🎯 AppRouter render:", { loading, isAuthenticated, username });

  // Observar cambios de loading
  React.useEffect(() => {
    console.log("👀 OBSERVADOR: loading cambió a:", loading);
  }, [loading]);

  // 🛡️ FAILSAFE SECUNDARIO: Si loading se queda en true por más de 3 segundos, forzar renderizado
  React.useEffect(() => {
    console.log(`⚙️ useEffect loading cambió a: ${loading}`);
    if (loading) {
      console.log("⏳ Loading iniciado, iniciando FAILSAFE secundario...");
      const secondaryFailsafe = setTimeout(() => {
        console.error("🚨 FAILSAFE SECUNDARIO ACTIVADO: Loading bloqueado por más de 3 segundos, forzando renderizado");
        setForceRender(true);
      }, 3000);
      
      return () => clearTimeout(secondaryFailsafe);
    } else {
      console.log("✅ Loading terminado, desmontando IonLoading...");
      // Forzar cierre de cualquier IonLoading que pueda estar abierto
      const loadingElement = document.querySelector('ion-loading');
      if (loadingElement) {
        console.log("🧹 Limpiando IonLoading manualmente del DOM");
        loadingElement.dismiss().catch(() => {
          console.warn("⚠️ No se pudo cerrar IonLoading con dismiss, removiendo del DOM");
          loadingElement.remove();
        });
      }
      setForceRender(false);
    }
  }, [loading]);

  return (
    <>
      {console.log(`🔍 Renderizando AppRouter - loading: ${loading}, forceRender: ${forceRender}, shouldShowLoading: ${loading}, shouldRenderApp: ${!loading || forceRender}`)}
      
      {/* Loading overlay - solo renderizar cuando loading=true para asegurar desmontaje */}
      {loading && (
        <>
          {console.log("🔄 Montando IonLoading...")}
          <IonLoading 
            key="auth-loading"
            isOpen={true} 
            message="Cargando..."
            duration={2000}
            onDidDismiss={() => {
              console.log("🔓 IonLoading onDidDismiss ejecutado");
            }}
            onWillDismiss={() => {
              console.log("🔓 IonLoading onWillDismiss ejecutado");
            }}
          />
        </>
      )}
      
      {/* Renderizar app solo cuando loading es false O cuando el failsafe secundario se activa */}
      {(!loading || forceRender) && (
        <>
          {console.log("✅ Loading finalizado, renderizando aplicación")}
    <IonReactRouter>
      {/* Public chatbot route available without authentication */}
      <Route exact path="/chatbot" component={Chatbot} />
      <Route exact path="/invitado" render={() => <Redirect to="/chatbot" />} />
      {isAuthenticated ? (
        <ClientesProvider>
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
              requiredRoles={["Administrador", "Vendedor", "Encargado de Pedidos"]}
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
              requiredRoles={["Administrador", "Encargado de Pedidos"]}
            />
            <RoleRoute
              exact
              path="/alta-pedido"
              component={AltaPedido}
              requiredRoles={["Administrador", "Encargado de Pedidos"]}
            />
            <RoleRoute
              exact
              path="/alta-pedido/:id"
              component={AltaPedido}
              requiredRoles={["Administrador", "Encargado de Pedidos"]}
            />
            <RoleRoute
              exact
              path="/indumentaria"
              component={Indumentaria}
              requiredRoles={["Administrador", "Encargado de Stock"]}
            />
            <RoleRoute
              exact
              path="/alta-indumentaria"
              component={AltaIndumentaria}
              requiredRoles={["Administrador", "Encargado de Stock"]}
            />
            <RoleRoute
              exact
              path="/alta-indumentaria/:id"
              component={AltaIndumentaria}
              requiredRoles={["Administrador", "Encargado de Stock"]}
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
              requiredRoles={["Administrador", "Envios", "Picker"]}
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
              requiredRoles={["Administrador", "Gerente General"]}
              exact
            />
            <RoleRoute
              path="/reportes/clientes-mas-pedidos"
              component={ClientesMasPedidos}
              requiredRoles={["Administrador", "Gerente General"]}
              exact
            />
            <RoleRoute
              path="/reportes/stock-actual"
              component={StockActual}
              requiredRoles={["Administrador", "Gerente General", "Picker"]}
              exact
            />
            <RoleRoute
              path="/reportes/productos-mas-pedidos"
              component={ProductosMasPedidos}
              requiredRoles={["Administrador", "Gerente General"]}
              exact
            />
            <RoleRoute
              path="/reportes/analisis-cancelaciones"
              component={AnalisisCancelaciones}
              requiredRoles={["Administrador", "Gerente General"]}
              exact
            />
            <RoleRoute
              path="/reportes/tendencias-empresas-envio"
              component={TendenciasEmpresaEnvios}
              requiredRoles={["Administrador", "Gerente General"]}
              exact
            />
            <Route exact path="/debug-auth" component={DebugAuth} />
            <Route
              exact
              path="/acceso-restringido"
              render={(props) => {
                const { location } = props;
                const { rol, requiredRoles } =
                  (location.state as {
                    rol?: string;
                    requiredRoles?: string[];
                  }) || {};
                return (
                  <AccesoRestringido rol={rol} requiredRoles={requiredRoles} />
                );
              }}
            />
            {/* Ruta catch-all para 404 - debe estar al final */}
            <Route component={NotFound} />
            {/* Ruta catch-all para 404 - debe estar al final */}
            <Route component={NotFound} />
          </IonRouterOutlet>
        </IonSplitPane>
        </ClientesProvider>
      ) : (
        <IonRouterOutlet>
          <Route exact path="/login" component={Login} />
          {/* Public chatbot routes available without authentication */}
          <Route exact path="/chatbot" component={Chatbot} />
          <Route exact path="/invitado" render={() => <Redirect to="/chatbot" />} />
          {/* Ruta catch-all para usuarios no autenticados */}
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
        </>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </IonApp>
  );
};

export default App;
