import {
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
} from "@ionic/react";
import { useLocation } from "react-router-dom";
import {
  homeOutline,
  bookmarkOutline,
  logoUsd,
  peopleOutline,
} from "ionicons/icons";
import "./Menu.css";
import persona from "../assets/images/people.png";

interface AppPage {
  url: string;
  icon: string;
  title: string;
}

const appPages: AppPage[] = [
  { title: "Inicio", url: "/folder/Inicio", icon: homeOutline },
  { title: "Reportes", url: "/folder/Reportes", icon: bookmarkOutline },
  { title: "Pedidos", url: "/folder/Pedidos", icon: logoUsd },
  { title: "Clientes", url: "/Clientes", icon: peopleOutline },
  { title: "Usuarios", url: "/folder/Usuarios", icon: peopleOutline },
];

const Menu: React.FC = () => {
  const location = useLocation();

  return (
    <IonMenu contentId="main" type="overlay" className="custom-menu">
      <IonContent className="menu-content">
        <div className="menu-container">
          <IonList className="menu-list">
            <div className="menu-header">
              <IonImg className="menu-logo" src={persona} />
              <h2 className="menu-user">Usuario</h2>
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
          </IonList>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
