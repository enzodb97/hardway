import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { homeOutline, arrowBackOutline, alertCircleOutline } from "ionicons/icons";
import "./NotFound.css";

const NotFound: React.FC = () => {
  const history = useHistory();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown para redirección automática
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          history.replace("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [history]);

  const handleGoHome = () => {
    history.replace("/dashboard");
  };

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent className="notfound-content">
        <div className="notfound-container">
          <IonCard className="notfound-card">
            <IonCardContent>
              <div className="notfound-icon-container">
                <IonIcon icon={alertCircleOutline} className="notfound-icon" />
              </div>
              
              <h1 className="notfound-title">404</h1>
              <h2 className="notfound-subtitle">Página no encontrada</h2>
              
              <p className="notfound-description">
                Lo sentimos, la página que intentas buscar no existe o ha sido movida.
              </p>
              
              <div className="notfound-countdown">
                <p>
                  Serás redirigido al Dashboard en{" "}
                  <span className="countdown-number">{countdown}</span> segundo{countdown !== 1 ? "s" : ""}
                </p>
              </div>
              
              <div className="notfound-buttons">
                <IonButton
                  expand="block"
                  color="primary"
                  onClick={handleGoHome}
                  className="notfound-btn"
                >
                  <IonIcon slot="start" icon={homeOutline} />
                  Ir al Dashboard
                </IonButton>
                
                <IonButton
                  expand="block"
                  fill="outline"
                  color="medium"
                  onClick={handleGoBack}
                  className="notfound-btn"
                >
                  <IonIcon slot="start" icon={arrowBackOutline} />
                  Volver atrás
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotFound;
