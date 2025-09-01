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
  unidad: string;
  idIndumentaria?: number;
  Stock?: {
    numeroRack: string;
    idRack: number;
  };
}

export interface IndumentariaPage {
  prendas: IndumentariaItem[];
  total: number;
}

export interface IndumentariaFormData {
  codigoIndumentaria: string;
  nombre: string;
  idColor: string;
  idTalle: string;
  idTela: string;
  idCategoria: string;
  idEstado: string;
  idPrecio: string;
  precio: string;
  cantidad: string;
  idDetalle: string;
  cantidadAnterior: string;
  idUnidadMedida: string;
  idRack: string;
}

export const camposIniciales: IndumentariaFormData = {
  codigoIndumentaria: "",
  nombre: "",
  idColor: "",
  idTalle: "",
  idTela: "",
  idCategoria: "",
  idEstado: "",
  idPrecio: "",
  precio: "",
  cantidad: "",
  idDetalle: "",
  cantidadAnterior: "",
  idUnidadMedida: "",
  idRack: "",
};

// Interfaces para los auxiliares
export interface Color {
  idColor: number;
  color: string;
}

export interface Talle {
  idTalle: number;
  talle: string;
}

export interface Tela {
  idTela: number;
  tipoTela: string;
}

export interface Categoria {
  idCategoria: number;
  categoria: string;
}

export interface Estado {
  idEstado: number;
  estadoIndumentaria: string;
}

export interface UnidadMedida {
  idUnidadMedida: number;
  nombreUnidad: string;
  abreviatura: string;
}

export interface Rack {
  idRack: number;
  numeroRack: string;
  descripcion?: string;
}

// Funciones para manejar auxiliares
export const cargarAuxiliares = async () => {
  try {
    const [
      coloresRes,
      tallesRes,
      telasRes,
      categoriasRes,
      estadosRes,
      preciosRes,
      nombresRes,
      unidadesRes,
      racksRes,
    ] = await Promise.all([
      axiosInstance.get("/api/colores"),
      axiosInstance.get("/api/talles"),
      axiosInstance.get("/api/telas"),
      axiosInstance.get("/api/categorias"),
      axiosInstance.get("/api/estados-indumentaria"),
      axiosInstance.get("/api/precios"),
      axiosInstance.get("/api/nombres-indumentaria"),
      axiosInstance.get("/api/unidades-medida"),
      axiosInstance.get("/api/indumentaria/racks"),
    ]);

    return {
      colores: coloresRes.data,
      talles: tallesRes.data,
      telas: telasRes.data,
      categorias: categoriasRes.data,
      estados: estadosRes.data,
      precios: preciosRes.data,
      nombresIndumentaria: nombresRes.data,
      unidadesMedida: unidadesRes.data,
      racks: racksRes.data,
    };
  } catch (error) {
    throw new Error("Error al cargar datos auxiliares");
  }
};

export const crearNuevoColor = async (color: string) => {
  const res = await axiosInstance.post("/api/colores", { color });
  return res.data;
};

export const crearNuevoTalle = async (talle: string) => {
  const res = await axiosInstance.post("/api/talles", { talle });
  return res.data;
};

export const crearNuevaTela = async (tipoTela: string) => {
  const res = await axiosInstance.post("/api/telas", { tipoTela });
  return res.data;
};

export const crearNuevaCategoria = async (categoria: string) => {
  const res = await axiosInstance.post("/api/categorias", { categoria });
  return res.data;
};

export const crearNuevoEstado = async (estadoIndumentaria: string) => {
  const res = await axiosInstance.post("/api/estados-indumentaria", { estadoIndumentaria });
  return res.data;
};

export const validarCamposObligatorios = (form: IndumentariaFormData): string[] => {
  const camposFaltantes: string[] = [];
  
  if (!form.nombre.trim()) {
    camposFaltantes.push('• Nombre de la indumentaria');
  }
  if (!form.idColor) {
    camposFaltantes.push('• Color');
  }
  if (!form.idTalle) {
    camposFaltantes.push('• Talle');
  }
  if (!form.idTela) {
    camposFaltantes.push('• Tipo de tela');
  }
  if (!form.idCategoria) {
    camposFaltantes.push('• Categoría');
  }
  if (!form.idUnidadMedida) {
    camposFaltantes.push('• Unidad de medida');
  }
  if (!form.idRack) {
    camposFaltantes.push('• Ubicación del rack');
  }
  if (!form.precio || parseFloat(form.precio) <= 0) {
    camposFaltantes.push('• Precio (debe ser mayor a 0)');
  }
  if (!form.cantidad || parseInt(form.cantidad) < 0) {
    camposFaltantes.push('• Cantidad en stock (debe ser 0 o mayor)');
  }
  
  return camposFaltantes;
};

export const obtenerSiguienteCodigoIndumentaria = async (): Promise<string> => {
  try {
    const response = await axiosInstance.get('/api/indumentaria/siguiente-codigo');
    return response.data.siguienteCodigo;
  } catch (error) {
    console.error('Error al obtener siguiente código:', error);
    throw new Error('Error al obtener el siguiente código de indumentaria');
  }
};

export interface GuardarIndumentariaParams {
  form: IndumentariaFormData;
  esEdicion: boolean;
  id?: string;
}

export const guardarIndumentaria = async ({ form, esEdicion, id }: GuardarIndumentariaParams) => {
  let idPrecio = form.idPrecio;
  if (form.precio && !form.idPrecio) {
    const precioRes = await axiosInstance.post("/api/precios", {
      precio: form.precio,
    });
    idPrecio = precioRes.data.idPrecio;
  }

  const nombreRes = await axiosInstance.post(
    "/api/nombres-indumentaria/find-or-create",
    { nombre: form.nombre }
  );
  const idNombre = nombreRes.data.idNombre;

  const detalleRes = await axiosInstance.post(
    "/api/detalle-indumentaria/find-or-create",
    {
      idNombre,
      idPrecio,
      idCategoria: form.idCategoria,
      idColor: form.idColor,
      idTalle: form.idTalle,
      idEstado: form.idEstado,
      idTela: form.idTela,
      idUnidadMedida: form.idUnidadMedida,
    }
  );
  
  const idDetalle = detalleRes.data.idDetalle;

  if (esEdicion && id) {
    if (idDetalle === form.idDetalle) {
      await axiosInstance.put(`/api/detalle-indumentaria/${idDetalle}/precio`, {
        precio: form.precio,
      });
    } else {
      await axiosInstance.put(`/api/indumentaria/${id}`, {
        codigoIndumentaria: form.codigoIndumentaria,
        idDetalle,
      });
      await axiosInstance.put(`/api/detalle-indumentaria/${idDetalle}/precio`, {
        precio: form.precio,
      });
    }

    const cantidadActual = Number(form.cantidad);
    const cantidadAnterior = Number(form.cantidadAnterior);
    const diferencia = cantidadActual - cantidadAnterior;

    if (diferencia !== 0 || form.idRack) {
      if (diferencia !== 0) {
        await axiosInstance.post("/api/indumentaria/stock/movimiento", {
          codigoIndumentaria: form.codigoIndumentaria,
          cantidad: diferencia,
          observaciones: "Ajuste manual desde edición",
        });
      }
      if (form.idRack) {
        await axiosInstance.put(`/api/indumentaria/stock/${form.codigoIndumentaria}`, {
          idRack: parseInt(form.idRack)
        });
      }
    }
  } else {
    await axiosInstance.post("/api/indumentaria", {
      codigoIndumentaria: form.codigoIndumentaria,
      idDetalle,
      cantidadInicial: parseInt(form.cantidad) || 0,
      idRack: parseInt(form.idRack) || null,
    });
    await axiosInstance.put(`/api/detalle-indumentaria/${idDetalle}/precio`, {
      precio: form.precio,
    });
  }
};

export const cargarIndumentaria = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/api/indumentaria/${id}`);
    const data = res.data;
    return {
      codigoIndumentaria: data.codigoIndumentaria || "",
      nombre: data.DetalleIndumentarium?.NombreIndumentarium?.nombre || "",
      idColor: data.DetalleIndumentarium?.idColor?.toString() || "",
      idTalle: data.DetalleIndumentarium?.idTalle?.toString() || "",
      idTela: data.DetalleIndumentarium?.idTela?.toString() || "",
      idCategoria: data.DetalleIndumentarium?.idCategoria?.toString() || "",
      idEstado: data.DetalleIndumentarium?.idEstado?.toString() || "",
      idPrecio: data.DetalleIndumentarium?.idPrecio?.toString() || "",
      precio: data.DetalleIndumentarium?.PrecioIndumentarium?.precio || "",
      cantidad: data.DetalleIndumentarium?.cantidadIndumentaria?.toString() || "",
      idDetalle: data.idDetalle?.toString() || "",
      cantidadAnterior: data.DetalleIndumentarium?.cantidadIndumentaria?.toString() || "",
      idUnidadMedida: data.DetalleIndumentarium?.idUnidadMedida?.toString() || "",
      idRack: data.Stock?.idRack?.toString() || "",
    };
  } catch (error) {
    throw new Error("Error al cargar la Indumentaria");
  }
};

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
    unidad: item.DetalleIndumentarium?.UnidadMedidum?.nombreUnidad || "Unidad",
    idIndumentaria: item.idDetalle,
    Stock: item.Stock ? {
      numeroRack: item.Stock.Rack?.numeroRack,
      idRack: item.Stock.Rack?.idRack
    } : undefined
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
