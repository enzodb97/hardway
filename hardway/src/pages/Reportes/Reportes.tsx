import React, { useEffect, useState } from "react";
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
  IonSpinner,
  IonIcon,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { people, cube, trendingUp } from "ionicons/icons";
import "./Reportes.css";

const Reportes: React.FC = () => {
  const history = useHistory();
  const [clientes, setClientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("/api/reportes/clientes-mas-pedidos"),
      axios.get("/api/reportes/productos-mas-pedidos"),
      axios.get("/api/reportes/stock-actual"),
    ])
      .then(([clientesRes, productosRes, stockRes]) => {
        setClientes(clientesRes.data || []);
        setProductos(productosRes.data || []);
        setStock(stockRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Top 3 clientes
  const topClientes = clientes.slice(0, 3);
  // Top 3 productos
  const topProductos = productos.slice(0, 3);
  // Productos con bajo stock (ejemplo: stock_actual <= 5)
  const bajoStock = stock.filter((s: any) => s.stock_actual <= 30);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="warning">
          <IonTitle>Reportes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding reportes-dashboard-content">
        {loading ? (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <IonGrid className="reportes-dashboard-grid">
            <IonRow>
              <IonCol size="6">
                <IonCard className="reporte-tarjeta">
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon
                        icon={people}
                        style={{
                          marginRight: 8,
                          verticalAlign: "middle",
                        }}
                      />
                      Clientes principales
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <ul className="reporte-lista">
                      {topClientes.length === 0 && <li>No hay datos</li>}
                      {topClientes.map((c) => (
                        <li key={c.idCliente}>
                          {c.nombre} {c.apellido}{" "}
                          <span>({c.total_pedidos} Pedidos)</span>
                        </li>
                      ))}
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
                    <IonCardTitle>
                      <IonIcon
                        icon={cube}
                        style={{
                          marginRight: 8,
                          verticalAlign: "middle",
                        }}
                      />
                      Resumen de stock
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div>
                      Productos con Bajo Stock:{" "}
                      <strong>{bajoStock.length}</strong>
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
                    <IonCardTitle>
                      <IonIcon
                        icon={trendingUp}
                        style={{
                          marginRight: 8,
                          verticalAlign: "middle",
                        }}
                      />
                      Productos mas pedidos
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <ul className="reporte-lista">
                      {topProductos.length === 0 && <li>No hay datos</li>}
                      {topProductos.map((p, idx) => (
                        <li key={p.codigoIndumentaria}>
                          {p.nombre_indumentaria} - Talle {p.talle} - {p.tela} -{" "}
                          {p.color}
                          <span>({p.cantidad_total_vendida} pedidos)</span>
                        </li>
                      ))}
                    </ul>
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
            </IonRow>
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
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};
export default Reportes;
