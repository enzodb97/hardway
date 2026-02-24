import ExcelJS from "exceljs";
import { downloadOutline, checkmarkCircle, arrowBackOutline, barChartOutline, documentTextOutline } from "ionicons/icons";
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
import { formatFechaHoraCompleta } from "../../utils/dateFormatters";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./ProductosMasPedidos.table.css";
import "./ClientesMasPedidos.css";

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

interface ClienteReporte {
  idCliente: number;
  nombre: string;
  apellido: string;
  email: string;
  total_pedidos: number;
  total_valor: number; // Nuevo campo para el valor total de los pedidos
}

const PAGE_SIZE = 5;

// Array de colores para las barras
const colores = [
  "#FF6384", // rojo
  "#36A2EB", // azul
  "#FFCE56", // amarillo
  "#4BC0C0", // verde agua
  "#9966FF", // violeta
  "#FF9F40", // naranja
  "#B2FF66", // verde claro
  "#FF66B2", // rosa
  "#66FFB2", // turquesa
  "#B266FF", // lila
];

const ClientesMasPedidos: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteReporte[]>([]);
  const [pagina, setPagina] = useState(1);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [incluirGrafico, setIncluirGrafico] = useState(false);
  const chartRef = useRef<any>(null);
  const history = useHistory();

  const [showToast, setShowToast] = useState({ open: false, message: "" });

  useEffect(() => {
    axiosInstance
      .get("/api/reportes/clientes-mas-pedidos?incluirCancelados=false")
      .then((res) => setClientes(res.data))
      .catch((error) => {
        console.error("Error al cargar clientes con más pedidos:", error);
        setClientes([]);
      });
  }, []);

  // Exportar a Excel con gráfico de barras de clientes de alto valor
  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Pegasus System";
    workbook.created = new Date();

    // Hoja de Clientes con columnas y estilos profesionales
    const wsClientes = workbook.addWorksheet("Clientes de Alto Valor");

    // --- LOGO ---
    const logoId = workbook.addImage({
      base64:
        "data:image/png;base64,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",
      extension: "png",
    });
    wsClientes.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 80, height: 60 },
    });
    wsClientes.getRow(1).height = 42;
    wsClientes.getRow(2).height = 28;
    // --- FIN LOGO ---

    // Título grande y centrado
    wsClientes.mergeCells("A1:E1");
    wsClientes.getCell("A1").value =
      "Top 10 Clientes por Valor Total de Pedidos";
    wsClientes.getCell("A1").font = {
      bold: true,
      size: 18,
      color: { argb: "FF333333" },
    };
    wsClientes.getCell("A1").alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    wsClientes.getRow(1).height = 28;

    // Fila de fecha
    wsClientes.mergeCells("A2:E2");
    wsClientes.getCell("A2").value = `Fecha de emisión: ${fechaEmision}`;
    wsClientes.getCell("A2").font = {
      italic: true,
      size: 11,
      color: { argb: "FF666666" },
    };
    wsClientes.getCell("A2").alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    wsClientes.getRow(2).height = 20;

    // Definir columnas
    wsClientes.columns = [
      { header: "N° Cliente", key: "idCliente", width: 12 },
      { header: "Nombre y Apellido", key: "nombreApellido", width: 28 },
      { header: "Email", key: "email", width: 28 },
      {
        header: "Total Pedidos",
        key: "totalPedidos",
        width: 16,
        style: { numFmt: "0" },
      },
      {
        header: "TOP 10 Clientes por Valor Total de Pedidos",
        key: "valorTotal",
        width: 18,
        style: { numFmt: "[$$-es-AR] #,##0.00" }, // Formato moneda ARS
      },
    ];
    wsClientes.getRow(3).values = [
      "N° Cliente",
      "Nombre y Apellido",
      "Email",
      "Total Pedidos",
      "Valor Total ($)",
    ];

    // Agregar filas de datos
    (top10Clientes || []).forEach((c: ClienteReporte) => {
      wsClientes.addRow({
        idCliente: c.idCliente,
        nombreApellido: `${c.nombre} ${c.apellido}`,
        email: c.email || "",
        totalPedidos: c.total_pedidos,
        valorTotal:
          typeof c.total_valor === "number"
            ? c.total_valor
            : Number(String(c.total_valor).replace(",", ".")),
      });
    });

    // Estilos para el encabezado (fila 3)
    wsClientes.getRow(3).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0057ff" }, // Azul profesional
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "medium", color: { argb: "FFAAAAAA" } },
        left: { style: "medium", color: { argb: "FFAAAAAA" } },
        bottom: { style: "medium", color: { argb: "FFAAAAAA" } },
        right: { style: "medium", color: { argb: "FFAAAAAA" } },
      };
    });
    wsClientes.getRow(3).height = 22;

    // Estilos para las filas de datos (desde la fila 4)
    wsClientes.eachRow((row, rowNumber) => {
      if (rowNumber <= 3) return;
      row.height = 20;
      row.eachCell((cell, colNumber) => {
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

    // Exportar gráfico como imagen (si existe)
    if (chartRef.current) {
      let chartInstance = chartRef.current.chartInstance || chartRef.current;
      if (chartInstance && chartInstance.toBase64Image) {
        const imgBase64 = chartInstance.toBase64Image();
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
        wsClientes.addImage(imageId, {
          tl: { col: 0, row: top10Clientes.length + 3 },
          ext: { width: 1000, height: 600 },
        });
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
    a.download = `clientes_mas_pedidos_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setShowToast({ open: true, message: "¡Excel exportado exitosamente!" });
  };

  // Ordenar por valor total de pedidos descendente
  const clientesOrdenados = [...clientes].sort(
    (a, b) => b.total_valor - a.total_valor
  );
  
  // Solo tomar los top 10 para el reporte
  const top10Clientes = clientesOrdenados.slice(0, 10);
  
  const clientesAMostrar = mostrarTodos
    ? top10Clientes
    : top10Clientes.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  const totalPaginas = mostrarTodos
    ? 1
    : Math.ceil(top10Clientes.length / PAGE_SIZE);

  const fechaEmision = formatFechaHoraCompleta();

  // Calcular estadísticas (solo top 10)
  const totalClientes = top10Clientes.length;
  const valorTotalAcumulado = top10Clientes.reduce((sum, c) => {
    // Asegurar que el valor sea un número
    const valor = typeof c.total_valor === 'number' ? c.total_valor : parseFloat(c.total_valor) || 0;
    return sum + valor;
  }, 0);

  // Exportar PDF con opción de incluir gráfico
  const exportarPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = "Clientes de Alto Valor";
    const textWidth = doc.getTextWidth(title);
    const x = (pageWidth - textWidth) / 2;

    // Logo en base64 (puedes usar tu propio logo)
    const logoBase64 =
      "data:image/png;base64,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";

    // Logo (x, y, width, height)

    doc.addImage(logoBase64, "PNG", 10, 8, 15, 15);
    doc.text(title, x, 18);
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${fechaEmision}`, x, 25);

    // 1. Generar la tabla primero
    autoTable(doc, {
      head: [["N° Cliente", "Nombre y Apellido", "Email", "Total Pedidos", "Valor Total ($)"]],
      body: top10Clientes.map((c) => [
        c.idCliente,
        `${c.nombre} ${c.apellido}`,
        c.email || "",
        c.total_pedidos,
        `$${c.total_valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ]),
      startY: 32,
      styles: { 
        fontSize: 10,
        halign: 'center' // Centrar contenido de todas las celdas
      },
      headStyles: { 
        fillColor: [254, 175, 0],
        halign: 'center' // Centrar títulos de columnas
      },
    });

    // 2. Luego, si corresponde, agregar el gráfico debajo de la tabla
    if (incluirGrafico && chartRef.current) {
      const chart = chartRef.current;
      const chartInstance = chart.chartInstance || chart;
      const imgData = chartInstance.toBase64Image();
      // Calcula la posición Y debajo de la tabla
      const finalY = (doc as any).lastAutoTable.finalY || 32;
      doc.addImage(imgData, "SVG", 15, finalY + 10, 180, 50);
    }

    doc.save("Clientes_mas_pedidos.pdf");
    setShowToast({ open: true, message: "¡PDF exportado exitosamente!" });
  };

  // Prepara los datos para el gráfico (por valor total)
  const data = {
    labels: top10Clientes.map((c) => `${c.nombre} ${c.apellido}`),
    datasets: [
      {
        label: "Valor Total de Pedidos ($)",
        data: top10Clientes.map((c) => c.total_valor),
        backgroundColor: colores.slice(0, top10Clientes.length),
        borderRadius: 8,
        maxBarThickness: 32,
      },
    ],
  };
  const maxValor = Math.max(...top10Clientes.map((c) => c.total_valor), 0);

  const chartOptions = {
    indexAxis: "y" as const, // Barras horizontales
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Top 10 Clientes por Valor Total de Pedidos",
        font: { size: 18 },
        padding: { top: 10, bottom: 20 },
        color: '#ffffff', // Texto blanco
      },
      datalabels: {
        anchor: "end" as const,
        align: "end" as const,
        color: "#ffffff", // Cambio a blanco para mejor visibilidad
        font: { 
          weight: "bold" as const,
          size: 12,
        },
        offset: 16,
        formatter: (value: number) => `$${value.toLocaleString()}`,
        clamp: true,
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const idx = context.dataIndex;
            const c = top10Clientes[idx];
            return [
              `Valor total: $${c.total_valor.toLocaleString()}`,
              `Total pedidos: ${c.total_pedidos}`,
              `Email: ${c.email || "-"}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Valor Total de Pedidos ($)",
          font: { size: 14 },
          color: '#ffffff', // Texto blanco
        },
        beginAtZero: true,
        ticks: { 
          precision: 0,
          color: '#ffffff', // Números en blanco
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)', // Grid sutil
        },
      },
      y: {
        title: {
          display: true,
          text: "Cliente",
          font: { size: 14 },
          color: '#ffffff', // Texto blanco
        },
        ticks: {
          color: '#ffffff', // Nombres en blanco
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)', // Grid sutil
        },
      },
    },
  };

  return (
    <IonPage className="clientes-alto-valor-page">
      <IonHeader>
        <IonToolbar className="clientes-alto-valor-toolbar">
          <IonTitle>👑 Clientes de Alto Valor</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="clientes-alto-valor-content">
        <IonGrid>
          {/* Título y Estadísticas */}
          <IonRow>
            <IonCol size="12">
              <div className="clientes-title-section">
                <h1 className="clientes-main-title">Top 10 Clientes de Alto Valor</h1>
                <div className="clientes-emission-date">
                  Fecha de emisión: {fechaEmision}
                </div>
                
                <div className="clientes-stats-row">
                  <div className="clientes-stat-card">
                    <div className="clientes-stat-icon">👥</div>
                    <div className="clientes-stat-content">
                      <div className="clientes-stat-number">{totalClientes}</div>
                      <div className="clientes-stat-label">Total Clientes</div>
                    </div>
                  </div>
                  
                  <div className="clientes-stat-card">
                    <div className="clientes-stat-icon">💰</div>
                    <div className="clientes-stat-content">
                      <div className="clientes-stat-number">${valorTotalAcumulado.toLocaleString()}</div>
                      <div className="clientes-stat-label">Valor Acumulado</div>
                    </div>
                  </div>
                </div>
              </div>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonCard className="clientes-table-card">
                <IonCardContent>
                  <IonGrid className="clientes-table-grid">
                    {/* Header */}
                    <IonRow className="clientes-table-header">
                      <IonCol size="2" className="clientes-table-cell">N° Cliente</IonCol>
                      <IonCol size="3" className="clientes-table-cell">Nombre y Apellido</IonCol>
                      <IonCol size="3" className="clientes-table-cell">Email</IonCol>
                      <IonCol size="2" className="clientes-table-cell">Total Pedidos</IonCol>
                      <IonCol size="2" className="clientes-table-cell">Valor Total ($)</IonCol>
                    </IonRow>
                    
                    {/* Datos */}
                    {clientesAMostrar.map((c, idx) => {
                      const ranking = (pagina - 1) * 10 + idx + 1;
                      const isTopClient = ranking <= 3;
                      return (
                        <IonRow key={c.idCliente} className={`clientes-table-row ${isTopClient ? 'top-client' : ''}`}>
                          <IonCol size="2" className="clientes-table-cell">
                            {c.idCliente}
                            {isTopClient && <span className="clientes-vip-badge">⭐</span>}
                          </IonCol>
                          <IonCol size="3" className="clientes-table-cell">
                            {`${c.nombre} ${c.apellido}`}
                          </IonCol>
                          <IonCol size="3" className="clientes-table-cell">
                            {c.email || "Sin email"}
                          </IonCol>
                          <IonCol size="2" className="clientes-table-cell" style={{ textAlign: "right" }}>
                            {c.total_pedidos}
                          </IonCol>
                          <IonCol size="2" className="clientes-table-cell clientes-valor-alto" style={{ textAlign: "right" }}>
                            ${c.total_valor.toLocaleString()}
                          </IonCol>
                        </IonRow>
                      );
                    })}
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
          {/* Paginación y Acciones */}
          <IonRow>
            <IonCol size="12">
              <div className="clientes-pagination-container">
                <IonButton
                  className="clientes-btn-pagination"
                  size="small"
                  disabled={pagina === 1 || mostrarTodos}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </IonButton>
                <span className="clientes-pagination-info">
                  Página {pagina} de {totalPaginas}
                </span>
                <IonButton
                  className="clientes-btn-pagination"
                  size="small"
                  disabled={pagina === totalPaginas || mostrarTodos}
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                >
                  Siguiente
                </IonButton>
                <IonButton
                  className="clientes-btn-toggle"
                  size="small"
                  fill="clear"
                  onClick={() => {
                    setMostrarTodos((prev) => !prev);
                    setPagina(1);
                  }}
                >
                  {mostrarTodos ? "Ver paginado" : "Ver todos"}
                </IonButton>
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <div className="clientes-actions-container">
                <IonButton
                  className="clientes-btn-export"
                  size="small"
                  onClick={exportarExcel}
                >
                  <IonIcon icon={downloadOutline} slot="start" />
                  Exportar a Excel
                </IonButton>
                <IonButton
                  className={`clientes-btn-chart ${incluirGrafico ? 'active' : ''}`}
                  size="small"
                  fill={incluirGrafico ? "solid" : "outline"}
                  onClick={() => setIncluirGrafico((prev) => !prev)}
                >
                  {incluirGrafico
                    ? "Quitar gráfico del PDF"
                    : "Incluir gráfico en PDF"}
                </IonButton>
                <IonButton
                  className="clientes-btn-pdf"
                  size="small"
                  onClick={exportarPDF}
                >
                  <IonIcon icon={documentText} slot="start" />
                  PDF
                </IonButton>
              </div>
            </IonCol>
          </IonRow>
          {/* Gráfico de barras */}
          <IonRow>
            <IonCol size="12">
              <div className="clientes-chart-container">
                <Bar
                  ref={chartRef}
                  data={data}
                  options={chartOptions}
                  plugins={[ChartDataLabels]}
                  width={1200}
                  height={420}
                />
              </div>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12" className="ion-text-left">
              <IonButton className="clientes-btn-back" onClick={() => history.goBack()} fill="clear">
                <IonIcon icon={arrowBackOutline} slot="start" />
                Volver
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonToast
          isOpen={showToast.open}
          onDidDismiss={() => setShowToast({ open: false, message: "" })}
          message={showToast.message}
          duration={1800}
          cssClass="clientes-toast-success"
          icon={checkmarkCircle}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default ClientesMasPedidos;
