import ExcelJS from "exceljs";
import { downloadOutline, filterOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonToast,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import axiosInstance from "../../config/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { documentText, checkmarkCircle, trendingUp } from "ionicons/icons";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./TendenciasEmpresaEnvios.css";

Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ChartTitle,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface TendenciaEmpresa {
  Mes: string;
  EmpresaEnvio: string;
  TotalPedidos: number;
  PedidosMesAnterior: number;
  Diferencia: number;
  PorcentajeCrecimiento: number | null;
}

const TendenciasEmpresaEnvios: React.FC = () => {
  const [data, setData] = useState<TendenciaEmpresa[]>([]);
  const [filtroMeses, setFiltroMeses] = useState<number>(12);
  const [toastExcel, setToastExcel] = useState(false);
  const [toastPDF, setToastPDF] = useState(false);
  const [loading, setLoading] = useState(false);
  const fechaEmision = new Date().toLocaleString("es-AR");
  const history = useHistory();

  // Cargar datos cuando cambie el filtro
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/api/reportes/tendencias-empresas-envio?meses=${filtroMeses}`)
      .then((res) => {
        setData(res.data);
      })
      .finally(() => setLoading(false));
  }, [filtroMeses]);

  // Procesar datos para el gráfico
  const procesarDatos = () => {
    // Obtener todos los meses únicos ordenados
    const meses = [...new Set(data.map((d) => d.Mes))].sort();
    // Obtener todas las empresas únicas
    const empresas = [...new Set(data.map((d) => d.EmpresaEnvio))];

    // Colores para cada empresa
    const colores = [
      "#4F46E5", // Índigo
      "#F59E0B", // Ámbar
      "#10B981", // Esmeralda
      "#EF4444", // Rojo
      "#8B5CF6", // Violeta
      "#06B6D4", // Cian
    ];

    const datasets = empresas.map((empresa, index) => {
      const datosEmpresa = meses.map((mes) => {
        const registro = data.find(
          (d) => d.Mes === mes && d.EmpresaEnvio === empresa
        );
        return registro ? registro.TotalPedidos : 0;
      });

      return {
        label: empresa,
        data: datosEmpresa,
        borderColor: colores[index % colores.length],
        backgroundColor: colores[index % colores.length] + "20",
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        fill: false,
        tension: 0.2,
      };
    });

    return {
      labels: meses,
      datasets: datasets,
    };
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const totalPedidos = data.reduce((sum, item) => sum + item.TotalPedidos, 0);
    
    // Empresa más popular (total)
    const empresasTotales = data.reduce((acc, item) => {
      acc[item.EmpresaEnvio] = (acc[item.EmpresaEnvio] || 0) + item.TotalPedidos;
      return acc;
    }, {} as Record<string, number>);

    const empresaMasPopular = Object.entries(empresasTotales).reduce((max, [empresa, total]) =>
      total > max.total ? { empresa, total } : max
    , { empresa: "N/A", total: 0 });

    // Mes con más actividad
    const mesesTotales = data.reduce((acc, item) => {
      acc[item.Mes] = (acc[item.Mes] || 0) + item.TotalPedidos;
      return acc;
    }, {} as Record<string, number>);

    const mesConMasActividad = Object.entries(mesesTotales).reduce((max, [mes, total]) =>
      total > max.total ? { mes, total } : max
    , { mes: "N/A", total: 0 });

    // Crecimiento promedio de la empresa más popular
    const datosEmpresaPopular = data.filter(item => item.EmpresaEnvio === empresaMasPopular.empresa);
    const crecimientoPromedio = datosEmpresaPopular.length > 0 
      ? datosEmpresaPopular
          .filter(item => item.PorcentajeCrecimiento !== null)
          .reduce((sum, item, _, array) => sum + (item.PorcentajeCrecimiento || 0) / array.length, 0)
      : 0;

    return {
      totalPedidos,
      empresaMasPopular: empresaMasPopular.empresa,
      mesConMasActividad: mesConMasActividad.mes,
      cantidadEmpresas: [...new Set(data.map(d => d.EmpresaEnvio))].length,
      crecimientoPromedio: Math.round(crecimientoPromedio * 100) / 100, // Redondear a 2 decimales
    };
  };

  const stats = calcularEstadisticas();

  // --- Exportar Excel ---
  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Tendencias Empresas de Envío");

    // Logo y título
    sheet.mergeCells("B1:E1");
    sheet.getCell("B1").value = "Tendencias de Empresas de Envío";
    sheet.getCell("B1").font = { bold: true, size: 16, color: { argb: "FF222222" } };
    sheet.getCell("B1").alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 28;

    sheet.mergeCells("A2:C2");
    sheet.getCell("A2").value = `Fecha de emisión: ${fechaEmision}`;
    sheet.getCell("A2").alignment = { horizontal: "center" };
    sheet.getCell("A2").font = { italic: true, size: 11, color: { argb: "FF666666" } };

    sheet.mergeCells("A3:C3");
    sheet.getCell("A3").value = `Período: Últimos ${filtroMeses} meses`;
    sheet.getCell("A3").alignment = { horizontal: "center" };
    sheet.getCell("A3").font = { italic: true, size: 10, color: { argb: "FF666666" } };

    // Headers
    const headerRow = sheet.addRow(["Mes", "Empresa de Envío", "Total Pedidos", "Pedidos Mes Anterior", "Diferencia", "% Crecimiento"]);
    for (let i = 1; i <= 6; i++) {
      headerRow.getCell(i).font = { bold: true, color: { argb: "FF222222" }, size: 13 };
      headerRow.getCell(i).alignment = { horizontal: "center", vertical: "middle" };
      headerRow.getCell(i).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" },
      };
      headerRow.getCell(i).border = {
        top: { style: "thin", color: { argb: "FFAAAAAA" } },
        left: { style: "thin", color: { argb: "FFAAAAAA" } },
        bottom: { style: "thin", color: { argb: "FFAAAAAA" } },
        right: { style: "thin", color: { argb: "FFAAAAAA" } },
      };
    }

    // Datos
    data.forEach((row) => {
      const r = sheet.addRow([
        row.Mes, 
        row.EmpresaEnvio, 
        row.TotalPedidos,
        row.PedidosMesAnterior,
        row.Diferencia,
        row.PorcentajeCrecimiento ? `${row.PorcentajeCrecimiento}%` : "N/A"
      ]);
      for (let i = 1; i <= 6; i++) {
        r.getCell(i).alignment = { horizontal: "center", vertical: "middle" };
        r.getCell(i).border = {
          top: { style: "thin", color: { argb: "FFDDDDDD" } },
          left: { style: "thin", color: { argb: "FFDDDDDD" } },
          bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
          right: { style: "thin", color: { argb: "FFDDDDDD" } },
        };
      }
    });

    // Ajustar anchos
    [15, 25, 15, 18, 12, 15].forEach((w, i) => {
      sheet.getColumn(i + 1).width = w;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Tendencias_empresas_envio_${filtroMeses}meses_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setToastExcel(true);
  };

  // --- Exportar PDF ---
  const exportarPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = "Tendencias de Empresas de Envío";
    const textWidth = doc.getTextWidth(title);
    const x = (pageWidth - textWidth) / 2;

    doc.text(title, x, 18);
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${fechaEmision}`, x, 25);
    doc.text(`Período: Últimos ${filtroMeses} meses`, x, 30);

    autoTable(doc, {
      head: [["Mes", "Empresa de Envío", "Total Pedidos", "Mes Anterior", "Diferencia", "% Crecimiento"]],
      body: data.map((row) => [
        row.Mes, 
        row.EmpresaEnvio, 
        row.TotalPedidos,
        row.PedidosMesAnterior,
        row.Diferencia,
        row.PorcentajeCrecimiento ? `${row.PorcentajeCrecimiento}%` : "N/A"
      ]),
      startY: 35,
      styles: { fontSize: 10, halign: "center" },
      headStyles: { fillColor: [79, 70, 229], halign: "center" },
    });

    doc.save(`Tendencias_empresas_envio_${filtroMeses}meses.pdf`);
    setToastPDF(true);
  };

  // Función auxiliar para obtener datos de tendencia por empresa y mes
  const obtenerDatosTendencia = (empresa: string, mes: string) => {
    const registro = data.find(
      (d) => d.EmpresaEnvio === empresa && d.Mes === mes
    );
    if (!registro) return null;
    
    const { TotalPedidos, PedidosMesAnterior, PorcentajeCrecimiento } = registro;
    
    let tendencia = "Sin datos anterior";
    let color = "#94A3B8"; // Gris
    let icono = "📊";
    
    if (PorcentajeCrecimiento !== null) {
      if (PorcentajeCrecimiento > 5) {
        tendencia = "Crecimiento";
        color = "#10B981"; // Verde
        icono = "📈";
      } else if (PorcentajeCrecimiento < -5) {
        tendencia = "Decrecimiento";
        color = "#EF4444"; // Rojo
        icono = "📉";
      } else {
        tendencia = "Estable";
        color = "#F59E0B"; // Ámbar
        icono = "📊";
      }
    }
    
    return {
      totalPedidos: TotalPedidos,
      pedidosMesAnterior: PedidosMesAnterior,
      porcentajeCrecimiento: PorcentajeCrecimiento,
      tendencia,
      color,
      icono
    };
  };

  // Opciones del gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Permitir que se estire al contenedor
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: "#ffffff",
          font: { size: 14, weight: "bold" as const },
          padding: 20,
          boxWidth: 25,
        },
      },
      datalabels: {
        display: false, // Desactivamos etiquetas en las líneas para mejor visualización
      },
      title: {
        display: true,
        text: `Tendencias de Empresas de Envío (Últimos ${filtroMeses} meses)`,
        font: { size: 18, weight: "bold" as const },
        color: "#ffffff",
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "rgba(30, 30, 30, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#4F46E5",
        borderWidth: 2,
        cornerRadius: 8,
        padding: 12,
        titleFont: { size: 14, weight: "bold" as const },
        bodyFont: { size: 13 },
        mode: 'index' as const,
        intersect: false,
        filter: (tooltipItem: any, data: any) => {
          // Obtener el valor del punto donde se hizo hover
          const valorHover = tooltipItem.parsed.y;
          
          // Solo mostrar empresas que tengan exactamente ese mismo valor
          return tooltipItem.parsed.y === valorHover;
        },
        callbacks: {
          title: (context: any) => {
            return ``; // Sin título para más espacio
          },
          label: (context: any) => {
            const empresa = context.dataset.label;
            const mes = context.label;
            const valor = context.parsed.y;
            const datosTendencia = obtenerDatosTendencia(empresa, mes);
            
            if (!datosTendencia) return [`📅 ${mes}`, `    ${empresa}`, `📦 Pedidos: ${valor}`];
            
            const lineas = [
              `📅 ${mes}`,
              `    ${empresa}`,
              `📦 Pedidos actuales: ${datosTendencia.totalPedidos}`,
              `📋 Mes anterior: ${datosTendencia.pedidosMesAnterior}`
            ];
            
            if (datosTendencia.porcentajeCrecimiento !== null) {
              const porcentaje = datosTendencia.porcentajeCrecimiento;
              const signo = porcentaje >= 0 ? "+" : "";
              lineas.push(`📊 Variación: ${signo}${porcentaje}%`);
            } else {
              lineas.push(`📊 Variación: No disponible`);
            }
            
            lineas.push(`${datosTendencia.icono} Tendencia: ${datosTendencia.tendencia}`);
            
            return lineas;
          },
          afterLabel: (context: any) => {
            // Solo agregar separador visual entre empresas
            const allContext = context.chart.tooltip.dataPoints || [];
            const currentIndex = context.datasetIndex;
            const isLast = currentIndex === allContext[allContext.length - 1]?.datasetIndex;
            
            // Agregar separador solo si no es la última empresa
            if (!isLast && allContext.length > 1) {
              return [``]; // Una línea vacía como separador
            }
            return [];
          },
          labelTextColor: () => {
            return "#ffffff";
          }
        }
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#ffffff", font: { size: 12 } },
        title: {
          display: true,
          text: "Mes",
          color: "#ffffff",
          font: { size: 14, weight: "bold" as const },
        },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#ffffff", font: { size: 12 } },
        title: {
          display: true,
          text: "Cantidad de Pedidos",
          color: "#ffffff",
          font: { size: 14, weight: "bold" as const },
        },
        beginAtZero: true,
      },
    },
  };

  const chartData = procesarDatos();

  return (
    <IonPage className="tendencias-empresas-page">
      <IonHeader>
        <IonToolbar className="tendencias-empresas-toolbar">
          <IonTitle>📈 Tendencias Empresas de Envío</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="tendencias-empresas-content">
        <IonGrid>
          {/* Título y filtros */}
          <IonRow>
            <IonCol size="12">
              <div className="tendencias-title-section">
                <h1 className="tendencias-main-title">
                  Tendencias de Empresas de Envío
                </h1>
                <div className="tendencias-emission-date">
                  Fecha de emisión: {fechaEmision}
                </div>

                <div className="tendencias-filter-section">
                  <IonSegment
                    value={filtroMeses}
                    onIonChange={(e) => setFiltroMeses(Number(e.detail.value))}
                    className="tendencias-filter-segment"
                  >
                    <IonSegmentButton value={3}>
                      <IonLabel>3 Meses</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value={6}>
                      <IonLabel>6 Meses</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value={12}>
                      <IonLabel>1 Año</IonLabel>
                    </IonSegmentButton>
                  </IonSegment>
                </div>

                <div className="tendencias-stats-row">
                  <div className="tendencias-stat-card">
                    <div className="tendencias-stat-icon">📦</div>
                    <div className="tendencias-stat-content">
                      <div className="tendencias-stat-number">{stats.totalPedidos}</div>
                      <div className="tendencias-stat-label">Total Pedidos</div>
                    </div>
                  </div>

                  <div className="tendencias-stat-card">
                    <div className="tendencias-stat-icon">🏆</div>
                    <div className="tendencias-stat-content">
                      <div className="tendencias-stat-number">{stats.empresaMasPopular}</div>
                      <div className="tendencias-stat-label">Más Popular</div>
                    </div>
                  </div>

                  <div className="tendencias-stat-card">
                    <div className="tendencias-stat-icon">📈</div>
                    <div className="tendencias-stat-content">
                      <div className={`tendencias-stat-number ${stats.crecimientoPromedio >= 0 ? 'tendencias-positive' : 'tendencias-negative'}`}>
                        {stats.crecimientoPromedio >= 0 ? "+" : ""}{stats.crecimientoPromedio}%
                      </div>
                      <div className="tendencias-stat-label">Crecimiento Promedio</div>
                    </div>
                  </div>

                  <div className="tendencias-stat-card">
                    <div className="tendencias-stat-icon">📊</div>
                    <div className="tendencias-stat-content">
                      <div className="tendencias-stat-number">{stats.cantidadEmpresas}</div>
                      <div className="tendencias-stat-label">Empresas Activas</div>
                    </div>
                  </div>
                </div>
              </div>
            </IonCol>
          </IonRow>

          {/* Gráfico */}
          <IonRow>
            <IonCol size="12">
              <div className="tendencias-chart-container">
                {loading ? (
                  <div className="tendencias-loading">Cargando datos...</div>
                ) : (
                  <Line data={chartData} options={chartOptions} />
                )}
              </div>
            </IonCol>
          </IonRow>

          {/* Tabla de datos */}
          <IonRow>
            <IonCol size="12">
              <IonCard className="tendencias-table-card">
                <IonCardContent>
                  <IonGrid className="tendencias-table-grid">
                    {/* Header */}
                    <IonRow className="tendencias-table-header">
                      <IonCol size="2" className="tendencias-table-cell">
                        Mes
                      </IonCol>
                      <IonCol size="3" className="tendencias-table-cell">
                        Empresa de Envío
                      </IonCol>
                      <IonCol size="2" className="tendencias-table-cell">
                        Total Pedidos
                      </IonCol>
                      <IonCol size="2" className="tendencias-table-cell">
                        Mes Anterior
                      </IonCol>
                      <IonCol size="1" className="tendencias-table-cell">
                        Diferencia
                      </IonCol>
                      <IonCol size="2" className="tendencias-table-cell">
                        % Crecimiento
                      </IonCol>
                    </IonRow>

                    {/* Datos */}
                    {data.map((row, idx) => (
                      <IonRow key={`${row.Mes}-${row.EmpresaEnvio}-${idx}`} className="tendencias-table-row">
                        <IonCol size="2" className="tendencias-table-cell">
                          {row.Mes}
                        </IonCol>
                        <IonCol size="3" className="tendencias-table-cell">
                          {row.EmpresaEnvio}
                        </IonCol>
                        <IonCol size="2" className="tendencias-table-cell tendencias-number-high">
                          {row.TotalPedidos}
                        </IonCol>
                        <IonCol size="2" className="tendencias-table-cell">
                          {row.PedidosMesAnterior}
                        </IonCol>
                        <IonCol size="1" className="tendencias-table-cell">
                          <span className={row.Diferencia >= 0 ? "tendencias-positive" : "tendencias-negative"}>
                            {row.Diferencia >= 0 ? "+" : ""}{row.Diferencia}
                          </span>
                        </IonCol>
                        <IonCol size="2" className="tendencias-table-cell">
                          {row.PorcentajeCrecimiento !== null ? (
                            <span className={row.PorcentajeCrecimiento >= 0 ? "tendencias-positive" : "tendencias-negative"}>
                              {row.PorcentajeCrecimiento >= 0 ? "+" : ""}{row.PorcentajeCrecimiento}%
                            </span>
                          ) : (
                            <span className="tendencias-neutral">N/A</span>
                          )}
                        </IonCol>
                      </IonRow>
                    ))}
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* Acciones */}
          <IonRow>
            <IonCol size="12">
              <div className="tendencias-actions-container">
                <IonButton
                  className="tendencias-btn-export"
                  size="small"
                  onClick={exportarExcel}
                >
                  <IonIcon icon={downloadOutline} slot="start" /> Exportar Excel
                </IonButton>
                <IonButton
                  className="tendencias-btn-pdf"
                  size="small"
                  onClick={exportarPDF}
                >
                  <IonIcon icon={documentText} slot="start" /> PDF
                </IonButton>
                <IonButton
                  className="tendencias-btn-back"
                  size="small"
                  fill="clear"
                  onClick={() => history.push("/Reportes")}
                >
                  Volver
                </IonButton>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={toastExcel}
          onDidDismiss={() => setToastExcel(false)}
          message="¡Excel exportado exitosamente!"
          duration={1800}
          cssClass="tendencias-toast-success"
          icon={checkmarkCircle}
          position="top"
        />
        <IonToast
          isOpen={toastPDF}
          onDidDismiss={() => setToastPDF(false)}
          message="¡PDF exportado exitosamente!"
          duration={1800}
          cssClass="tendencias-toast-success"
          icon={checkmarkCircle}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default TendenciasEmpresaEnvios;