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
  logoUsd,
  peopleOutline,
  logOutOutline,
  shirtOutline,
} from "ionicons/icons";
import "./Menu.css";
import persona from "../assets/images/people.png";
import { useAuth } from "../context/AuthContext";

interface AppPage {
  url: string;
  icon: string;
  title: string;
}

const appPages: AppPage[] = [
  { title: "Inicio", url: "/folder/Inicio", icon: homeOutline },
  { title: "Reportes", url: "/folder/Reportes", icon: bookmarkOutline },
  { title: "Pedidos", url: "/pedidos", icon: logoUsd },
  { title: "Clientes", url: "/Clientes", icon: peopleOutline },
  { title: "Usuarios", url: "/usuarios", icon: peopleOutline },
  { title: "Indumentaria", url: "/indumentaria", icon: shirtOutline },
];

const Menu: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { logout, username } = useAuth(); // Obtenemos la función de logout y el nombre de usuario del contexto

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
