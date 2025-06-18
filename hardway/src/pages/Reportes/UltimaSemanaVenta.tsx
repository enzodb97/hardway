import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from "@ionic/react";
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
import { obtenerVentasUltimos7Dias, VentaDia } from "../../utils/reportesUtils";
import "./Reportes.css";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

const UltimaSemanaVenta: React.FC = () => {
  const [datos, setDatos] = useState<VentaDia[]>([]);

  useEffect(() => {
    obtenerVentasUltimos7Dias().then(setDatos);
  }, []);

  const chartData = {
    labels: datos.map((d) => d.dia),
    datasets: [
      {
        label: "Total vendido ($)",
        data: datos.map((d) => d.total_ventas_del_dia),
        fill: true,
        backgroundColor: "rgba(0, 84, 233, 0.15)",
        borderColor: "#0054e9",
        pointBackgroundColor: "#0054e9",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` $${ctx.parsed.y.toLocaleString("es-AR")}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Día" },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Total Vendido ($)" },
        beginAtZero: true,
        grid: { color: "#eee" },
      },
    },
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="warning">
          <IonTitle>Ventas - Últimos 7 días</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2 className="reporte-titulo">Total vendido por día</h2>
        <div className="reporte-grafico-container">
          <Line data={chartData} options={chartOptions} height={320} />
        </div>
        <IonButton routerLink="/reportes" color="medium">
          Volver
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default UltimaSemanaVenta;
