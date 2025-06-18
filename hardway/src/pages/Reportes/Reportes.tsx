import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./Reportes.css";

const Reportes: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="warning">
          <IonTitle>Reportes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding reportes-dashboard-content">
        <IonGrid className="reportes-dashboard-grid">
          <IonRow>
            <IonCol size="6">
              <IonCard className="reporte-tarjeta">
                <IonCardHeader>
                  <IonCardTitle>Clientes principales</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <ul className="reporte-lista">
                    <li>
                      Laura Fernandez <span>(15 Pedidos)</span>
                    </li>
                    <li>
                      Juan Pérez <span>(13 Pedidos)</span>
                    </li>
                    <li>
                      Martin Gomez <span>(12 Pedidos)</span>
                    </li>
                  </ul>
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() =>
                      history.push("/reportes/clientes-mas-pedidos")
                    }
                  >
                    Ver reporte completo...
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard className="reporte-tarjeta">
                <IonCardHeader>
                  <IonCardTitle>Resumen de stock</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div>
                    Productos con Bajo Stock: <strong>5</strong>
                  </div>
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => history.push("/reportes/stock-actual")}
                  >
                    Ver detalle de stock...
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <IonCard className="reporte-tarjeta">
                <IonCardHeader>
                  <IonCardTitle>Productos estrella</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="reporte-barra-producto">
                    Camisa <span className="barra barra-llena"></span>
                  </div>
                  <div className="reporte-barra-producto">
                    Chaqueta <span className="barra barra-media"></span>
                  </div>
                  <div className="reporte-barra-producto">
                    Pantalón <span className="barra barra-baja"></span>
                  </div>
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() =>
                      history.push("/reportes/productos-mas-pedidos")
                    }
                  >
                    Ver reporte completo...
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
            {/*<IonCol size="6">
              <IonCard className="reporte-tarjeta">
                <IonCardHeader>
                  <IonCardTitle>Ventas (últimos 7 días)</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <pre className="reporte-ascii-grafico">/\ / \ /----\ / \</pre>
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() =>
                      history.push("/reportes/ultima-semana-venta")
                    }
                  >
                    Ver reporte de ventas...
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>*/}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
export default Reportes;
