import axios from "axios";

export interface VentaDia {
  dia: string; // formato YYYY-MM-DD
  total_ventas_del_dia: number;
}

export const obtenerVentasUltimos7Dias = async (): Promise<VentaDia[]> => {
  const res = await axios.get("/api/reportes/ventas-ultimos-7-dias");
  return res.data;
};
