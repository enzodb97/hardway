import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import React, { useEffect, useState } from "react";
import {
  obtenerProductosMasPedidos,
  ProductoMasPedido,
} from "../utils/estadisticasUtils";

// Registrar los componentes de Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoBarras: React.FC = () => {
  const [datos, setDatos] = useState<ProductoMasPedido[]>([]);

  useEffect(() => {
    obtenerProductosMasPedidos().then(setDatos);
  }, []);

  const data = {
    labels: datos.map((p) => p.nombreProducto),
    datasets: [
      {
        label: "Cantidad Pedida",
        data: datos.map((p) => p.totalPedidos),
        backgroundColor: "rgba(254, 175, 0, 0.7)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Productos más pedidos" },
    },
  };

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 16 }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default GraficoBarras;
