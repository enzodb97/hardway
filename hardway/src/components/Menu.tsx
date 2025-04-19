import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import { archiveOutline,bookmarkOutline, heartOutline,  mailOutline,  paperPlaneOutline,  trashOutline,  warningOutline, warningSharp, home, bookmark, cart, people, person } from 'ionicons/icons';
import './Menu.css';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Inicio',
    url: '/folder/Inicio',
    iosIcon: mailOutline,
    mdIcon: home
  },
  {
    title: 'Reportes',
    url: '/folder/Reportes',
    iosIcon: paperPlaneOutline,
    mdIcon: bookmark
  },
  {
    title: 'Pedidos',
    url: '/folder/Pedidos',
    iosIcon: heartOutline,
    mdIcon: cart
  },
  {
    title: 'Clientes',
    url: '/folder/Customer',
    iosIcon: archiveOutline,
    mdIcon: people
  },
  {
    title: 'Usuarios',
    url: '/folder/Usuarios',
    iosIcon: trashOutline,
    mdIcon: person
  },
  {
    title: 'Cerrar sesión',
    url: '/folder/Spam',
    iosIcon: warningOutline,
    mdIcon: warningSharp
  }
];

const labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

const Menu: React.FC = () => {
  const location = useLocation();

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Admin Mayorista</IonListHeader>
          <IonNote></IonNote>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        <IonList id="labels-list">
          <IonListHeader>Labels</IonListHeader>
          {labels.map((label, index) => (
            <IonItem lines="none" key={index}>
              <IonIcon aria-hidden="true" slot="start" icon={bookmarkOutline} />
              <IonLabel>{label}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
