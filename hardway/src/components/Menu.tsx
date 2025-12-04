import {
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
} from "@ionic/react";
import { useLocation, useHistory } from "react-router-dom";
import {
  homeOutline,
  bookmarkOutline,
  peopleOutline,
  personOutline,
  logOutOutline,
  shirtOutline,
  archiveOutline,
  bagHandleOutline,
  cubeOutline,
  carOutline,
} from "ionicons/icons";
import "./Menu.css";
import persona from "../assets/images/people.png";
import { useAuth } from "../context/AuthContext";
import { h } from "ionicons/dist/types/stencil-public-runtime";

interface AppPage {
  url: string;
  icon: string;
  title: string;
}

const Menu: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { logout, username, roles, hasAnyRole } = useAuth(); // ✅ Usar roles y hasAnyRole

  // ✅ Construir menú dinámico según roles
  const appPages: AppPage[] = [];
  
  // Dashboard - visible para todos
  appPages.push({ title: "Inicio", url: "/dashboard", icon: homeOutline });
  
  // Reportes - solo Administrador y Gerente
  if (hasAnyRole(["Administrador", "Gerente"])) {
    appPages.push({ title: "Reportes", url: "/Reportes", icon: bookmarkOutline });
  }
  
  // Pedidos - Administrador y Vendedor
  if (hasAnyRole(["Administrador", "Vendedor"])) {
    appPages.push({ title: "Pedidos", url: "/pedidos", icon: bagHandleOutline });
  }
  
  // Clientes - Administrador y Vendedor
  if (hasAnyRole(["Administrador", "Vendedor"])) {
    appPages.push({ title: "Clientes", url: "/Clientes", icon: peopleOutline });
  }
  
  // Usuarios - solo Administrador
  if (hasAnyRole(["Administrador"])) {
    appPages.push({ title: "Usuarios", url: "/usuarios", icon: personOutline });
  }
  
  // Indumentaria - Administrador y Encargado de Stock
  if (hasAnyRole(["Administrador", "Encargado de Stock"])) {
    appPages.push({ title: "Indumentaria", url: "/indumentaria", icon: shirtOutline });
  }
  
  // Picking - Administrador, Picker, Encargado de Picking
  if (hasAnyRole(["Administrador", "Picker", "Encargado de Picking"])) {
    appPages.push({ title: "Picking", url: "/picking", icon: cubeOutline });
  }
  
  // Despachos - Administrador, Picker, Envios
  if (hasAnyRole(["Administrador", "Picker", "Envios"])) {
    appPages.push({ title: "Despachos", url: "/envios", icon: carOutline });
  }

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  return (
    <IonMenu contentId="main" type="overlay" className="custom-menu">
      <IonContent className="menu-content">
        <div className="menu-container">
          <IonList className="menu-list">
            <div className="menu-header">
              <IonImg className="menu-logo" src={persona} />
              <h2 className="menu-user">{username || "Usuario"}</h2>
            </div>

            {appPages.map((appPage, index) => (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={`menu-item ${
                    location.pathname === appPage.url ? "selected" : ""
                  }`}
                  routerLink={appPage.url}
                  routerDirection="none"
                  lines="none"
                  detail={false}
                >
                  <IonIcon
                    slot="start"
                    icon={appPage.icon}
                    className="menu-icon"
                  />
                  <IonLabel className="menu-label">{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            ))}

            {/* Sección de Cerrar Sesión */}
            <div className="logout-section">
              <IonMenuToggle autoHide={false}>
                <IonItem
                  button
                  lines="none"
                  className="logout-item"
                  onClick={handleLogout}
                >
                  <IonIcon
                    slot="start"
                    icon={logOutOutline}
                    className="logout-icon"
                  />
                  <IonLabel className="logout-label">Cerrar Sesión</IonLabel>
                </IonItem>
              </IonMenuToggle>
            </div>
          </IonList>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
