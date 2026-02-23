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
import axiosInstance from "../../config/axios";
import { people, cube, trendingUp, close, send } from "ionicons/icons";
import "./ReportesDashboard.css";

const Reportes: React.FC = () => {
  const history = useHistory();
  const [clientes, setClientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosInstance.get("/api/reportes/clientes-mas-pedidos"),
      axiosInstance.get("/api/reportes/productos-mas-pedidos"),
      axiosInstance.get("/api/reportes/stock-actual"),
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
  // Productos con bajo stock (ejemplo: stock_actual <= 30)
  const bajoStock = stock.filter((s: any) => s.stock_actual <= 30);
  
  // Calcular estadísticas generales
  const totalClientes = clientes.length;
  const totalProductos = productos.length;
  const totalStock = stock.length;

  return (
    <IonPage className="reportes-dashboard-page">
      <IonHeader>
        <IonToolbar className="reportes-dashboard-toolbar">
          <IonTitle>📊 Panel de Reportes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="reportes-dashboard-content">
        {loading ? (
          <div className="reportes-loading">
            <IonSpinner name="crescent" />
            <div className="reportes-loading-text">Cargando datos...</div>
          </div>
        ) : (
          <>
            <div className="reportes-title-section">
              <h1 className="reportes-main-title">Sistema de Reportes</h1>
              <p className="reportes-subtitle">
                Visualiza y analiza información clave de tu negocio
              </p>
            </div>

            <div className="reportes-stats-row">
              <div className="reportes-stat-card">
                <div className="reportes-stat-icon">👥</div>
                <div className="reportes-stat-content">
                  <div className="reportes-stat-number">{totalClientes}</div>
                  <div className="reportes-stat-label">Clientes VIP</div>
                </div>
              </div>

              {/*<div className="reportes-stat-card">
                <div className="reportes-stat-icon">📦</div>
                <div className="reportes-stat-content">
                  <div className="reportes-stat-number">{totalProductos}</div>
                  <div className="reportes-stat-label">Productos</div>
                </div>
              </div>*/}

              <div className="reportes-stat-card">
                <div className="reportes-stat-icon">📊</div>
                <div className="reportes-stat-content">
                  <div className="reportes-stat-number">{totalStock}</div>
                  <div className="reportes-stat-label">Items en Stock</div>
                </div>
              </div>
            </div>

            <IonGrid className="reportes-dashboard-grid">
              <IonRow>
                <IonCol size="12" sizeMd="6" className="reporte-card-wrapper">
                  <IonCard className="reporte-tarjeta reporte-card-clientes">
                    <IonCardHeader className="reporte-card-header">
                      <IonCardTitle className="reporte-card-title">
                        <IonIcon icon={people} />
                        Clientes de Alto Valor
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent className="reporte-card-content">
                      {topClientes.length === 0 ? (
                        <div className="reporte-empty">
                          <div className="reporte-empty-icon">📭</div>
                          <div>No hay datos disponibles</div>
                        </div>
                      ) : (
                        <ul className="reporte-lista">
                          {topClientes.map((c) => (
                            <li key={c.idCliente}>
                              {c.nombre} {c.apellido}{" "}
                              <span>({c.total_pedidos} Pedidos)</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <IonButton
                        className="reporte-btn-ver reporte-btn-ver-clientes"
                        fill="clear"
                        size="small"
                        onClick={() =>
                          history.push("/reportes/clientes-mas-pedidos")
                        }
                      >
                        Ver Reporte Completo →
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                <IonCol size="12" sizeMd="6" className="reporte-card-wrapper">
                  <IonCard className="reporte-tarjeta reporte-card-stock">
                    <IonCardHeader className="reporte-card-header">
                      <IonCardTitle className="reporte-card-title">
                        <IonIcon icon={cube} />
                        Gestión de Stock
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent className="reporte-card-content">
                      <div className="reporte-info-text">
                        Productos con Bajo Stock:{" "}
                        <span className="reporte-highlight-number">
                          {bajoStock.length}
                        </span>
                      </div>
                      <div className="reporte-info-text" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {bajoStock.length > 0 
                          ? "⚠️ Algunos productos requieren reabastecimiento"
                          : "✅ Todos los productos tienen stock adecuado"}
                      </div>
                      <IonButton
                        className="reporte-btn-ver reporte-btn-ver-stock"
                        fill="clear"
                        size="small"
                        onClick={() => history.push("/reportes/stock-actual")}
                      >
                        Ver Detalle de Stock →
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12" sizeMd="6" className="reporte-card-wrapper">
                  <IonCard className="reporte-tarjeta reporte-card-tendencias">
                    <IonCardHeader className="reporte-card-header">
                      <IonCardTitle className="reporte-card-title">
                        <IonIcon icon={send} />
                        Tendencias Empresas de Envío
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent className="reporte-card-content">
                      <div className="reporte-info-text">
                        Analiza la evolución y tendencias de uso de las diferentes
                        empresas de envío a lo largo del tiempo.
                      </div>
                      <IonButton
                        className="reporte-btn-ver reporte-btn-ver-tendencias"
                        fill="clear"
                        size="small"
                        onClick={() =>
                          history.push("/reportes/tendencias-empresas-envio")
                        }
                      >
                        Ver Tendencias →
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                <IonCol size="12" sizeMd="6" className="reporte-card-wrapper">
                  <IonCard className="reporte-tarjeta reporte-card-productos">
                    <IonCardHeader className="reporte-card-header">
                      <IonCardTitle className="reporte-card-title">
                        <IonIcon icon={trendingUp} />
                        Tendencias por Categoría
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent className="reporte-card-content">
                      {topProductos.length === 0 ? (
                        <div className="reporte-empty">
                          <div className="reporte-empty-icon">📭</div>
                          <div>No hay datos disponibles</div>
                        </div>
                      ) : (
                        <ul className="reporte-lista">
                          {topProductos.map((p, idx) => (
                            <li key={`${p.codigoIndumentaria}-${idx}`}>
                              {p.nombre_producto} - Talle {p.talle}
                              <span>({p.total_vendido} vendidos)</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <IonButton
                        className="reporte-btn-ver reporte-btn-ver-productos"
                        fill="clear"
                        size="small"
                        onClick={() =>
                          history.push("/reportes/productos-mas-pedidos")
                        }
                      >
                        Ver Reporte Completo →
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12" sizeMd="6" className="reporte-card-wrapper">
                  <IonCard className="reporte-tarjeta reporte-card-cancelaciones">
                    <IonCardHeader className="reporte-card-header">
                      <IonCardTitle className="reporte-card-title">
                        <IonIcon icon={close} />
                        Estadistica de Cancelaciones
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent className="reporte-card-content">
                      <div className="reporte-info-text">
                        Consulta el porcentaje de cancelaciones por motivo y
                        detecta patrones para mejorar tu operación.
                      </div>
                      <IonButton
                        className="reporte-btn-ver reporte-btn-ver-cancelaciones"
                        fill="clear"
                        size="small"
                        onClick={() =>
                          history.push("/reportes/analisis-cancelaciones")
                        }
                      >
                        Ver Reporte Completo →
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};
export default Reportes;
