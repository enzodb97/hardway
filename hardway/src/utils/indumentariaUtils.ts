// Lógica centralizada para paginación y obtención de total de prendas
import axiosInstance from "../config/axios";

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
  unidad: string; // Nueva propiedad para la unidad de medida
  idIndumentaria?: number;
  rack?: string;
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
  const res = await axiosInstance.get("/api/indumentaria");
  
  // Mapear datos anidados del backend a estructura plana para el frontend
  let prendas: IndumentariaItem[] = res.data.map((item: any) => ({
    codigoIndumentaria: item.codigoIndumentaria,
    nombre: item.DetalleIndumentarium?.NombreIndumentarium?.nombre || "Sin nombre",
    color: item.DetalleIndumentarium?.Color?.color || "Sin color",
    nombreTela: item.DetalleIndumentarium?.TelaIndumentarium?.tipoTela || "Sin tela",
    talle: item.DetalleIndumentarium?.Talle?.talle || "Sin talle",
    categoria: item.DetalleIndumentarium?.CategoriaIndumentarium?.categoria || "Sin categoría",
    precio: parseFloat(item.DetalleIndumentarium?.PrecioIndumentarium?.precio || "0"),
    estado: item.DetalleIndumentarium?.EstadoIndumentarium?.estadoIndumentaria || "Sin estado",
    cantidadIndumentaria: item.DetalleIndumentarium?.cantidadIndumentaria || 0,
    unidad: item.DetalleIndumentarium?.UnidadMedidum?.nombreUnidad || "Unidad", // Nueva propiedad
    idIndumentaria: item.idDetalle,
    rack: item.rack || "Sin asignar"
  }));
  
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
