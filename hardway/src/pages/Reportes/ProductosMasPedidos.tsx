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
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./ProductosMasPedidos.table.css";
import "./ProductosMasPedidos.css";
import { checkmarkCircle, trendingUp, trendingDown, analytics } from "ionicons/icons";

// Registrar componentes y plugins para gráfico de líneas
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

// Plugin personalizado para agregar fondo degradado al gráfico
const backgroundGradientPlugin = {
  id: 'backgroundGradient',
  beforeDraw: (chart: any) => {
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    
    if (!ctx || !chartArea) return;
    
    // Crear gradiente de fondo
    const gradient = ctx.createLinearGradient(0, 0, chart.width, chart.height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2d2d2d');
    
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};

// Registrar el plugin personalizado
Chart.register(backgroundGradientPlugin);

// Nueva interfaz para tendencias estratégicas por categoría
interface TendenciaCategoria {
  categoria: string;
  anio: number;
  mes: number;
  periodo: string;
  total_vendido: number;
  total_pedidos: number;
  productos_diferentes: number;
  precio_promedio: number;
  valor_total: number;
  participacion_mes: number;
  ranking_mes: number;
  tendencia_porcentual: number;
  direccion_tendencia: 'NUEVO' | 'CRECIMIENTO' | 'DECREMENTO' | 'ESTABLE';
}

// Interfaz para datos del gráfico de líneas
interface DatosCategoriaGrafico {
  categoria: string;
  periodos: string[];
  ventas: number[];
  tendencias: number[];
  color: string;
}

// Mantener interfaz original para compatibilidad con endpoint anterior
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
  // Estados para el nuevo reporte estratégico de tendencias
  const [tendenciasCategorias, setTendenciasCategorias] = useState<TendenciaCategoria[]>([]);
  const [datosCategorias, setDatosCategorias] = useState<DatosCategoriaGrafico[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("");
  const [periodoAnalisis, setPeriodoAnalisis] = useState<string>("6"); // últimos 6 meses por defecto
  
  // Estados mantenidos para compatibilidad
  const [incluirGrafico, setIncluirGrafico] = useState(false);
  const chartRef = useRef<any>(null);
  const [graficoListo, setGraficoListo] = useState(false);
  const fechaEmision = new Date().toLocaleString("es-AR");
  const [showToast, setShowToast] = useState({ open: false, message: "" });
  const history = useHistory();

  // Cargar datos de tendencias por categorías
  useEffect(() => {
    const cargarTendencias = async () => {
      try {
        const response = await axiosInstance.get(`/api/reportes/tendencias-categorias?meses=${periodoAnalisis}`);
        const datos: TendenciaCategoria[] = response.data;
        setTendenciasCategorias(datos);
        
        // Procesar datos para el gráfico de líneas
        const categorias = [...new Set(datos.map(d => d.categoria))];
        const periodos = [...new Set(datos.map(d => d.periodo))].sort();
        
        // Colores distintivos para cada categoría (paleta estratégica)
        const coloresCategorias = [
          '#0057ff', // azul corporativo
          '#ff6b35', // naranja vibrante
          '#4ecdc4', // verde agua
          '#45b7d1', // azul claro
          '#f9ca24', // amarillo dorado
          '#6c5ce7', // violeta
          '#a55eea', // púrpura
          '#26de81', // verde lima
          '#fd79a8', // rosa
          '#e17055', // coral
        ];
        
        const datosGrafico = categorias.map((categoria, index) => {
          const datosCat = datos.filter(d => d.categoria === categoria);
          const ventasPorPeriodo = periodos.map(periodo => {
            const dato = datosCat.find(d => d.periodo === periodo);
            return dato ? Number(dato.total_vendido) : 0;
          });
          
          const tendenciasPorPeriodo = periodos.map(periodo => {
            const dato = datosCat.find(d => d.periodo === periodo);
            return dato ? Number(dato.tendencia_porcentual) : 0;
          });

          return {
            categoria,
            periodos: periodos,
            ventas: ventasPorPeriodo,
            tendencias: tendenciasPorPeriodo,
            color: coloresCategorias[index % coloresCategorias.length]
          };
        });
        
        setDatosCategorias(datosGrafico);
        
        // Obtener categorías que realmente tienen ventas en el período
        const categoriasConVentasReales = [...new Set(datos.filter(d => d.total_vendido > 0).map(d => d.categoria))];
        
        // Si no hay categoría seleccionada o la actual no tiene ventas, seleccionar la primera con ventas
        if (!categoriaSeleccionada || !categoriasConVentasReales.includes(categoriaSeleccionada)) {
          if (categoriasConVentasReales.length > 0) {
            setCategoriaSeleccionada(categoriasConVentasReales[0]);
          }
        }
      } catch (error) {
        console.error("Error al cargar tendencias:", error);
        setTendenciasCategorias([]);
        setDatosCategorias([]);
      }
    };
    
    cargarTendencias();
  }, [periodoAnalisis]);

  // Obtener datos únicos para estadísticas - solo categorías con ventas reales
  const categoriasConVentas = tendenciasCategorias.filter(t => t.total_vendido > 0);
  const categoriasUnicas = [...new Set(categoriasConVentas.map(t => t.categoria))];
  const totalCategorias = categoriasUnicas.length;
  const ventasTotales = tendenciasCategorias.reduce((sum, t) => sum + (Number(t.valor_total) || 0), 0);

  // Datos para la tabla de la categoría seleccionada
  const datosCategoriaSeleccionada = tendenciasCategorias
    .filter(t => t.categoria === categoriaSeleccionada)
    .sort((a, b) => {
      if (a.anio !== b.anio) return b.anio - a.anio;
      return b.mes - a.mes;
    });

  // Marcar el gráfico como listo cuando el ref cambie
  useEffect(() => {
    setGraficoListo(false);
    const timeout = setTimeout(() => {
      if (chartRef.current && typeof chartRef.current.toBase64Image === "function") {
        // Forzar actualización del gráfico
        if (chartRef.current.update) {
          chartRef.current.update('active');
        }
        setGraficoListo(true);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [categoriaSeleccionada, datosCategorias.length, periodoAnalisis]);

  // Generar datos del gráfico de líneas para tendencias por categoría
  const getLineChartData = () => {
    if (datosCategorias.length === 0) return { labels: [], datasets: [] };
    
    // Formatear labels para mejor legibilidad
    const formatearPeriodo = (periodo: string) => {
      const [anio, mes] = periodo.split('-');
      const meses = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      return `${meses[parseInt(mes) - 1]} ${anio}`;
    };
    
    const labels = datosCategorias[0]?.periodos.map(formatearPeriodo) || [];
    
    const datasets = datosCategorias.map(categoria => ({
      label: categoria.categoria,
      data: categoria.ventas,
      borderColor: categoria.color,
      backgroundColor: categoria.color + '20',
      borderWidth: 3,
      pointRadius: 8, // Aumentado de 6 a 8
      pointHoverRadius: 10, // Aumentado de 8 a 10
      pointBackgroundColor: categoria.color,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 3, // Aumentado de 2 a 3
      fill: false,
      tension: 0.4,
      spanGaps: false, // No conectar puntos cuando hay gaps
    }));

    return { labels, datasets };
  };

  // Configuración del gráfico de líneas estratégico
  const getLineChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          font: { size: 12, family: "Montserrat, Arial, sans-serif" },
          color: "#ffffff",
          padding: 20,
        },
      },
      title: {
        display: true,
        text: [
          `Tendencias por Categoría`,
          `Análisis de los últimos ${periodoAnalisis} meses`,
        ],
        font: { size: 18, family: "Montserrat, Arial, sans-serif", weight: 'bold' as const },
        color: "#ffffff",
        padding: { top: 10, bottom: 20 },
        align: "center" as const,
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(30, 30, 30, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#0057ff",
        borderWidth: 2,
        titleFont: { weight: 'bold' as const, size: 14 },
        bodyFont: { size: 12 },
        callbacks: {
          afterBody: function (context: any) {
            const dataIndex = context[0].dataIndex;
            const datasetIndex = context[0].datasetIndex;
            const categoria = datosCategorias[datasetIndex];
            const tendencia = categoria.tendencias[dataIndex];
            
            return [
              '',
              `Tendencia: ${tendencia > 0 ? '+' : ''}${tendencia.toFixed(1)}%`,
              `Status: ${tendencia > 5 ? '📈 Crecimiento' : tendencia < -5 ? '📉 Declive' : '➡️ Estable'}`
            ];
          }
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Período",
          font: { size: 14, family: "Poppins, Arial, sans-serif", weight: 'bold' as const },
          color: "#ffffff",
        },
        ticks: { 
          font: { size: 12, weight: 'bold' as const },
          color: "#ffffff",
          maxRotation: 0, // Labels horizontales para mejor legibilidad
          minRotation: 0,
        },
        grid: { 
          color: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(255, 255, 255, 0.3)"
        },
      },
      y: {
        title: {
          display: true,
          text: "Unidades Vendidas",
          font: { size: 14, family: "Poppins, Arial, sans-serif" },
          color: "#ffffff",
        },
        beginAtZero: true,
        grace: '5%', // Agregar 5% de espacio arriba del valor máximo
        ticks: { 
          precision: 0,
          stepSize: undefined, // Permitir que Chart.js calcule automáticamente
          font: { size: 11 },
          color: "#ffffff"
        },
        grid: { 
          color: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(255, 255, 255, 0.3)"
        },
      },
    },
  });

  // Exportar a Excel con gráfico de tendencias por categorías
  const exportarExcel = async () => {
    if (!graficoListo) {
      return;
    }
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Pegasus System";
    workbook.created = new Date();

    // Hoja de Tendencias de Categorías con estilos profesionales
    const wsTendencias = workbook.addWorksheet("Tendencias por Categoría");
    
    // --- LOGO ---
    // Puedes agregar tu logo institucional (PNG base64)
    // Descomenta y reemplaza con tu imagen en base64:
    
    const logoId = workbook.addImage({
      base64: "data:image/png;base64,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",
      extension: "png",
    });
    wsTendencias.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 80, height: 60 },
    });
    
    
    // Ajustar altura de filas para que el logo no tape el título ni la fecha
    wsTendencias.getRow(1).height = 42;
    wsTendencias.getRow(2).height = 28;

    // Fila de título grande y centrado
    wsTendencias.mergeCells("B1:J1");
    wsTendencias.getCell("B1").value = "Reporte Estratégico - Tendencias por Categoría";
    wsTendencias.getCell("B1").font = {
      bold: true,
      size: 18,
      color: { argb: "FF333333" },
    };
    wsTendencias.getCell("B1").alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    wsTendencias.getRow(1).height = 28;

    // Fila de fecha
    wsTendencias.mergeCells("A2:H2");
    wsTendencias.getCell("A2").value = `Fecha de emisión: ${fechaEmision}`;
    wsTendencias.getCell("A2").font = {
      italic: true,
      size: 11,
      color: { argb: "FF666666" },
    };
    wsTendencias.getCell("A2").alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    wsTendencias.getRow(2).height = 20;

    // Definir columnas para tendencias
    wsTendencias.columns = [
      { header: "Categoría", key: "categoria", width: 20 },
      { header: "Periodo", key: "periodo", width: 12 },
      { header: "Ventas", key: "ventas", width: 12, style: { numFmt: "#,##0" } },
      { header: "Pedidos", key: "pedidos", width: 12, style: { numFmt: "#,##0" } },
      { header: "Productos", key: "productos", width: 12, style: { numFmt: "#,##0" } },
      { header: "Precio Prom.", key: "precio", width: 15, style: { numFmt: "$#,##0.00" } },
      { header: "Valor Total", key: "valor", width: 15, style: { numFmt: "$#,##0.00" } },
      { header: "Participación %", key: "participacion", width: 15, style: { numFmt: "0.00%" } },
      { header: "Tendencia %", key: "tendencia", width: 15, style: { numFmt: "0.00%" } },
      { header: "Dirección", key: "direccion", width: 15 },
    ];

    // Forzar la fila de encabezado manualmente
    wsTendencias.getRow(3).values = [
      "Categoría", "Periodo", "Ventas", "Pedidos", "Productos",
      "Precio Prom.", "Valor Total", "Participación %", "Tendencia %", "Dirección"
    ];

    // Exportar datos de tendencias filtrados por categoría seleccionada
    if (categoriaSeleccionada && datosCategoriaSeleccionada.length > 0) {
      datosCategoriaSeleccionada.forEach((t) => {
        wsTendencias.addRow({
          categoria: t.categoria,
          periodo: t.periodo,
          ventas: Number(t.total_vendido),
          pedidos: Number(t.total_pedidos),
          productos: Number(t.productos_diferentes),
          precio: Number(t.precio_promedio),
          valor: Number(t.valor_total),
          participacion: Number(t.participacion_mes) / 100,
          tendencia: Number(t.tendencia_porcentual) / 100,
          direccion: t.direccion_tendencia,
        });
      });
    }

    // Estilos para el encabezado (fila 3)
    wsTendencias.getRow(3).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0057FF" }, // Azul corporativo
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "medium", color: { argb: "FFAAAAAA" } },
        left: { style: "medium", color: { argb: "FFAAAAAA" } },
        bottom: { style: "medium", color: { argb: "FFAAAAAA" } },
        right: { style: "medium", color: { argb: "FFAAAAAA" } },
      };
    });
    wsTendencias.getRow(3).height = 22;

    // Estilos para las filas de datos (desde la fila 4)
    wsTendencias.eachRow((row, rowNumber) => {
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

    // Exportar el gráfico de líneas de tendencias
    let currentRow = wsTendencias.lastRow ? wsTendencias.lastRow.number + 2 : 5;
    if (chartRef.current && typeof chartRef.current.toBase64Image === "function") {
      try {
        const imgBase64 = chartRef.current.toBase64Image();
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
          wsTendencias.addImage(imageId, {
            tl: { col: 0, row: currentRow },
            ext: { width: 1200, height: 600 },
          });
        }
      } catch (e) {
        console.error("Error al exportar gráfico:", e);
      }
    }

    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tendencias_categorias_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setShowToast({ open: true, message: "¡Excel exportado exitosamente!" });
  };

  const exportarPDF = async () => {
    try {
      if (incluirGrafico && !graficoListo) {
        setShowToast({ open: true, message: "Esperando que el gráfico esté listo..." });
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // --- LOGO ---
      // Puedes agregar tu logo institucional (PNG base64)
      // Descomenta y reemplaza con tu imagen en base64:
      
      const logoBase64 = "data:image/png;base64,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";
      //  // Solo la parte después de "data:image/png;base64,"
      doc.addImage(logoBase64, 'PNG', 10, 5, 30, 20); // x, y, ancho, alto
      
      
      // Título principal
      doc.setFontSize(16);
      const title = "Reporte Estratégico - Tendencias por Categoría";
      const textWidth = doc.getTextWidth(title);
      const x = (pageWidth - textWidth) / 2;
      doc.text(title, x, 15);
      
      // Información adicional
      doc.setFontSize(10);
      doc.text(`Fecha de emisión: ${fechaEmision}`, 15, 25);
      doc.text(`Categoría: ${categoriaSeleccionada || 'Todas'}`, 15, 30);
      doc.text(`Período: Últimos ${periodoAnalisis} meses`, 15, 35);

      // Tabla de tendencias de la categoría seleccionada
      let startY = 42;
      if (categoriaSeleccionada && datosCategoriaSeleccionada.length > 0) {
        autoTable(doc, {
          head: [
            ["Periodo", "Ventas", "Pedidos", "Productos", "Precio", "Valor", "Part.%", "Tend.%", "Dir."],
          ],
          body: datosCategoriaSeleccionada.map((t) => [
            t.periodo,
            t.total_vendido,
            t.total_pedidos,
            t.productos_diferentes,
            `$${(Number(t.precio_promedio) || 0).toFixed(2)}`,
            `$${(Number(t.valor_total) || 0).toFixed(0)}`,
            `${(Number(t.participacion_mes) || 0).toFixed(1)}%`,
            `${(Number(t.tendencia_porcentual) || 0) > 0 ? '+' : ''}${(Number(t.tendencia_porcentual) || 0).toFixed(1)}%`,
            t.direccion_tendencia,
          ]),
          startY: startY,
          styles: { fontSize: 7, halign: "center", cellPadding: 2 },
          headStyles: { fillColor: [0, 87, 255], halign: "center", fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 15 },
            2: { cellWidth: 15 },
            3: { cellWidth: 18 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 },
            6: { cellWidth: 15 },
            7: { cellWidth: 15 },
            8: { cellWidth: 22 },
          },
        });
        startY = (doc as any).lastAutoTable.finalY + 10 || startY + 60;
      }

      // Gráfico de líneas de tendencias
      if (incluirGrafico && chartRef.current && typeof chartRef.current.toBase64Image === "function") {
        try {
          const imgData = chartRef.current.toBase64Image();
          if (imgData && imgData.startsWith("data:image/png;base64,")) {
            // Verificar si hay espacio en la página actual
            if (startY + 90 > 280) {
              doc.addPage();
              startY = 20;
            }
            
            doc.setFontSize(11);
            doc.text(`Gráfico de Tendencias - Últimos ${periodoAnalisis} meses`, 15, startY);
            doc.addImage(imgData, "PNG", 10, startY + 5, 190, 85);
          }
        } catch (e) {
          console.error("Error al exportar gráfico:", e);
          setShowToast({ open: true, message: "Error al incluir el gráfico en el PDF" });
        }
      }

      // Guardar el PDF
      const fileName = `Tendencias_Categorias_${categoriaSeleccionada || 'Todas'}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
      setShowToast({ open: true, message: "¡PDF exportado exitosamente!" });
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      setShowToast({ open: true, message: "Error al exportar PDF. Intenta nuevamente." });
    }
  };

  return (
    <IonPage className="productos-pedidos-page">
      <IonHeader>
        <IonToolbar className="productos-pedidos-toolbar">
          <IonTitle>📈 Reporte Estratégico - Tendencias por Categoría</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="productos-pedidos-content">
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <div className="productos-title-section">
                <h1 className="productos-main-title">
                  Análisis de Tendencias por Categoría
                </h1>
                <div className="productos-emission-date">
                  Fecha de emisión: {fechaEmision}
                </div>
                
                <div className="productos-stats-row">
                  <div className="productos-stat-card">
                    <div className="productos-stat-icon">💰</div>
                    <div className="productos-stat-content">
                      <div className="productos-stat-number">${ventasTotales.toLocaleString()}</div>
                      <div className="productos-stat-label">Ventas Totales</div>
                    </div>
                  </div>
                  
                  <div className="productos-stat-card">
                    <div className="productos-stat-icon">🏷️</div>
                    <div className="productos-stat-content">
                      <div className="productos-stat-number">{totalCategorias}</div>
                      <div className="productos-stat-label">Categorías Activas</div>
                    </div>
                  </div>
                  
                  <div className="productos-stat-card">
                    <div className="productos-stat-icon">📅</div>
                    <div className="productos-stat-content">
                      <div className="productos-stat-number">{periodoAnalisis}</div>
                      <div className="productos-stat-label">Meses Analizados</div>
                    </div>
                  </div>
                </div>

                <div className="productos-filter-section">
                  <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                    <div>
                      <label htmlFor="categoria-select" className="productos-filter-label">
                        Categoría:
                      </label>
                      <select
                        id="categoria-select"
                        value={categoriaSeleccionada}
                        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                        className="productos-select"
                        disabled={categoriasUnicas.length === 0}
                      >
                        {categoriasUnicas.length === 0 ? (
                          <option value="">No hay categorías con ventas en este período</option>
                        ) : (
                          categoriasUnicas.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="periodo-select" className="productos-filter-label">
                        Período:
                      </label>
                      <select
                        id="periodo-select"
                        value={periodoAnalisis}
                        onChange={(e) => setPeriodoAnalisis(e.target.value)}
                        className="productos-select"
                      >
                        <option value="3">Últimos 3 meses</option>
                        <option value="6">Últimos 6 meses</option>
                        <option value="12">Últimos 12 meses</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </IonCol>
          </IonRow>

          {categoriasUnicas.length === 0 && (
            <IonRow>
              <IonCol size="12">
                <IonCard style={{ textAlign: 'center', padding: '40px' }}>
                  <IonCardContent>
                    <h3 style={{ color: '#666', marginBottom: '20px' }}>
                      📊 No hay datos de ventas para el período seleccionado
                    </h3>
                    <p style={{ color: '#888' }}>
                      Intenta seleccionar un período más amplio o verifica que existan pedidos en las fechas especificadas.
                    </p>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}

          {categoriaSeleccionada && datosCategoriaSeleccionada.length > 0 && categoriasUnicas.length > 0 && (
            <IonRow>
              <IonCol size="12">
                <IonCard className="productos-table-card">
                  <IonCardContent>
                    <h3 style={{color: '#0057ff', marginBottom: '20px', textAlign: 'center'}}>
                      Detalle de Tendencias - {categoriaSeleccionada}
                    </h3>
                    <IonGrid className="productos-table-grid">
                      <IonRow className="productos-table-header">
                        <IonCol size="1.5" className="productos-table-cell">Periodo</IonCol>
                        <IonCol size="1" className="productos-table-cell">Ventas</IonCol>
                        <IonCol size="1" className="productos-table-cell">Pedidos</IonCol>
                        <IonCol size="1" className="productos-table-cell">Productos</IonCol>
                        <IonCol size="1.5" className="productos-table-cell">Precio Prom.</IonCol>
                        <IonCol size="1.5" className="productos-table-cell">Valor Total</IonCol>
                        <IonCol size="1" className="productos-table-cell">Part. %</IonCol>
                        <IonCol size="1" className="productos-table-cell">Tend. %</IonCol>
                        <IonCol size="1.5" className="productos-table-cell">Dirección</IonCol>
                      </IonRow>
                      
                      {datosCategoriaSeleccionada.map((t, idx) => (
                        <IonRow
                          className={`productos-table-row ${t.ranking_mes <= 3 ? 'top-ranking' : ''}`}
                          key={`${t.categoria}-${t.periodo}-${idx}`}
                        >
                          <IonCol size="1.5" className="productos-table-cell">
                            {t.periodo}
                          </IonCol>
                          <IonCol size="1" className="productos-table-cell productos-quantity-high">
                            {t.total_vendido.toLocaleString()}
                          </IonCol>
                          <IonCol size="1" className="productos-table-cell">
                            {t.total_pedidos}
                          </IonCol>
                          <IonCol size="1" className="productos-table-cell">
                            {t.productos_diferentes}
                          </IonCol>
                          <IonCol size="1.5" className="productos-table-cell">
                            ${(Number(t.precio_promedio) || 0).toFixed(2)}
                          </IonCol>
                          <IonCol size="1.5" className="productos-table-cell">
                            ${(Number(t.valor_total) || 0).toLocaleString()}
                          </IonCol>
                          <IonCol size="1" className="productos-table-cell">
                            {(Number(t.participacion_mes) || 0).toFixed(1)}%
                          </IonCol>
                          <IonCol size="1" className="productos-table-cell">
                            <span style={{
                              color: (Number(t.tendencia_porcentual) || 0) > 5 ? '#26de81' : 
                                     (Number(t.tendencia_porcentual) || 0) < -5 ? '#ff6b35' : '#f9ca24'
                            }}>
                              {(Number(t.tendencia_porcentual) || 0) > 0 ? '+' : ''}{(Number(t.tendencia_porcentual) || 0).toFixed(1)}%
                            </span>
                          </IonCol>
                          <IonCol size="1.5" className="productos-table-cell">
                            <span style={{
                              color: t.direccion_tendencia === 'CRECIMIENTO' ? '#26de81' : 
                                     t.direccion_tendencia === 'DECREMENTO' ? '#ff6b35' : '#6c5ce7',
                              fontWeight: 'bold'
                            }}>
                              {t.direccion_tendencia === 'CRECIMIENTO' && '📈 '}
                              {t.direccion_tendencia === 'DECREMENTO' && '📉 '}
                              {t.direccion_tendencia === 'ESTABLE' && '➡️ '}
                              {t.direccion_tendencia === 'NUEVO' && '🆕 '}
                              {t.direccion_tendencia}
                            </span>
                          </IonCol>
                        </IonRow>
                      ))}
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}

          {datosCategorias.length > 0 && categoriasUnicas.length > 0 && (
            <IonRow>
              <IonCol size="12">
                <div className="productos-chart-container">
                  <Line
                    key={`chart-${periodoAnalisis}-${datosCategorias.length}`}
                    ref={chartRef}
                    data={getLineChartData()}
                    options={getLineChartOptions()}
                    plugins={[]}
                    width={1200}
                    height={500}
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
                  disabled={!graficoListo}
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
                  <IonIcon icon={incluirGrafico ? analytics : trendingUp} slot="start" />
                  {incluirGrafico
                    ? "Quitar gráfico del PDF"
                    : "Incluir gráfico en PDF"}
                </IonButton>
                
                <IonButton
                  className="productos-btn-pdf"
                  size="small"
                  onClick={exportarPDF}
                  disabled={incluirGrafico && !graficoListo}
                >
                  <IonIcon icon={documentText} slot="start" />
                  Exportar PDF
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
