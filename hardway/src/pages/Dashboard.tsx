import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonAlert,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const history = useHistory();
  const { logout, username } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (username) {
      setShowWelcome(true);
    }
  }, [username]);

  const handleLogout = () => {
    logout();
    history.replace("/login");
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
        <IonAlert
          isOpen={showWelcome}
          onDidDismiss={() => setShowWelcome(false)}
          header="¡Bienvenido!"
          message={`Bienvenido ${username || ""} al Sistema Pegasus`}
          buttons={["Aceptar"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
