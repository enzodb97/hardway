import ExcelJS from "exceljs";
import { downloadOutline } from "ionicons/icons";
import React, { useEffect, useState, useRef } from "react";
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
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import axiosInstance from "../../config/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { documentText } from "ionicons/icons";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./Reportes.css";
import "./ProductosMasPedidos.table.css";
import "./ProductosMasPedidos.css";
import { checkmarkCircle } from "ionicons/icons";

// Registrar componentes y plugins
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface ProductoMasPedidoPorTemporada {
  temporada: string;
  ranking: number;
  nombre_producto: string;
  codigoIndumentaria: string;
  total_vendido: number;
  talle: string;
  tela: string;
  color: string;
}

const ProductosMasPedidos: React.FC = () => {
  const [productos, setProductos] = useState<ProductoMasPedidoPorTemporada[]>(
    []
  );
  const [incluirGrafico, setIncluirGrafico] = useState(false);
  const [temporadaSeleccionada, setTemporadaSeleccionada] =
    useState<string>("");
  const chartRefs = useRef<{ [temporada: string]: any }>({});
  const [graficoListo, setGraficoListo] = useState(false);
  const fechaEmision = new Date().toLocaleString("es-AR");
  const [showToast, setShowToast] = useState({ open: false, message: "" });
  const history = useHistory();

  useEffect(() => {
    axiosInstance
      .get("/api/reportes/productos-mas-pedidos")
      .then((res) => setProductos(res.data))
      .catch((error) => {
        console.error("Error al cargar productos más pedidos:", error);
        setProductos([]);
      });
  }, []);

  // Agrupar productos por temporada
  const productosPorTemporada: {
    [temporada: string]: ProductoMasPedidoPorTemporada[];
  } = {};
  productos.forEach((p) => {
    if (!productosPorTemporada[p.temporada])
      productosPorTemporada[p.temporada] = [];
    productosPorTemporada[p.temporada].push(p);
  });

  // Calcular estadísticas
  const totalProductos = productos.length;
  const temporadasUnicas = Object.keys(productosPorTemporada).length;

  const temporadas = Object.keys(productosPorTemporada);
  React.useEffect(() => {
    if (!temporadaSeleccionada && temporadas.length > 0) {
      setTemporadaSeleccionada(temporadas[0]);
    }
  }, [temporadas, temporadaSeleccionada]);

  // Marcar el gráfico como listo cuando el ref cambia y es válido
  useEffect(() => {
    setGraficoListo(false);
    const timeout = setTimeout(() => {
      const ref = chartRefs.current[temporadaSeleccionada];
      let chartInstance = null;
      if (ref) {
        if (ref.chartInstance) chartInstance = ref.chartInstance;
        else if (ref.chart) chartInstance = ref.chart;
        else chartInstance = ref;
      }
      if (chartInstance && typeof chartInstance.toBase64Image === "function") {
        setGraficoListo(true);
      }
    }, 200); // pequeño retardo para asegurar render
    return () => clearTimeout(timeout);
  }, [
    temporadaSeleccionada,
    productosPorTemporada[temporadaSeleccionada]?.length,
  ]);

  // Colores para las barras
  // Paleta corporativa: azul, amarillo, gris, naranja, violeta, verde, etc.
  const colores = [
    "#0057ff", // azul corporativo
    "#fdb40b", // amarillo corporativo
    "#755bd4ff", // violeta
    "#ff9f40", // naranja
    "#b284be", // lila
    "#00c49a", // verde
    "#ff6384", // rojo
    "#36a2eb", // azul claro
    "#ffce56", // amarillo claro
    "#4bc0c0", // verde agua
  ];

  // Generar datos de gráfico por temporada

  const getChartData = (productos: ProductoMasPedidoPorTemporada[]) => {
    return {
      labels: productos.map(
        (p) =>
          `${p.nombre_producto} (${p.codigoIndumentaria})\nTalle: ${p.talle} | Tela: ${p.tela} | Color: ${p.color}`
      ),
      datasets: [
        {
          label: "Cantidad Vendida",
          data: productos.map((p) => p.total_vendido),
          backgroundColor: colores.slice(0, productos.length),
          borderRadius: 8,
          maxBarThickness: 32,
        },
      ],
    };
  };

  // Plugin para agregar contorno negro a los textos
  const textOutlinePlugin = {
    id: 'textOutline',
    beforeDraw: (chart: any) => {
      const ctx = chart.ctx;
      ctx.save();
      
      // Guardar el método original fillText
      const originalFillText = ctx.fillText;
      
      // Sobrescribir fillText para agregar contorno
      ctx.fillText = function(text: string, x: number, y: number, maxWidth?: number) {
        // Dibujar contorno negro
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        
        if (maxWidth) {
          ctx.strokeText(text, x, y, maxWidth);
        } else {
          ctx.strokeText(text, x, y);
        }
        
        // Llamar al fillText original para el texto
        originalFillText.call(ctx, text, x, y, maxWidth);
      };
    },
    afterDraw: (chart: any) => {
      chart.ctx.restore();
    }
  };

  // Mejorar opciones del gráfico para responsive
  const getChartOptions = (
    temporada: string,
    productos: ProductoMasPedidoPorTemporada[]
  ) => ({
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: [
          `Top Productos Más Pedidos`,
          `Temporada seleccionada: ${temporada}`,
        ],
        font: { size: 20, family: "Montserrat, Arial, sans-serif" },
        color: "#ffffff",
        padding: { top: 10, bottom: 8 },
        align: "center" as const,
      },
      datalabels: {
        anchor: "end" as const,
        align: "end" as const,
        color: "#ffffff",
        font: { weight: "bold" as const, size: 14 },
        formatter: (value: number) => value,
        clamp: true,
        display: true,
      },
      tooltip: {
        backgroundColor: "rgba(30, 30, 30, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#755bd4ff",
        borderWidth: 2,
        callbacks: {
          label: function (context: any) {
            const idx = context.dataIndex;
            const p = productos[idx];
            return [
              `Cantidad: ${p.total_vendido}`,
              `Código: ${p.codigoIndumentaria}`,
              `Talle: ${p.talle}`,
              `Tela: ${p.tela}`,
              `Color: ${p.color}`,
              `Ranking: ${p.ranking}`,
            ];
          },
        },
      },
    },
    layout: {
      padding: {
        left: 16,
        right: 16,
        top: 16,
        bottom: 16,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Cantidad Total",
          font: { size: 15, family: "Poppins, Arial, sans-serif" },
          color: "#ffffff",
        },
        beginAtZero: true,
        max: Math.max(...productos.map((p) => p.total_vendido), 0) + 1,
        ticks: { 
          precision: 0, 
          font: { size: 13 },
          color: "#ffffff"
        },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        title: {
          display: true,
          text: "Producto",
          font: { size: 15, family: "Poppins, Arial, sans-serif" },
          color: "#ffffff",
        },
        ticks: { 
          font: { size: 13 },
          color: "#ffffff"
        },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  });

  // Exportar a Excel con gráfico de barras de productos más pedidos
  const exportarExcel = async () => {
    if (!graficoListo) {
      return;
    }
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Pegasus System";
    workbook.created = new Date();

    // Hoja de Productos con columnas correctas y estilos profesionales
    const wsProductos = workbook.addWorksheet("Productos más pedidos");

    // --- LOGO ---
    // Aquí puedes agregar tu logo institucional (PNG base64 o buffer)
    const logoId = workbook.addImage({
      base64:
        "data:image/png;base64,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",
      extension: "png",
    });
    wsProductos.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 80, height: 60 },
    });
    // Ajustar altura de filas para que el logo no tape el título ni la fecha
    wsProductos.getRow(1).height = 42;
    wsProductos.getRow(2).height = 28;
    // --- FIN LOGO ---

    // Fila de título grande y centrado
    wsProductos.mergeCells("B1:H1");
    wsProductos.getCell("B1").value = "Top 10 Productos Más Pedidos";
    wsProductos.getCell("B1").font = {
      bold: true,
      size: 18,
      color: { argb: "FF333333" },
    };
    wsProductos.getCell("B1").alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    wsProductos.getRow(1).height = 28;

    // Fila de fecha
    wsProductos.mergeCells("A2:F2");
    wsProductos.getCell("A2").value = `Fecha de emisión: ${fechaEmision}`;
    wsProductos.getCell("A2").font = {
      italic: true,
      size: 11,
      color: { argb: "FF666666" },
    };
    wsProductos.getCell("A2").alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    wsProductos.getRow(2).height = 20;

    // Definir columnas con ancho, encabezado y tipo
    wsProductos.columns = [
      { header: "", key: "nombre", width: 25 },
      { header: "", key: "codigo", width: 15 },
      {
        header: "",
        key: "cantidad",
        width: 12,
        style: { numFmt: "#,##0" },
      },
      { header: "", key: "talle", width: 10 },
      { header: "", key: "tela", width: 15 },
      {
        header:
          "Top 10 Productos mas pedido de la Temporada" +
          (temporadaSeleccionada ? ` (${temporadaSeleccionada})` : ""),
        key: "color",
        width: 15,
      },
    ];
    // Forzar la fila de encabezado manualmente para evitar errores de visualización
    wsProductos.getRow(3).values = [
      "Nombre",
      "Código",
      "Cantidad",
      "Talle",
      "Tela",
      "Color",
    ];

    // Exportar solo la temporada seleccionada
    if (temporadaSeleccionada && productosPorTemporada[temporadaSeleccionada]) {
      productosPorTemporada[temporadaSeleccionada].forEach((p) => {
        wsProductos.addRow({
          nombre: p.nombre_producto,
          codigo: p.codigoIndumentaria,
          cantidad: Number(p.total_vendido),
          talle: p.talle,
          tela: p.tela,
          color: p.color,
        });
      });
    }

    // Estilos para el encabezado (ahora fila 3)
    wsProductos.getRow(3).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFAA61A" }, // Naranja profesional
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "medium", color: { argb: "FFAAAAAA" } },
        left: { style: "medium", color: { argb: "FFAAAAAA" } },
        bottom: { style: "medium", color: { argb: "FFAAAAAA" } },
        right: { style: "medium", color: { argb: "FFAAAAAA" } },
      };
    });
    wsProductos.getRow(3).height = 22;

    // Estilos para las filas de datos (desde la fila 4)
    wsProductos.eachRow((row, rowNumber) => {
      if (rowNumber <= 3) return; // Saltar título, fecha y encabezado
      row.height = 20;
      row.eachCell((cell, colNumber) => {
        // Alternar color de fondo para filas
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowNumber % 2 === 0 ? "FFFFFFFF" : "FFF7F7F7" },
        };
        cell.font = { size: 11, color: { argb: "FF333333" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFCCCCCC" } },
          left: { style: "thin", color: { argb: "FFCCCCCC" } },
          bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
          right: { style: "thin", color: { argb: "FFCCCCCC" } },
        };
      });
    });

    // Exportar solo el gráfico de la temporada seleccionada (robusto)
    let currentRow = wsProductos.lastRow ? wsProductos.lastRow.number + 2 : 5;
    let chartRef = chartRefs.current[temporadaSeleccionada];
    let chartInstance = null;
    if (chartRef) {
      if (chartRef.chartInstance)
        chartInstance = chartRef.chartInstance; // Chart.js 2.x
      else if (chartRef.chart) chartInstance = chartRef.chart; // Chart.js 3.x
      else chartInstance = chartRef;
    }
    let imgBase64 = null;
    if (chartInstance && typeof chartInstance.toBase64Image === "function") {
      try {
        imgBase64 = chartInstance.toBase64Image();
      } catch (e) {
        imgBase64 = null;
      }
    }
    if (imgBase64 && imgBase64.startsWith("data:image/png;base64,")) {
      const base64Data = imgBase64.replace(/^data:image\/png;base64,/, "");
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;
      const imageId = workbook.addImage({
        buffer: arrayBuffer,
        extension: "png",
      });
      wsProductos.addImage(imageId, {
        tl: { col: 0, row: currentRow },
        ext: { width: 1000, height: 600 },
      });
    }

    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productos_mas_pedidos_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setShowToast({ open: true, message: "¡Excel exportado exitosamente!" });
  };

  const exportarPDF = async () => {
    if (incluirGrafico && !graficoListo) {
      return;
    }
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const title =
      "Top 10 Productos Más Pedidos Temporada " + temporadaSeleccionada;
    const textWidth = doc.getTextWidth(title);
    const x = (pageWidth - textWidth) / 2;

    // Logo en base64 (puedes usar tu propio logo)
    const logoBase64 =
      "data:image/png;base64,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";

    doc.addImage(logoBase64, "PNG", 10, 8, 15, 15);
    doc.text(title, x, 18);
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${fechaEmision}`, x, 25);

    // Tabla primero
    // Exportar solo la tabla de la temporada seleccionada
    let startY = 32;
    if (temporadaSeleccionada && productosPorTemporada[temporadaSeleccionada]) {
      doc.setFontSize(13);
      autoTable(doc, {
        head: [
          ["Ranking", "Nombre", "Código", "Cantidad", "Talle", "Tela", "Color"],
        ],
        body: productosPorTemporada[temporadaSeleccionada].map((p) => [
          p.ranking,
          p.nombre_producto,
          p.codigoIndumentaria,
          p.total_vendido,
          p.talle,
          p.tela,
          p.color,
        ]),
        startY: startY + 12,
        styles: { fontSize: 10, halign: "center" },
        headStyles: { fillColor: [254, 175, 0], halign: "center" },
      });
      startY = (doc as any).lastAutoTable.finalY || startY + 40;
    }

    // Gráfico debajo de la tabla solo de la temporada seleccionada (robusto)
    if (
      incluirGrafico &&
      temporadaSeleccionada &&
      chartRefs.current[temporadaSeleccionada]
    ) {
      let y = startY + 10;
      let chartRefPDF = chartRefs.current[temporadaSeleccionada];
      let chartInstancePDF = null;
      if (chartRefPDF) {
        if (chartRefPDF.chartInstance)
          chartInstancePDF = chartRefPDF.chartInstance;
        else if (chartRefPDF.chart) chartInstancePDF = chartRefPDF.chart;
        else chartInstancePDF = chartRefPDF;
      }
      let imgData = null;
      if (
        chartInstancePDF &&
        typeof chartInstancePDF.toBase64Image === "function"
      ) {
        try {
          imgData = chartInstancePDF.toBase64Image();
        } catch (e) {
          imgData = null;
        }
      }
      if (imgData && imgData.startsWith("data:image/png;base64,")) {
        doc.setFontSize(12);
        doc.text(`Gráfico - ${temporadaSeleccionada}`, 15, y);
        doc.addImage(imgData, "PNG", 15, y + 2, 180, 50);
      }
    }

    doc.save("Productos_mas_pedidos.pdf");
    setShowToast({ open: true, message: "¡PDF exportado exitosamente!" });
  };

  return (
    <IonPage className="productos-pedidos-page">
      <IonHeader>
        <IonToolbar className="productos-pedidos-toolbar">
          <IonTitle>📦 Productos Más Pedidos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="productos-pedidos-content">
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <div className="productos-title-section">
                <h1 className="productos-main-title">
                  Top 10 Productos Más Pedidos por Temporada
                </h1>
                <div className="productos-emission-date">
                  Fecha de emisión: {fechaEmision}
                </div>
                
                <div className="productos-stats-row">
                  <div className="productos-stat-card">
                    <div className="productos-stat-icon">📦</div>
                    <div className="productos-stat-content">
                      <div className="productos-stat-number">{totalProductos}</div>
                      <div className="productos-stat-label">Total Productos</div>
                    </div>
                  </div>
                  
                  <div className="productos-stat-card">
                    <div className="productos-stat-icon">🗓️</div>
                    <div className="productos-stat-content">
                      <div className="productos-stat-number">{temporadasUnicas}</div>
                      <div className="productos-stat-label">Temporadas</div>
                    </div>
                  </div>
                </div>

                <div className="productos-filter-section">
                  <label htmlFor="temporada-select" className="productos-filter-label">
                    Temporada:
                  </label>
                  <select
                    id="temporada-select"
                    value={temporadaSeleccionada}
                    onChange={(e) => setTemporadaSeleccionada(e.target.value)}
                    className="productos-select"
                  >
                    {temporadas.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </IonCol>
          </IonRow>
          {temporadaSeleccionada && (
            <IonRow>
              <IonCol size="12">
                <IonCard className="productos-table-card">
                  <IonCardContent>
                    <IonGrid className="productos-table-grid">
                      <IonRow className="productos-table-header">
                        <IonCol size="1" className="productos-table-cell">Ranking</IonCol>
                        <IonCol size="3" className="productos-table-cell">Producto</IonCol>
                        <IonCol size="2" className="productos-table-cell">Código</IonCol>
                        <IonCol size="1" className="productos-table-cell">Cantidad</IonCol>
                        <IonCol size="1" className="productos-table-cell">Talle</IonCol>
                        <IonCol size="2" className="productos-table-cell">Tela</IonCol>
                        <IonCol size="2" className="productos-table-cell">Color</IonCol>
                      </IonRow>
                      
                      {(productosPorTemporada[temporadaSeleccionada] || []).map(
                        (p, idx) => (
                          <IonRow
                            className={`productos-table-row ${p.ranking <= 3 ? 'top-ranking' : ''}`}
                            key={
                              p.codigoIndumentaria +
                              "-" +
                              p.ranking +
                              "-" +
                              p.talle +
                              "-" +
                              p.tela +
                              "-" +
                              p.color
                            }
                          >
                            <IonCol size="1" className="productos-table-cell">
                              {p.ranking <= 3 ? (
                                <span className="productos-ranking-badge">
                                  #{p.ranking} 🏆
                                </span>
                              ) : (
                                `#${p.ranking}`
                              )}
                            </IonCol>
                            <IonCol size="3" className="productos-table-cell">
                              {p.nombre_producto}
                            </IonCol>
                            <IonCol size="2" className="productos-table-cell">
                              {p.codigoIndumentaria}
                            </IonCol>
                            <IonCol size="1" className="productos-table-cell productos-quantity-high">
                              {p.total_vendido}
                            </IonCol>
                            <IonCol size="1" className="productos-table-cell">
                              {p.talle}
                            </IonCol>
                            <IonCol size="2" className="productos-table-cell">
                              {p.tela}
                            </IonCol>
                            <IonCol size="2" className="productos-table-cell">
                              {p.color}
                            </IonCol>
                          </IonRow>
                        )
                      )}
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}

          {temporadaSeleccionada && (
            <IonRow>
              <IonCol size="12">
                <div className="productos-chart-container">
                  <Bar
                    key={temporadaSeleccionada}
                    ref={(el) => {
                      chartRefs.current[temporadaSeleccionada] = el;
                    }}
                    data={getChartData(
                      productosPorTemporada[temporadaSeleccionada] || []
                    )}
                    options={getChartOptions(
                      temporadaSeleccionada,
                      productosPorTemporada[temporadaSeleccionada] || []
                    )}
                    plugins={[ChartDataLabels, textOutlinePlugin] as any}
                    width={1200}
                    height={420}
                  />
                </div>
              </IonCol>
            </IonRow>
          )}

          <IonRow>
            <IonCol size="12">
              <div className="productos-actions-container">
                <IonButton
                  className="productos-btn-export"
                  size="small"
                  onClick={exportarExcel}
                >
                  <IonIcon icon={downloadOutline} slot="start" />
                  Exportar Excel
                </IonButton>
                
                <IonButton
                  className={incluirGrafico ? "productos-btn-toggle" : "productos-btn-toggle outline"}
                  size="small"
                  fill={incluirGrafico ? "solid" : "outline"}
                  onClick={() => setIncluirGrafico((prev) => !prev)}
                >
                  {incluirGrafico
                    ? "Quitar gráfico del PDF"
                    : "Incluir gráfico en PDF"}
                </IonButton>
                
                <IonButton
                  className="productos-btn-pdf"
                  size="small"
                  onClick={exportarPDF}
                >
                  <IonIcon icon={documentText} slot="start" />
                  PDF
                </IonButton>
                
                <IonButton
                  className="productos-btn-back"
                  size="small"
                  fill="clear"
                  onClick={() => history.push("/reportes")}
                >
                  Volver
                </IonButton>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonToast
          isOpen={showToast.open}
          onDidDismiss={() => setShowToast({ open: false, message: "" })}
          message={showToast.message}
          duration={1800}
          cssClass="productos-toast-success"
          icon={checkmarkCircle}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default ProductosMasPedidos;
