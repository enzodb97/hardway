import { IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonMenuButton, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';

import { useParams } from 'react-router';
import { pencilOutline, trashOutline } from 'ionicons/icons';


type Cliente = {
  nombre: string;
  email: string;
  celular: string;
  numeroCliente: string;
  localidad: string;
};
const clientes: Cliente[] = [
  {
    nombre: 'Enzo Bertolusso',
    email: 'enzober@gmail.com',
    celular: '123456789',
    numeroCliente: '123',
    localidad: 'Rosario, Santa Fe',
  },
  {
    nombre: 'Andres Moyano',
    email: 'andresmo@gmmail.com',
    celular: '123456789',
    numeroCliente: '321',
    localidad: 'Posadas, Misiones',
  },
  {
    nombre: 'Luciano Marelli',
    email: 'lumar@gmmail.com',
    celular: '123456789',
    numeroCliente: '456',
    localidad: 'Santo Tome, Corrientes',
  },
];



  const CustomerList: React.FC = () => {
    const { name } = useParams<{ name: string }>();
  
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>{name}</IonTitle>
          </IonToolbar>
        </IonHeader>
  
        <IonContent fullscreen>
          <IonGrid>
            <IonRow className="ion-align-items-center ion-padding">
              <IonCol size="9">
                <h2><strong>Lista de clientes</strong></h2>
              </IonCol>
              <IonCol size="3" className="ion-text-end">
                <IonButton color="warning">Agregar cliente</IonButton>
              </IonCol>
            </IonRow>
  
            <IonRow className="ion-text-start ion-padding-top">
              <IonCol><strong>Nombre y Apellido</strong></IonCol>
              <IonCol><strong>Email</strong></IonCol>
              <IonCol><strong>Celular</strong></IonCol>
              <IonCol><strong>Número de cliente</strong></IonCol>
              <IonCol><strong>Localidad</strong></IonCol>
              <IonCol></IonCol>
            </IonRow>
  
            {clientes.map((cliente, index) => (
              <IonRow key={index} className="customer-row">
                <IonCol>{cliente.nombre}</IonCol>
                <IonCol>{cliente.email}</IonCol>
                <IonCol>{cliente.celular}</IonCol>
                <IonCol>{cliente.numeroCliente}</IonCol>
                <IonCol>{cliente.localidad}</IonCol>
                <IonCol className="ion-text-end">
                  <IonButton fill="clear" color="warning">
                    <IonIcon icon={pencilOutline} />
                  </IonButton>
                  <IonButton fill="clear" color="warning">
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  };

export default CustomerList;
