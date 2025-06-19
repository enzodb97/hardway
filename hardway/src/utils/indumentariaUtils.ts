// Lógica centralizada para paginación y obtención de total de prendas
import axios from "axios";

export interface IndumentariaItem {
  codigoIndumentaria: string;
  nombre: string;
  color: string;
  nombreTela: string;
  talle: string;
  categoria: string;
  precio: number;
  estado: string;
  cantidadIndumentaria: number;
  idIndumentaria?: number;
}

export interface IndumentariaPage {
  prendas: IndumentariaItem[];
  total: number;
}

export async function obtenerIndumentariaPaginada(
  page: number,
  pageSize: number,
  busqueda: string = ""
): Promise<IndumentariaPage> {
  const res = await axios.get("/api/indumentaria");
  let prendas: IndumentariaItem[] = res.data;
  // Filtro en frontend
  if (busqueda) {
    const normalizar = (str: any) =>
      String(str ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    prendas = prendas.filter(
      (item) =>
        normalizar(item.nombre).includes(normalizar(busqueda)) ||
        normalizar(item.talle).includes(normalizar(busqueda)) ||
        normalizar(item.color).includes(normalizar(busqueda)) ||
        normalizar(item.codigoIndumentaria).includes(normalizar(busqueda)) ||
        (item.idIndumentaria &&
          item.idIndumentaria.toString().includes(busqueda))
    );
  }
  const total = prendas.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    prendas: prendas.slice(start, end),
    total,
  };
}
