import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const history = useHistory();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Asegurar que NO hay llamadas API aquí
    logout(); // Esta función solo debe limpiar el estado local
    history.replace("/login.tsx");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonButton expand="block" onClick={handleLogout} className="logout-btn">
          Cerrar Sesión
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
