// Lógica centralizada para paginación y obtención de total de prendas
import axiosInstance from "../config/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatFechaSola } from "./dateFormatters";


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

export interface Presentacion {
  idPresentacion: number;
  nombrePresentacion: string;
  descripcion?: string;
  porcentajeDescuento?: number; // Porcentaje de descuento (0-100)
}

export interface ConfiguracionPresentacion {
  idConfiguracion: number;
  codigoIndumentaria: string;
  idPresentacion: number;
  cantidadUnidades: number;
  precioBase: number | null;
  estaActivo: boolean;
  nombrePresentacion?: string;
}

export interface MotivoNoApta {
  idMotivo: number;
  descripcion: string;
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
      axiosInstance.get("/api/indumentaria/racks/disponibles"), // Usar endpoint que excluye rack de No Apta
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
  if (!form.cantidad || parseInt(form.cantidad) <= 0) {
    camposFaltantes.push('• Cantidad en stock (debe ser mayor a 0)');
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
  // Normalizar el precio: convertir coma a punto para enviar al backend
  const precioNormalizado = form.precio ? form.precio.toString().replace(/,/g, '.') : form.precio;
  
  let idPrecio = form.idPrecio;
  if (precioNormalizado && !form.idPrecio) {
    const precioRes = await axiosInstance.post("/api/precios", {
      precio: precioNormalizado,
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
        precio: precioNormalizado,
      });
    } else {
      await axiosInstance.put(`/api/indumentaria/${id}`, {
        codigoIndumentaria: form.codigoIndumentaria,
        idDetalle,
      });
      await axiosInstance.put(`/api/detalle-indumentaria/${idDetalle}/precio`, {
        precio: precioNormalizado,
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
      precio: precioNormalizado,
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
        normalizar(item.nombreTela).includes(normalizar(busqueda)) ||
        normalizar(item.categoria).includes(normalizar(busqueda)) ||
        normalizar(item.codigoIndumentaria).includes(normalizar(busqueda)) ||
        (item.idIndumentaria &&
          item.idIndumentaria.toString().includes(busqueda))
    );
  }
  
  // Ordenar por código de indumentaria de forma creciente
  prendas.sort((a, b) => {
    // Extraer el número del código (ej: "IND001" -> 1, "IND010" -> 10)
    const numeroA = parseInt(a.codigoIndumentaria.replace(/\D/g, '')) || 0;
    const numeroB = parseInt(b.codigoIndumentaria.replace(/\D/g, '')) || 0;
    return numeroA - numeroB;
  });
  
  const total = prendas.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    prendas: prendas.slice(start, end),
    total,
  };
}

// Obtener indumentarias no aptas (en rack 99)
export async function obtenerIndumentariasNoAptas(
  page: number,
  pageSize: number,
  busqueda: string = ""
): Promise<IndumentariaPage> {
  const res = await axiosInstance.get("/api/indumentaria/no-aptas");
  
  // Mapear datos anidados del backend a estructura plana para el frontend
  let prendas: IndumentariaItem[] = res.data.map((item: any) => {
    // Extraer el número de rack correctamente
    let numeroRack = 'N/A';
    let idRack = 99;
    
    if (item.Stock) {
      // Obtener idRack primero
      if (item.Stock.idRack) {
        idRack = item.Stock.idRack;
      } else if (item.Stock.Rack && item.Stock.Rack.idRack) {
        idRack = item.Stock.Rack.idRack;
      }
      
      // Si es el rack 99 (No Apto), siempre mostrar "99"
      if (idRack === 99) {
        numeroRack = '99';
      } else {
        // Para otros racks, extraer el numeroRack normal
        if (item.Stock.numeroRack) {
          numeroRack = item.Stock.numeroRack.toString();
        } else if (item.Stock.Rack && item.Stock.Rack.numeroRack) {
          numeroRack = item.Stock.Rack.numeroRack.toString();
        }
      }
    }
    
    return {
      codigoIndumentaria: item.codigoIndumentaria,
      nombre: item.DetalleIndumentarium?.NombreIndumentarium?.nombre || "Sin nombre",
      color: item.DetalleIndumentarium?.Color?.color || "Sin color",
      nombreTela: item.DetalleIndumentarium?.TelaIndumentarium?.tipoTela || "Sin tela",
      talle: item.DetalleIndumentarium?.Talle?.talle || "Sin talle",
      categoria: item.DetalleIndumentarium?.CategoriaIndumentarium?.categoria || "Sin categoría",
      precio: parseFloat(item.DetalleIndumentarium?.PrecioIndumentarium?.precio || "0"),
      estado: "No Apta", // Todas son No Aptas en este listado
      cantidadIndumentaria: item.DetalleIndumentarium?.cantidadIndumentaria || 0,
      unidad: item.DetalleIndumentarium?.UnidadMedidum?.nombreUnidad || "Unidad",
      idIndumentaria: item.idDetalle,
      Stock: {
        numeroRack: numeroRack,
        idRack: idRack
      }
    };
  });
  
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
        normalizar(item.nombreTela).includes(normalizar(busqueda)) ||
        normalizar(item.categoria).includes(normalizar(busqueda)) ||
        normalizar(item.codigoIndumentaria).includes(normalizar(busqueda)) ||
        (item.idIndumentaria &&
          item.idIndumentaria.toString().includes(busqueda))
    );
  }
  
  // Ordenar por código de indumentaria de forma creciente
  prendas.sort((a, b) => {
    const numeroA = parseInt(a.codigoIndumentaria.replace(/\D/g, '')) || 0;
    const numeroB = parseInt(b.codigoIndumentaria.replace(/\D/g, '')) || 0;
    return numeroA - numeroB;
  });
  
  const total = prendas.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    prendas: prendas.slice(start, end),
    total,
  };
}


// --- Exportar PDF ---
export const exportarIndumentariaPDF = async (
  prendas: IndumentariaItem[], 
  filtro?: string,
  categoria?: string,
  esNoApta?: boolean
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Título dinámico según filtros
  let title = esNoApta ? "Listado de Indumentaria No Apta" : "Listado de Indumentaria";
  if (categoria) {
    title = esNoApta 
      ? `Listado de Indumentaria No Apta - ${categoria}` 
      : `Listado de Indumentaria - ${categoria}`;
  }
  
  const textWidth = doc.getTextWidth(title);
  const x = (pageWidth - textWidth) / 2;
  
  // Fecha actual
  const fechaEmision = formatFechaSola();

  const logoBase64 =
  "data:image/png;base64,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";
  
  // Logo y título
  doc.addImage(logoBase64, "PNG", 10, 8, 15, 15);

  doc.setFontSize(16);
  doc.text(title, x, 18);
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${fechaEmision}`, x, 25);
  
  // Información de filtros aplicados
  let yPosition = 30;
  if (categoria) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Categoría: ${categoria}`, x, yPosition);
    yPosition += 5;
  }
  
  if (filtro) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Búsqueda: ${filtro}`, x, yPosition);
    yPosition += 5;
  }
  
  // Resetear color del texto
  doc.setTextColor(0, 0, 0);
  
  // Preparar datos para la tabla
  const tableData = prendas.map((prenda) => [
    prenda.codigoIndumentaria,
    prenda.nombre,
    prenda.color,
    prenda.nombreTela,
    prenda.talle,
    prenda.categoria,
    `$${prenda.precio}`,
    prenda.estado,
    prenda.cantidadIndumentaria.toString(),
    prenda.unidad,
    prenda.Stock?.numeroRack || 'N/A',
  ]);
  
  // Calcular totales para resumen
  const totalPrendas = prendas.length;
  const totalStock = prendas.reduce((sum, p) => sum + p.cantidadIndumentaria, 0);
  const valorTotal = prendas.reduce((sum, p) => sum + (p.precio * p.cantidadIndumentaria), 0);
  
  // Crear tabla
  autoTable(doc, {
    head: [["Código", "Nombre", "Color", "Tela", "Talle", "Categoría", "Precio", "Estado", "Stock", "Unidad", "Rack"]],
    body: tableData,
    startY: yPosition + 7,
    styles: { 
      fontSize: 8, 
      halign: "center",
      cellPadding: 2,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    headStyles: { 
      fillColor: [254, 175, 0], 
      halign: "center",
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 'auto', minCellWidth: 15 }, // Código
      1: { cellWidth: 'auto', minCellWidth: 25 }, // Nombre
      2: { cellWidth: 'auto', minCellWidth: 15 }, // Color
      3: { cellWidth: 'auto', minCellWidth: 15 }, // Tela
      4: { cellWidth: 'auto', minCellWidth: 12 }, // Talle
      5: { cellWidth: 'auto', minCellWidth: 20 }, // Categoría
      6: { cellWidth: 'auto', minCellWidth: 15 }, // Precio
      7: { cellWidth: 'auto', minCellWidth: 15 }, // Estado
      8: { cellWidth: 'auto', minCellWidth: 12 }, // Stock
      9: { cellWidth: 'auto', minCellWidth: 15 }, // Unidad
      10: { cellWidth: 'auto', minCellWidth: 12 }, // Rack
    },
    tableWidth: 'auto',
    margin: { left: 10, right: 10 },
    didDrawPage: (data) => {
      // Agregar número de página
      doc.setFontSize(8);
      doc.text(
        `Página ${doc.getCurrentPageInfo().pageNumber}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  });
  
  // Agregar resumen al final
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen:', 15, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de productos diferentes: ${totalPrendas}`, 15, finalY + 7);
  doc.text(`Stock total: ${totalStock} unidades`, 15, finalY + 14);
  doc.text(`Valor total del inventario: $${valorTotal.toFixed(2)}`, 15, finalY + 21);
  
  // Guardar el PDF
  let nombreArchivo = 'Listado_Indumentaria';
  if (categoria) {
    nombreArchivo += `_${categoria.replace(/\s+/g, '_')}`;
  }
  if (filtro) {
    nombreArchivo += '_Filtrado';
  }
  nombreArchivo += '.pdf';
  
  doc.save(nombreArchivo);
};

// --- Función auxiliar para obtener categorías únicas del inventario ---
export const obtenerCategoriasDisponibles = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get("/api/categorias");
    return response.data.map((cat: Categoria) => cat.categoria);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
};

// --- Función para filtrar prendas por categoría ---
export const filtrarPrendasPorCategoria = (
  prendas: IndumentariaItem[], 
  categoria: string | null
): IndumentariaItem[] => {
  if (!categoria || categoria === 'Todas') {
    return prendas;
  }
  return prendas.filter(prenda => prenda.categoria === categoria);
};

// --- Funciones para manejo de indumentaria no apta ---

// Obtener motivos predefinidos
export const obtenerMotivosNoApta = async (): Promise<MotivoNoApta[]> => {
  try {
    const response = await axiosInstance.get('/api/indumentaria/motivos-no-apta');
    return response.data;
  } catch (error) {
    console.error('Error al obtener motivos:', error);
    throw new Error('Error al obtener motivos predefinidos');
  }
};

// Mover indumentaria a No Apta con motivo predefinido
export const moverANoApta = async (
  codigoIndumentaria: string, 
  cantidad: number, 
  idMotivo: number,
  observaciones?: string
) => {
  try {
    const response = await axiosInstance.post(`/api/indumentaria/${codigoIndumentaria}/no-apta`, {
      cantidad,
      idMotivo,
      observaciones
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al mover a no apta');
  }
};

// Reingresar indumentaria a stock (desde No Apta) - Vuelve automáticamente al rack original
export const reingresarAStock = async (
  codigoIndumentaria: string,
  cantidad: number,
  observaciones?: string,
  idUsuario?: number
) => {
  try {
    const response = await axiosInstance.post(`/api/indumentaria/${codigoIndumentaria}/reingreso`, {
      cantidad,
      observaciones,
      idUsuario
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al reingresar a stock');
  }
};

// Marcar como scrap (desecho)
export const marcarComoScrap = async (
  codigoIndumentaria: string,
  cantidad: number,
  observaciones?: string,
  idUsuario?: number
) => {
  try {
    const response = await axiosInstance.post(`/api/indumentaria/${codigoIndumentaria}/scrap`, {
      cantidad,
      observaciones,
      idUsuario
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al marcar como scrap');
  }
};

// ============= PRESENTACIONES =============

// Obtener presentaciones disponibles
export const obtenerPresentaciones = async (): Promise<Presentacion[]> => {
  try {
    const response = await axiosInstance.get('/api/auxiliares/presentaciones');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al obtener presentaciones');
  }
};

// Obtener configuración de presentaciones de una indumentaria
export const obtenerConfiguracionPresentaciones = async (
  codigoIndumentaria: string
): Promise<ConfiguracionPresentacion[]> => {
  try {
    const response = await axiosInstance.get(
      `/api/indumentaria/${codigoIndumentaria}/presentaciones`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al obtener configuración de presentaciones');
  }
};

// Guardar configuración de presentaciones
export const guardarConfiguracionPresentacion = async (
  codigoIndumentaria: string,
  idPresentacion: number,
  cantidadUnidades: number,
  precioBase: number | null = null
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `/api/indumentaria/${codigoIndumentaria}/presentaciones`,
      {
        idPresentacion,
        cantidadUnidades,
        precioBase
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al guardar configuración de presentación');
  }
};

// Actualizar configuración de presentación
export const actualizarConfiguracionPresentacion = async (
  idConfiguracion: number,
  cantidadUnidades: number,
  precioBase: number | null = null,
  estaActivo: boolean = true
): Promise<any> => {
  try {
    const response = await axiosInstance.put(
      `/api/indumentaria/presentaciones/${idConfiguracion}`,
      {
        cantidadUnidades,
        precioBase,
        estaActivo
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al actualizar configuración de presentación');
  }
};

// Eliminar configuración de presentación
export const eliminarConfiguracionPresentacion = async (
  idConfiguracion: number
): Promise<any> => {
  try {
    const response = await axiosInstance.delete(
      `/api/indumentaria/presentaciones/${idConfiguracion}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al eliminar configuración de presentación');
  }
};
