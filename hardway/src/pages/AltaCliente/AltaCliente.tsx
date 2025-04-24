import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonLabel,
  IonItem,
  IonMenuButton,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useClientes } from "../../context/ClientesContext";
import "./AltaCliente.css";
import { useState } from "react";

const AltaCliente: React.FC = () => {
  const { agregarCliente } = useClientes();
  const history = useHistory();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    celular: "",
    numeroCliente: "",
    localidad: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    agregarCliente(formData);
    history.push("/Clientes");
  };

  return (
    <IonPage className="alta-cliente-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Nuevo Cliente</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="alta-cliente-content">
        <form onSubmit={handleSubmit} className="alta-cliente-form">
          <IonItem>
            <IonLabel position="floating">Nombre completo</IonLabel>
            <IonInput
              required
              value={formData.nombre}
              onIonChange={(e) =>
                setFormData({ ...formData, nombre: e.detail.value! })
              }
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              type="email"
              required
              value={formData.email}
              onIonChange={(e) =>
                setFormData({ ...formData, email: e.detail.value! })
              }
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Celular</IonLabel>
            <IonInput
              type="tel"
              required
              value={formData.celular}
              onIonChange={(e) =>
                setFormData({ ...formData, celular: e.detail.value! })
              }
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">N° Cliente</IonLabel>
            <IonInput
              type="number"
              required
              value={formData.numeroCliente}
              onIonChange={(e) =>
                setFormData({ ...formData, numeroCliente: e.detail.value! })
              }
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Localidad</IonLabel>
            <IonInput
              required
              value={formData.localidad}
              onIonChange={(e) =>
                setFormData({ ...formData, localidad: e.detail.value! })
              }
            />
          </IonItem>

          <IonButton expand="block" type="submit" className="guardar-btn">
            Guardar
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default AltaCliente;
