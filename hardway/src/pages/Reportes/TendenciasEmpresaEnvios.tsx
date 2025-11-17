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
  const [incluirGrafico, setIncluirGrafico] = useState(true);
  const [chartRef, setChartRef] = useState<any>(null);
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

  // Función para capturar el gráfico como imagen
  const capturarGrafico = async (): Promise<string | null> => {
    if (!chartRef || !incluirGrafico) return null;
    
    try {
      // Capturar el canvas del gráfico con background
      const canvas = chartRef.canvas;
      const ctx = canvas.getContext('2d');
      
      // Crear un nuevo canvas con background
      const newCanvas = document.createElement('canvas');
      const newCtx = newCanvas.getContext('2d');
      newCanvas.width = canvas.width;
      newCanvas.height = canvas.height;
      
      // Establecer el background color del gráfico (mismo gradiente que el contenedor)
      const gradient = newCtx!.createLinearGradient(0, 0, newCanvas.width, newCanvas.height);
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(1, '#334155');
      newCtx!.fillStyle = gradient;
      newCtx!.fillRect(0, 0, newCanvas.width, newCanvas.height);
      
      // Dibujar el gráfico encima del background
      newCtx!.drawImage(canvas, 0, 0);
      
      // Convertir a base64
      return newCanvas.toDataURL('image/png');
    } catch (error) {
      console.warn('Error al capturar gráfico:', error);
      return null;
    }
  };

  // --- Exportar Excel ---
  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Tendencias Empresas de Envío");

    // --- LOGO ---
    // Opción 1: Logo desde base64 (reemplaza el string vacío con tu imagen en base64)
    const logoBase64: string = "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";
    // // Aquí va tu imagen en base64 (debe ser un string muy largo que empiece con "iVBORw0KGgoAAAANSUhEUgAA..." para PNG)
    
    if (logoBase64 && logoBase64.length > 100) {
      // Si tienes logo, agregarlo
      try {
        const logoId = workbook.addImage({
          base64: logoBase64,
          extension: 'png', // o 'jpeg' según tu imagen
        });
        sheet.addImage(logoId, {
          tl: { col: 0, row: 0 }, // Top-left: columna 0, fila 0
          ext: { width: 80, height: 60 }, // Ancho y alto en pixeles
        });
        
        // Ajustar altura de las primeras filas para dar espacio al logo
        sheet.getRow(1).height = 45;
        sheet.getRow(2).height = 25;
        sheet.getRow(3).height = 20;
        
        // Logo y título (movidos para dar espacio al logo)
        sheet.mergeCells("B1:F1");
        sheet.getCell("B1").value = "Tendencias de Empresas de Envío";
        sheet.getCell("B1").font = { bold: true, size: 18, color: { argb: "FF222222" } };
        sheet.getCell("B1").alignment = { horizontal: "center", vertical: "middle" };
      } catch (error) {
        console.warn("Error al agregar logo, continuando sin logo:", error);
        // Si falla el logo, continuar con el diseño normal
        sheet.mergeCells("B1:E1");
        sheet.getCell("B1").value = "Tendencias de Empresas de Envío";
        sheet.getCell("B1").font = { bold: true, size: 16, color: { argb: "FF222222" } };
        sheet.getCell("B1").alignment = { horizontal: "center", vertical: "middle" };
        sheet.getRow(1).height = 28;
      }
    } else {
      // Opción 2: Sin logo (diseño actual)
      sheet.mergeCells("B1:E1");
      sheet.getCell("B1").value = "Tendencias de Empresas de Envío";
      sheet.getCell("B1").font = { bold: true, size: 16, color: { argb: "FF222222" } };
      sheet.getCell("B1").alignment = { horizontal: "center", vertical: "middle" };
      sheet.getRow(1).height = 28;
    }

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

    // Agregar gráfico si está habilitado
    if (incluirGrafico) {
      try {
        const graficoBase64 = await capturarGrafico();
        if (graficoBase64) {
          // Remover el prefijo data:image/png;base64,
          const imageBase64 = graficoBase64.split(',')[1];
          const graficoId = workbook.addImage({
            base64: imageBase64,
            extension: 'png',
          });
          
          // Calcular posición después de la tabla
          const finalRow = data.length + 5; // Headers + data + espacio
          sheet.addImage(graficoId, {
            tl: { col: 0, row: finalRow },
            ext: { width: 600, height: 400 },
          });
          
          // Agregar título del gráfico
          sheet.mergeCells(`A${finalRow}:F${finalRow}`);
          sheet.getCell(`A${finalRow}`).value = `Gráfico de Tendencias (${filtroMeses} meses)`;
          sheet.getCell(`A${finalRow}`).font = { bold: true, size: 14, color: { argb: "FF222222" } };
          sheet.getCell(`A${finalRow}`).alignment = { horizontal: "center", vertical: "middle" };
        }
      } catch (error) {
        console.warn('Error al agregar gráfico a Excel:', error);
      }
    }

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
  const exportarPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = "Tendencias de Empresas de Envío";
    const textWidth = doc.getTextWidth(title);
    const x = (pageWidth - textWidth) / 2;

    // --- LOGO ---
    // Opción 1: Logo desde base64 (debe coincidir con el del Excel)
    const logoBase64: string = "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";
    //  // Aquí va tu imagen en base64 (el mismo que usas en Excel)
    
    let startY = 18; // Posición inicial del título
    
    if (logoBase64 && logoBase64.length > 100) {
      try {
        // Agregar logo al PDF (esquina superior izquierda)
        doc.addImage(logoBase64, 'PNG', 10, 10, 30, 20); // x, y, ancho, alto
        startY = 35; // Mover el título más abajo para dar espacio al logo
      } catch (error) {
        console.warn("Error al agregar logo al PDF, continuando sin logo:", error);
        startY = 18; // Mantener posición original si falla
      }
    }

    // Título y información
    doc.text(title, x, startY);
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${fechaEmision}`, x, startY + 7);
    doc.text(`Período: Últimos ${filtroMeses} meses`, x, startY + 12);

    const tableResult = autoTable(doc, {
      head: [["Mes", "Empresa de Envío", "Total Pedidos", "Mes Anterior", "Diferencia", "% Crecimiento"]],
      body: data.map((row) => [
        row.Mes, 
        row.EmpresaEnvio, 
        row.TotalPedidos,
        row.PedidosMesAnterior,
        row.Diferencia,
        row.PorcentajeCrecimiento ? `${row.PorcentajeCrecimiento}%` : "N/A"
      ]),
      startY: startY + 17, // Usar la posición dinámica basada en si hay logo o no
      styles: { fontSize: 10, halign: "center" },
      headStyles: { fillColor: [79, 70, 229], halign: "center" },
      didDrawPage: (data) => {
        // Guardar la posición final de la tabla para el gráfico
      }
    });

    // Agregar gráfico si está habilitado
    if (incluirGrafico) {
      try {
        const graficoBase64 = await capturarGrafico();
        if (graficoBase64) {
          // Calcular posición después de la tabla
          const finalY = (doc as any).lastAutoTable?.finalY || startY + 17;
          const yPos = finalY + 20;
          
          // Si no hay espacio, agregar nueva página
          if (yPos > 250) {
            doc.addPage();
            doc.addImage(graficoBase64, 'PNG', 15, 20, 180, 120);
          } else {
            doc.addImage(graficoBase64, 'PNG', 15, yPos, 180, 120);
          }
          
          // Título del gráfico
          const titleY = yPos > 250 ? 15 : yPos - 5;
          const titleX = (doc.internal.pageSize.getWidth() - doc.getTextWidth(`Gráfico de Tendencias (${filtroMeses} meses)`)) / 2;
          doc.text(`Gráfico de Tendencias (${filtroMeses} meses)`, titleX, titleY);
        }
      } catch (error) {
        console.warn('Error al agregar gráfico al PDF:', error);
      }
    }

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
                  <Line 
                    ref={(ref: any) => {
                      if (ref) {
                        setChartRef(ref);
                      }
                    }}
                    data={chartData} 
                    options={chartOptions} 
                  />
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
                  className={incluirGrafico ? "tendencias-btn-grafico-activo" : "tendencias-btn-grafico-inactivo"}
                  size="small"
                  onClick={() => setIncluirGrafico(!incluirGrafico)}
                >
                  <IonIcon icon={trendingUp} slot="start" /> 
                  {incluirGrafico ? "QUITAR GRÁFICO EN EXPORTACIÓN" : "INCLUIR GRÁFICO EN EXPORTACIÓN"}
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