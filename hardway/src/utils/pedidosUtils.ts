// Migradas desde Pedidos.tsx
import { formatFechaHoraCompleta, formatFechaSola } from "./dateFormatters";

// Manejar cancelación de pedido (abre modal y carga motivos)
export const handleCancelarPedido = async (
  numeroPedido: string,
  setPedidoParaCancelar: any,
  setMotivosCancelacion: any,
  setMotivoSeleccionado: any,
  setShowMotivoModal: any,
  setAlertMsg: any,
  setShowAlert: any
) => {
  setPedidoParaCancelar(numeroPedido);
  try {
    const response = await axiosInstance.get("/api/motivos-cancelacion");
    const motivos = response.data;
    setMotivosCancelacion(motivos);
    setMotivoSeleccionado(null);
    setShowMotivoModal(true);
  } catch {
    setAlertMsg("No se pudieron cargar los motivos de cancelación.");
    setShowAlert(true);
  }
};

// Iniciar flujo de abono
export const iniciarFlujoPago = (
  numeroPedido: string,
  setPedidoParaAbonar: any,
  setShowConfirmAbono: any
) => {
  setPedidoParaAbonar(numeroPedido);
  setShowConfirmAbono(true);
};

// Confirmar abono
export const confirmarAbono = async (
  pedidoParaAbonar: string | null,
  setShowConfirmAbono: any,
  setShowAbonoExitoso: any,
  setPedidos: any,
  setAlertMsg: any,
  setShowAlert: any
) => {
  if (!pedidoParaAbonar) return;
  try {
    await marcarPedidoComoAbonado(pedidoParaAbonar);
    setShowConfirmAbono(false);
    setShowAbonoExitoso(true);
    cargarPedidos().then(setPedidos);
  } catch (err) {
    setShowConfirmAbono(false);
    setAlertMsg("Error al marcar el pedido como abonado.");
    setShowAlert(true);
  }
};

// Limpiar estado de abono
export const limpiarEstadoAbono = (
  setShowAbonoExitoso: any,
  setPedidoParaAbonar: any
) => {
  setShowAbonoExitoso(false);
  setPedidoParaAbonar(null);
};

// Manejar filtro de estados
export const toggleEstadoFiltro = (
  estadoId: string,
  setEstadosFiltrados: any
) => {
  setEstadosFiltrados((prev: string[]) => {
    if (prev.includes(estadoId)) {
      return prev.filter((id) => id !== estadoId);
    } else {
      return [...prev, estadoId];
    }
  });
};

// Limpiar filtros de estado
export const limpiarFiltrosEstado = (setEstadosFiltrados: any) => {
  setEstadosFiltrados([]);
};

// Obtener nombre de estado por ID
export const obtenerNombreEstado = (
  idEstado: string,
  todosLosEstados: any[]
) => {
  const estado = todosLosEstados.find((e) => e.id.toString() === idEstado);
  return estado ? estado.nombre : "Desconocido";
};
// src/utils/pedidosUtils.ts
import axiosInstance from "../config/axios";
import {
  checkmarkCircle,
  closeCircle,
  time,
  cash,
  airplane,
  ribbon,
} from "ionicons/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Función utilitaria para obtener headers de autorización
const getAuthHeaders = () => {
  const username = localStorage.getItem("username");
  if (!username) {
    throw new Error("No hay usuario autenticado");
  }
  return { nombreusuario: username };
};

// Interfaces según tu backend
export interface Persona {
  nombre: string;
  apellido: string;
  dni?: string | number;
  // otros campos si necesitas
}

export interface Cliente {
  idCliente: number;
  Persona?: Persona;
  // otros campos si necesitas
}

export interface EstadoPedido {
  idEstado: number;

  tipoEstado: string;
}

export interface Pedido {
  numeroPedido: string;
  idCliente: number;
  idEstado: number;
  fechaPedido?: string; // <-- agrega esto
  idEmpresaEnvio?: number; // <-- empresa de envío
  EstadoPedido?: EstadoPedido;
  Cliente?: Cliente;
  // otros campos si necesitas
}

// Agregado para el picker asignado
export interface PickerAsignado {
  legajo: string;
  nombre: string;
}

// Motivo de cancelación
export interface MotivoCancelacion {
  idMotivo: number;
  descripcion: string;
}

// Obtener todos los pedidos
export const cargarPedidos = async (): Promise<Pedido[]> => {
  try {
    const res = await axiosInstance.get("/api/pedidos");
    return res.data;
  } catch (error: any) {
    console.error("Error en cargarPedidos:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMsg =
        error.response?.data?.error ||
        "Acceso denegado: necesitas permisos para gestionar pedidos";
      throw new Error(errorMsg);
    }
    throw new Error(error.message || "Error al cargar pedidos");
  }
};

// Crear un pedido
export const crearPedido = async (pedido: Omit<Pedido, "numeroPedido">) => {
  return await axiosInstance.post("/api/pedidos", pedido, {
    headers: getAuthHeaders(),
  });
};

// Eliminar un pedido por numeroPedido
export const eliminarPedido = async (numeroPedido: string) => {
  await axiosInstance.delete(`/api/pedidos/${numeroPedido}`, {
    headers: getAuthHeaders(),
  });
};

// Editar un pedido por numeroPedido
export const editarPedido = async (numeroPedido: string, datos: any) => {
  await axiosInstance.put(`/api/pedidos/${numeroPedido}`, datos, {
    headers: getAuthHeaders(),
  });
};

// Cambia el estado de un pedido a Abonado (idEstado = 3)
export const marcarPedidoComoAbonado = async (numeroPedido: string) => {
  return await axiosInstance.put(
    `/api/pedidos/${numeroPedido}/abonado`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
};

// Cambia el estado de un pedido a Finalizado (idEstado = 5)
export const marcarPedidoComoFinalizado = async (numeroPedido: string) => {
  return await axiosInstance.put(
    `/api/pedidos/${numeroPedido}/finalizado`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
};

// Obtener motivos de cancelación
export const obtenerMotivosCancelacion = async (): Promise<
  MotivoCancelacion[]
> => {
  const res = await axiosInstance.get("/api/motivos-cancelacion");
  return res.data;
};

// Cancelar pedido con motivo
export const cancelarPedidoConMotivo = async (
  numeroPedido: string,
  idMotivo: number
) => {
  await axiosInstance.put(`/api/pedidos/${numeroPedido}/cancelar`, {
    idMotivo,
  });
};

// Obtener motivos de modificación
export const obtenerMotivosModificacion = async (): Promise<
  Array<{ idMotivo: number; descripcion: string }>
> => {
  const res = await axiosInstance.get("/api/pedidos/motivos-modificacion");
  return res.data;
};

// Obtener historial de modificaciones de un pedido
export const obtenerHistorialModificaciones = async (numeroPedido: string): Promise<any[]> => {
  const res = await axiosInstance.get(`/api/pedidos/${numeroPedido}/historial`);
  return res.data;
};

// Filtrar pedidos por texto (cliente, fecha, numeroPedido, DNI)
export function filtrarPedidos(pedidos: Pedido[], filtro: string): Pedido[] {
  if (!filtro) return pedidos;

  const normalizar = (str: string) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z0-9]/g, ""); // Solo elimina tildes y caracteres especiales, no números ni letras

  const filtroNorm = normalizar(filtro);

  return pedidos.filter((p) => {
    const nombre = p.Cliente?.Persona?.nombre || "";
    const apellido = p.Cliente?.Persona?.apellido || "";
    let dni = "";
    if (p.Cliente?.Persona && (p.Cliente.Persona as any).dni !== undefined) {
      dni = String((p.Cliente.Persona as any).dni ?? "");
    }
    const fecha = p.fechaPedido
      ? formatFechaSola(p.fechaPedido)
      : "";
    return (
      (p.numeroPedido && normalizar(p.numeroPedido).includes(filtroNorm)) ||
      (nombre && normalizar(nombre).includes(filtroNorm)) ||
      (apellido && normalizar(apellido).includes(filtroNorm)) ||
      (dni && normalizar(dni).includes(filtroNorm)) ||
      (fecha && normalizar(fecha).includes(filtroNorm))
    );
  });
}

// Filtrar pedidos por rango de fechas
export function filtrarPedidosPorFecha(
  pedidos: Pedido[],
  fechaDesde?: Date | null,
  fechaHasta?: Date | null
): Pedido[] {
  if (!fechaDesde && !fechaHasta) return pedidos;

  return pedidos.filter((pedido) => {
    if (!pedido.fechaPedido) return false;

    const fechaPedido = new Date(pedido.fechaPedido);

    // Establecer las horas para comparar solo las fechas
    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      desde.setHours(0, 0, 0, 0);
      if (fechaPedido < desde) return false;
    }

    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      if (fechaPedido > hasta) return false;
    }

    return true;
  });
}

// Devuelve la clase CSS según el estado del pedido
export function obtenerClaseDeEstado(estado: string): string {
  const mapa: Record<string, string> = {
    "En curso": "status--en-curso",
    "Pendiente de Pago": "status--pendiente-pago",
    Abonado: "status--abonado",
    Despachado: "status--despachado",
    Finalizado: "status--finalizado",
    Cancelado: "status--cancelado",
  };
  return mapa[estado] || "";
}

// Devuelve el ícono de Ionicons según el estado del pedido
export function obtenerIconoEstado(estado: string) {
  switch (estado) {
    case "En curso":
      return time;
    case "Pendiente de Pago":
      return cash;
    case "Abonado":
      return checkmarkCircle;
    case "Despachado":
      return airplane;
    case "Finalizado":
      return ribbon;
    case "Cancelado":
      return closeCircle;
    default:
      return time;
  }
}

// Eliminar pedido y recargar lista
export const handleEliminarPedido = async (
  numeroPedido: string,
  setShowDeleteSuccess: any,
  setPedidos: any,
  setAlertMsg: any,
  setShowAlert: any
) => {
  if (window.confirm("¿Seguro que desea eliminar este pedido?")) {
    try {
      await eliminarPedido(numeroPedido);
      setShowDeleteSuccess(true);
      cargarPedidos().then(setPedidos);
    } catch (error: any) {
      setAlertMsg("Error al eliminar el pedido.");
      setShowAlert(true);
    }
  }
};

// Obtener pickers del backend
export const fetchPickers = async (
  setPickers: any,
  setAlertMsg: any,
  setShowAlert: any
) => {
  try {
    const res = await axiosInstance.get("/api/picking/pickers");

    // Validar que los datos tengan la estructura correcta
    const validPickers = res.data.map((picker: any) => ({
      id: picker.id || picker.legajo,
      legajo: picker.legajo,
      nombre: picker.nombre || "Sin nombre",
      nombreCompleto: picker.nombreCompleto || picker.nombre || "Sin nombre",
    }));

    console.log("✅ Pickers procesados para frontend:", validPickers);
    setPickers(validPickers);
  } catch (err) {
    console.error("❌ Error en fetchPickers:", err);
    setAlertMsg("Error al obtener pickers");
    setShowAlert(true);
  }
};

// Asignar picker
export const asignarPicker = async (
  pedidoParaAsignar: string | null,
  selectedPicker: any,
  setAlertMsg: any,
  setShowAlert: any,
  setShowConfirmAsignar: any,
  setShowPickerDropdown: any,
  setSelectedPicker: any,
  setPedidoParaAsignar: any,
  setPedidos: any
) => {
  if (!pedidoParaAsignar || !selectedPicker) return;
  try {
    const res = await axiosInstance.post(
      `/api/pedidos/${pedidoParaAsignar}/asignar-picker`,
      { pickerId: selectedPicker.id }
    );
    setAlertMsg("Picker asignado correctamente");
    setShowAlert(true);
    setShowConfirmAsignar(false);
    setShowPickerDropdown(null);
    setSelectedPicker(null);
    setPedidoParaAsignar(null);
    cargarPedidos().then(setPedidos);
  } catch (err) {
    setAlertMsg("Error al asignar picker");
    setShowAlert(true);
  }
};

// Confirmar abono de pedido
export const handleConfirmAbonar = async (
  pedidoParaAsignar: string | null,
  setAlertMsg: any,
  setShowAlert: any,
  setShowConfirmAsignar: any,
  setPedidoParaAsignar: any,
  setPedidos: any
) => {
  if (!pedidoParaAsignar) return;
  try {
    await marcarPedidoComoAbonado(pedidoParaAsignar);
    setAlertMsg("El pedido fue marcado como abonado correctamente.");
    setShowAlert(true);
    setShowConfirmAsignar(false);
    setPedidoParaAsignar(null);
    cargarPedidos().then(setPedidos);
  } catch (err) {
    setAlertMsg("Error al marcar el pedido como abonado.");
    setShowAlert(true);
  }
};

// Confirmar finalización de pedido
export const handleConfirmFinalizar = async (
  pedidoParaFinalizar: string | null,
  setAlertMsg: any,
  setShowAlert: any,
  setShowConfirmFinalizar: any,
  setPedidoParaFinalizar: any,
  setPedidos: any
) => {
  if (!pedidoParaFinalizar) return;
  try {
    await marcarPedidoComoFinalizado(pedidoParaFinalizar);
    setAlertMsg("El pedido fue marcado como finalizado correctamente.");
    setShowAlert(true);
    setShowConfirmFinalizar(false);
    setPedidoParaFinalizar(null);
    cargarPedidos().then(setPedidos);
  } catch (err) {
    setAlertMsg("Error al marcar el pedido como finalizado.");
    setShowAlert(true);
  }
};

// Obtener picker asignado a un pedido
export const obtenerPickerAsignado = async (numeroPedido: string) => {
  try {
    const res = await axiosInstance.get(
      `/api/pedidos/${numeroPedido}/picker-asignado`
    );
    return res.data;
  } catch {
    return null;
  }
};

// Exportar PDF

export const exportarPDF = (
  pedidosAMostrar: any[],
  tituloPersonalizado?: string,
  estadosSeleccionados?: string[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const title = "Listado de pedidos";
  const textWidth = doc.getTextWidth(title);
  const x = (pageWidth - textWidth) / 2;
  const logoBase64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOQAAADkCAMAAAC/iXi/AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURUdwTOxjI+tiIulfI+liHPFoIuNfJt9dAPeKJOhkJullIexkIuxoJOtiI/y9LuZhJu9nIu9nIu5mIutjI+1lIv7LNP/NM/vKLu5mIuxlIuxkI/+9M+5mIvBnIu9nIuxkIu5nIuxjIvacM+pgI+xjIu9nIutiI/JoI/aZM+9nIu9nIuphI+9mIutiIelfI+1kI+lgI/7QM//QM+1mI+tiIu9nIulgI+lgI/7QM+5mIutjI+xjIu9mIu1lIu9nIuxkIv7QMv7QM+9mIulgI+hfI/7INf7INfaVMP7RM+9nIuxlIuxjIvBnIupgJP2+OP7QMv7PMv2/Of2+OP7PMvBnI+xhI/2+OPiXMveWMvaSMP2+OP7QM/7PM//QMveXMf7QM+pgI+thI+lhI/29Of3NNPiYMv/TM/7RM/SRMfaUMP7QMv7QMveYMP7NM/iZMv/OMvWTMP7AOPiXMv/QMv2/Oe5nIv/RM/2/OPiWMv/QMvy6N//PM+hcI/y9OP2+Of7PMvzMMv6/OfWVMf/SM/7QMvmpNPadL/KMKvGRMvmZM/eXM/y5N/OTMe9wJfFxJvaYM/29Oe5nI/7PM/2+OfeaNPaXM/aZM+5mI/7QM/hrJP28Oe5lIvaWMv/UNP/AOupgJP2/Oe5jIv/RM//SM/NkJfRkJu9nI/WPL/7OM/WSMPVqJOhbI/ZqJO1kIuhdI/7NM+9rJP7LNPFoI/JpI+leI//BOvZlJvRpJP/FO/FjJf3BOP27OP/YNfBtJP/aNfqsNf7INvaVMfiiNP7BOvtsJfmoNf+eNf7GNvigM/B0Jvy1N/7JNPOHLfJ/KvODLP2cNPy4OPedM/uxNfBwJfSLLf/DO//VNPF3J/iaMvilNO9pI/J8KflsJOxiJPmpMPqvNvuyN/WML+9yJutpJf3DN/26OPOCKv/WNfF5KexuJ/OFKvy9MuplJe9kI/qbNPSILe51Ke98KvegLf3AOPmvMO1lI/6+OfaYLfy8OfF3JfekLPq2MfzEMv/QM/6VMPyeM6nhyEsAAACPdFJOUwApMswI8QUBAgwPdhWZBxPW3nshWyEZC2IaSBBx+ehpqI//7Ij1tvz+weOAlD3BJNf0jTlXut+t6x6DLZ5U7k3D28X0ZDJFZ+HLUEKu5YajaLLHctH21+KsIOTluIPusPv7o5t80fz4LVNh1H44+ExAcL2q8f3vWZOadFhwqr3NPPqgJ1L22jI48cLlcmRa3GUXZAAAFkFJREFUeNrsnGlQE2kax1EUURQ8OFR0dDxAUVTwwPUET2bEgl20ZqaE0bFcZxfGdWstrbW0yqnS2f1IOi2QBrpoSFC002LUCoYJI9ocajwQ3TgIKsthBsRZGDxWV6x9O2cn6Yak6c4Mqfw/YQdj/+p5/s/xdqKXl0ceeeSRRx555JFHHnnkkUceeeSRRx555JFHHg0OjVi7e0HYiiFuzTg65rFSqSzaPs/HjRm9i1QzF3jvUsliRrkro29MkSpmoZfPFm9ZUcwwN4XcACKoz9OAMJnsYzdN1q2yZaMNPwZ4qwqWuCXkvKIXgaafh8xUbZ3khowBy2TelqK64YVst1s6UhVIK0Jhsq8i3W8MWFC0jN43hm6XLXC7bjlkfZF1QR0je/ypu0EeleVH2lC7XyjDlItGetmGcrJ7MU6aqRxjc2nldlnYiMFFMSEycmUfA+naFyq77h8j+2roYEIcmjD8woWDEQmBASy/MEu5foLttcmPB9Vwt2VNIyIvRSor5ePGT2JuIEpvuyozzFu1NWDwTKXj5OGrVq+dtjvibCMS4TeSaW61sySQn0y1YdBATmks9TOMbhPXlSLINvuiuThfxoAzAXSRwVJ6fOdWjjXlos+SbQhycL5tFm6Q7WKqMTGy7YPlKCTgo0paARk5fg2CjN1i0xOVjO5bopKNHywT21RkolUDXCpHpo73pV8CdWcE84rpPUimnqEH5autLvj4zZYjCaNp0V2mZF6sdjOn8WCA9PKKHAtS1nL7C9cX+TH+1dUq2bzBAbnSJl31Y1wCIl9jRt/yWLWa7UiEKV99/ENCgw0KDfH3/S1A/m5NpX358FkRLg+f0ndxta6vI0KD9u1P2hOdmBJ7LC5+x3KDdsTHHYvdmZiafOLboNBfEXLkuMpVDJcDh8vPfmwI0wrlTJYTnUCV6qhXSNCmpOidx+KjxKhOrdPptCgqlRYaJJWiqFanU6u1vVHxsYnJ+4P8f52lf27lOqbaGRmBINP1489u5SKWc9Z/Dr/zj5S4KCmAQ6WFveI+1Fso1erUaFR6YtLGENdTjqn8iHEGHQIGg6Wj9R1kgf2r/sePRMfuKAF3jvYJZytUp9sbl5gW5GLIicjBxcxb5FwEWTfJa9gi2w7ivzEtMT1Kp9ZKJWIO6gWgh1KSXMo59CAyhfmVUQlglJ0waqZyFu1i0JHD6V/rnIyfnQoB54ETIa6sPAksLw1bBRrm2vVFR00h3Lcn9pB2oIBmTjR9T7CrKKdXRrAthj5j5KVrdhmOBUI3RaeL1dpCMX9C1cujg1xlyousZ1K+85FX+Y8jvUI2HY6TqvkJIV1SgOmSaC6cXcl+kOE7Pzx/1+boOKmOf0JD1qrjk1zQPKmNso8HjtNVne/VAhEaoqmL3Sc8pV9jONuTjZATO7/EWzQSsaDSRe0RPJhDZjfOZ3zheGoc+sMDvF0xYEiJrWwrbUqQ4PnaOM7+/Mpn04EoNSqWPsO7igeAJhYXlygUGk1FRY1ZFRqNQlGsf90czPhNAlNOQ0ptH9+EpsUW6qh2IenGu7ngATiFpqKmtbUMw2CRSJRjJZEIxnpaW2s0JWIjKBqVJizkpDWN060uBCfH6bTGWtOF35Y4Fz1xiQLQ9QA2Aw+bqBfhntYKhZj6B6R7kwWeBxqH047Ig1J36FDTPZc04x2ow+ED0QN4ejqRgwK/2VNDcRYKTDn5ImLenIOil6ullhvXtOMPUIcASwCfPnoip5UjKqsolhRKk4SEHLYNMbZKCpE+uUk0LfhptD/AYkVFaxk3PjMnVlMs/Xq/oK0SKV1LeTHVGhEAvG/B36D9AfYMiM+E2aNBlx8X9KSnMcwrJDmelqgmyE5WSH2K8gNoVKs2Vsj1axWy/ZtjOnsayfNO/BeUJYQ1ZTB/gIZg6lKFXJ2nvvigY2JhhNSHEBPxCmgQGbVRMMbg6I6C8vcM/bDweT7+DrUhBC7kOYSWWF5OEeik1jct/oeXrwgm70kB5BPUipD3JLXS68vCVNiNKVpUXNJANDNsG9L/XbJAgiwVlpDSv/4gwFOkkD1RlBnRJwTBUGEA5DkDJCAULkvpocT4H9X3xerncLFE8ZZ4ax9KAHnpJegrkmJQaYQnpHT59zwj+qdGaU2nSu8I4h3KCIkCI/aIXEIIw6K2777g143GMBoGuBvEW7v1WPoSQCrKXEMIEGufXsuq3swnY9IhemtEfyGIJ7ahRAHktdeuIcT+21Q/IzMzo/pzHntjotZqiGMIJZhq6gEk6QpC0c0qihDo5894+4DQt+lqmyM4KpQ0V1ItEXt9zQWQwIi1V65n5OkRMzKyzizmK1XNFcc6lKYCKxFrWoETSeEhDUY0EVKQH6bx0xwPa6UMx/bmUEqKKwzFhhQ4XWHYaESasj7M54MxKFbNdFos0bwlboBQSkpqMGM5JasEhISxnKYqG0JKH8L4sGO8juUJzDtq7LEg6iHPXSeFM+KcPDvEjJP//mTgQ/qRQ2yrvqTkLXH/eQ+tKVKQM0iBjMhESEHeYTgGdlLJe6XsD9PABPuAzoRdyecfksmIdE8+jBggpG80+yNGiaIVbiDOP8WsIPEskueOyGhEC+PV8gFC+h/W9faBmEPWZxMdr60h35C8pimzEWnZeuvCwCBDDrAxgooKU17EnhFQlSWU2NNO/CrJG2GbdUdkydYLA/JkyE41C2KxAZEK3SOigRbJuk78DMmbEedk9kMIGE9DpWN9+GeUiCtoTeMBkXvPjAU3deKnSV5H0350siH37FwB4qgpozUN+OZ94kYtbP5TC/6A5MOIGXmOIILB9RGETOdecw6oWeqN9bZIviEIc4bCtS34LVJ4I1oC+VMuhMziyuiTqO7TjJa7antInK/DTJDteAcpuBFp0w4EQfJArpDRjKOcBrPf+clrljYCt7Xjt0nBjWhWZnM2dGoq1w9EJ2t7GTOVSaCNZNcbyXKa8W5SaCNaAnk7F4IuRnD8jv+RvYX2NdUuU83N8XzBw++NtacL/wnmZsQ5ThIakxWSJ3A8eDwktQ9jGevpFHmGIIxzDtaNd3E5rJmT6SwhNdDdzwaQbB9o7O84J05rH8a+brP2RkF5k772kN14c46zRrzHgVA/64BkBZZcyal5pOicCKM+ftdziQ4D5B28vU1YI1oZEoJKP+E076TaFdaa/g5SqdqjPxEgb+EttbCQRrQM5pBeCKfvDe3f22szi7f2m4BY3fkC/dxDnsZbbsIOdsQZmVwJqaLziDIkdGo2l2+ABcej/fdG+9pzlSCooZU8g3fSF0zeOqIt4+nzekZIvpTDd/lGWE9zfVcc2n1//7Dg0RVMRGbh+Vcw4YxoZiw3MEJnufy/ImmodaqWOVgrsSqooCEHJq+fu1RPCmZE835lYiwdy2GXDN6BWh06Yg73A7BzgWZJ1vdxXDdgI9rFkVOT/NNOnXVVdaLj3WwuKK8jWQ95eDCirR+pkc7Z5yBfbP7bd/Q4Frc69QSOvJ5b8IxkORrgw4jmumpmhBA/pwhD//z5l9V3aZ/ocNyOZlt2ELn3ahm2Zn6MaGL8zyMzY+k4J2Zz/7/+/bO71SfzXtIYFT3OPknFmsoL7j9tx++QjM8R+VHWHcjMCMknOm7Eb/74Y/XPYDmbYfkQgESBOb8ukfdeER1deDcmgBGNiBkN2RbGs+t8HDbiX6rv6t8hr87CqIE5LYXPCOjVuS6YfyOa9g79TG7UqamRjhsxy7hlWwIp0XBb7rG68uxXl9rbYL6NaCqr92mMEDLGYSOa38LiSK6MIGF/LIAIMKFz3hH7jOMtS1nVV53RjhqR9h6m0sqd0ZCwLU0wr0Y03l5mA0RnPBX+qcNGtASyigdGUGHBtj7jWkYez4gZJ8/coKdqf8k6im5EGuT/27vWmLbOM+wA5hJgXII2IJhLwWTcAhKBiEuolLSrSJZKjdJ27Y9pUVeplaapnRptirZJ64/dNMkc+fg4h2PFVLNxbBnmHQgGRYg5o1msYCepQSSAFUw2RBJWGkVkP/pn3zm2wcf+zvE59udKtc7zK3Ik5If3fd7L971879PLobiqTcKQ2iHLGOXWoAYBXJXL0Xaev9bJihLi/uHevb8nnjsiM2JgF6O8OGIzurb0eg5HWt0pXogxYefq8+EEGQYPawjrtl7vsBBIzbg4yzUjNmqrES/ECEuGvPXfw4m5aTgjEq5tP0a5EUoSN3AjDitI2DsAigK4ECO9lSF5+V/DiTBkMmI4muoeTe7qKQ+Ozoy+KDMCjk2wLjL305s8bsqJrQkEVmbuhJMRicfjj8DXChCI1BhrRsxWcgh6qPHO7+8I/jDD1wzJqyOJCZHzq/9q/NEiRvlcBJKgOhtjRmxCyRd0/vBjQUtqmErgsjRBwktT/Nn4tstDUVtJkyRwy7I+xowYreKtAnI++rkAS909ZrLqtmQhwmaHvONGC+Gm9At4sgHH44g1I0YfEeqvXvvyPj/JG5Kyh1CPiC9MTi7gVgeVXB4Bnuqj9BCOTuFTnZ/d5Jfk3GXRkTXO9QVhMY57cXxBT23oUHsqSJDOOAfmOZ/ysmRaSXFRJ+5kDagGxp/hzMBCwnmEwK2rGMRTAUd73KvzrB/d5A+uYgzJzYh8P+vR+FeEhjCAPLKDJ5Y2Nh1QisBXe+O3kAXv87AE1fnV5yKE+LmYHvHx+GO2w12hHFbpssR13lmYGFmOoi533nn7Dl9RdxvVPSIOEqWLDbN66f0IroHHm2BcFXmS/Ed4utQ9/atQjpR0WMMkStaCxJZUWeK6nQ09D0XMqRJ9NvchNF0CS44ICHH9hoSjDCZRskUd4ZImS1wjQBFzDkh4tvk1WJluePo33tJU6nU3sWicDDaUkmSJ6xYEKGJkiZS/GciFpUvD09vDcCHO3dNIPK0J5RBNSJYbOkJM0jA88QlQxMiT7dLmdCHp0vD1P4bj/m2CWDA5JOSkjCxXifgUXbwRNRhyyFqpszp5v4hhaXgYlSXZWzYiwamMYA5h/wmypf4JHi/1gyJVgCI2caRU+ij9d2PSpeFBZHBNQIhROWQ73GgRFge1EhBgiROBLWGKmL36RCKzDx9Ep0vdrefJCZE7e8L0IftDGtQsX28JpLjghhdw+5UceTLBx28/+lNUIiH+o01OiDF9SMS4DU9NQBBWzywlTBGboFsTHr7+EOf2XbqHWobh9fUHeNJH30wfElkELMOCD4HrFpdXhP2UiarNySxU+Qs3XeoejCQnxEi4tvfCa6gmiO6gccK66dPHMSITVRvbFcngV5zgoyPWgRBRHe7vh1dY8AFK3BFhRBBxlFVJ/ul59n7fpTN8/8bDG+iuL9jwyrkBB8EnVPkQuMayOhvfiIwZm5J/vvjgn28GGWpuzd0der5uQHccHBle2Q82KWrDAJpM4KZeHybCiECNynwULwhUvH9Hp9O99Pn6MPMs1fB9dJfenPAarny2QDT1uldEMcSctsY+BQrkfvD2lw++uD6iDY1UWVFdYBBWY7h63btcdOv1W8sOihLDEHhqSTmy5+8vXdHu39MNL7pQsQyegEREGo3Vg2EiGYKAo2pFuKPq42nOdNyWBhFLYmP8kSFMENdZNt0rekwsRie6OhUIcWmaOx3nNiC6wXg2bmScHwQa1+KqyEgT8lRspQrt6zNcktq7bp8VyW0UW9i9hBss3mWHXgJDjLYrL9rykXJU/HSae+E/h6080eBoIs/WzhYwoRSGIN4MNPSVkCVodzm+Ph09oTJGuQNEMjQJ4KLAgtuTRkkmZCkqW0ER10LaylJKcmjEMkZh7kUdTiTGD9e4At5lYEGj0YhJpdjPZsZ2JdmVm1KSWu3OGAgTvk0LqKEJSfQIjTXgXd1wBF10zGjcleaoreGusZZUZaSU5JB2+MkYhoHScsMTcDFfnYjLDtBzWXY2l30sv5CL7koh6SSrG/a7jcqJtYbUkhzSDi1+xnxRwNPh9ixYXDqGByDLAc5+pjFYLYveVYaefp8fC73R6BeZFm224vzI3J9VTCb/cEAE3puGnUNaQ18XfHHA1Ode9Xh3AhaLNQSLJRDYWfB6tpZ9syw7CnaWKFKUNHmxqSyKUmnwEcdUkgQsb81+tm8ShgVLY8XBYmXvQ0rooNRvNMYNrqNOcqC/LaZIPaBeq001SZBJvlgdkxb+YxE/8tAkPVjVA7tH7SKrC9CR/M0SzxjgdevKWHIkd+OJkm7uP8PTMNaQ9rLUkxzS/nPOI7ppgENAlLTNhjn7+euaHiVKf+UlCYw5dMs9lgxNPw9J2kaqu2ppupp/IWVO11ozusV4bywJja7e/d9GEjShoqTtpLKr6oCiksacSn6WVQL7D9CSBD579/4ylWgIihEliKXO6h+WsxNjr5i2aaeS98KxT7VW9w2RZGhev7HpGKNGkxUlIGhXD9ZVhoNmi7m+V2VT84WX7PPzg8jq198uxR+dH1m/48FIG52IKPXBcQbSriruLz8QEUsLp7qzy1Q2Fd87Za3zyp5vjuSLpelP3vhlZ2mT0k46aan+uuskSefAYGF5X9ReikZmH94xtY3mGec4ZkdX9MQh+eLa9O/OfRzcdXCorPC82kbaJ0QxHaWddtJvfPN8bWllT6zj5WZOMS+UvTywt40rpuiZR7XiMOecEMkr01feev3ViKIru/10b2OxmiZJ0jZB07FCHR2laaeN+e+LA8VddR0z3Ty58GB3cNloW7MdfoecVzKPKlNmn7vGy3Bp6d33fgBZy5HXfqa8obapuFp9EYgtEvaJ0YvK5uKm2rqq050VwD9/bb7Ac+x26NRU8CCnr5gkm2ATul3IIk8uD8kXS0tAiILb5rIK2jPOnC6rqcpvaeht6M3Pryk/UdnZ11MU4X19PzHzrClsM4aXHDPbuEraYJGnGdFJz3feuiYsxCQdJdOcCTdHmckYbv7z+u12ZewUUun8QEXKSF5ZihJiMmgwvwm/0GiJWPqXU3rE5oy5Ta4h1e2pIckrxATRZjTBz1CPc5b+nagmycGoY51yUoWI5PciSQYzItK1j1kdcH8NZZB98Z4kyaj71qr5AUTVwOF3ryAXYpS/QhduVnD34QFh1h2x27syUhJ4wiSRCjESGRfMsCncTuNMdNV6ugQYs2FPqNmD8005CEkGhZialRQgvsI2btZANqoWFKpIsrk05KNlR9ZQ3YgAkqwQU7c+Lt/khzSGoDyH+OKZJlAsVfefaC/qqRmwo5Kk4vAnqRAit7QxH4fYdwr6tm522aBzft6mrh5w2ifKUX2Fw5deTfXK4OPmU4cgRR1PJZT9cm014DlvLylTfItQ6Y/dQH1sxs9/uFFQWdVbeqLo28RRkZVpitFf4VR9gSKtUGOaiWr/8zqmGtOLI2gdTR150cVeTZqRBFlk5hXOB3XmU+3pRrKo29RdxDGt+WhOupEEquQE2GMzUZZNC4AAG9FWZh81nS1KP5KKMxdMR/cq2NN+c68iHVFnMoVP/Q92mOor0pLkwUyTP9RUFJpM+Yr0xIGzJn8DKHyyGv4b4bnphoyzppmOupbMmZnudkXa4sBJk3lqymzuyFCkMfJqTtbXd/QWKdIbORUVWQoZMmTIkCFDhgwZMmTIkCFDhgwZMmTIkCFDhgzU+D8qjkwOMu8XGAAAAABJRU5ErkJggg==";
  doc.addImage(logoBase64, "PNG", 10, 8, 15, 15);
  doc.text(title, x, 18);

  // Fecha y hora de emisión
  const fechaEmision = formatFechaHoraCompleta();
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${fechaEmision}`, x, 25);

  // Estados seleccionados (si hay más de uno)
  if (estadosSeleccionados && estadosSeleccionados.length > 0) {
    const estadosStr = estadosSeleccionados.join(", ");
    doc.setFontSize(11);
    doc.text("Estados seleccionados:", x, 32);
    doc.setFontSize(10);
    doc.text(estadosStr, x, 38);
  }

  let startY = 28;
  if (estadosSeleccionados && estadosSeleccionados.length > 0) {
    startY = 42;
  } else {
    startY = 30;
  }

  autoTable(doc, {
    head: [["N° Pedido", "Estado", "Cliente", "Fecha de Registro"]],
    body: pedidosAMostrar.map((pedido) => [
      pedido.numeroPedido,
      pedido.EstadoPedido?.tipoEstado || "Sin estado",
      pedido.Cliente?.Persona
        ? `${pedido.Cliente.Persona.nombre} ${
            pedido.Cliente.Persona.apellido ?? ""
          }`.trim()
        : "Sin cliente",
      pedido.fechaPedido
        ? formatFechaHoraCompleta(pedido.fechaPedido)
        : "",
    ]),
    startY,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [254, 175, 0] },
  });
  doc.save("Lista pedidos Hardway.pdf");
};

// Exportar PDF de detalle de pedido para cliente
export const exportarPDFDetallePedido = async (numeroPedido: string) => {
  // Función para mapear idPresentacion a nombrePresentacion
  const obtenerNombrePresentacion = (idPresentacion: number | null | undefined): string => {
    if (!idPresentacion) return "Unidad";
    
    switch (idPresentacion) {
      case 1:
        return "Unidad";
      case 2:
        return "Caja Cerrada";
      case 3:
        return "Pack";
      default:
        return "Unidad";
    }
  };

  try {
    // Obtener información completa del pedido
    const res = await axiosInstance.get(`/api/pedidos/${numeroPedido}/detalle-plano`);
    const pedido = res.data.pedido;
    const prendas = res.data.items || [];

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Logo de la empresa
    const logoBase64 =
    "data:image/png;base64,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";
    doc.addImage(logoBase64, "PNG", 10, 8, 15, 15);

    // Título - centrado
    const title = `Pedido #${pedido.numeroPedido || numeroPedido}`;
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, 20, { align: "center" });

    // Fecha de emisión - centrada
    const fechaEmision = formatFechaHoraCompleta();
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha de emisión: ${fechaEmision}`, pageWidth / 2, 28, { align: "center" });

    // Fecha del pedido
    if (pedido.fechaPedido || pedido.fecha_pedido || pedido.createdAt) {
      const fechaPedido = formatFechaHoraCompleta(pedido.fechaPedido || pedido.fecha_pedido || pedido.createdAt);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Fecha del Pedido: ${fechaPedido}`, 14, 38);
    }

    // Información del cliente
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Datos del Cliente", 14, 45);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let yPos = 52;
    
    const nombreCompleto = `${pedido.clienteNombre || ""} ${pedido.clienteApellido || ""}`.trim();
    if (nombreCompleto) {
      doc.text(`Nombre: ${nombreCompleto}`, 14, yPos);
      yPos += 6;
    }
    
    if (pedido.clienteDocumento) {
      doc.text(`Documento: ${pedido.clienteDocumento}`, 14, yPos);
      yPos += 6;
    }
    
    if (pedido.clienteEmail) {
      doc.text(`Email: ${pedido.clienteEmail}`, 14, yPos);
      yPos += 6;
    }
    
    if (pedido.clienteTelefono) {
      doc.text(`Teléfono: ${pedido.clienteTelefono}`, 14, yPos);
      yPos += 6;
    }
    
    // Dirección completa
    if (pedido.clienteCalle && pedido.clienteNumero) {
      const direccion = `${pedido.clienteCalle} ${pedido.clienteNumero}${
        pedido.clientePiso ? ` Piso ${pedido.clientePiso}` : ""
      }${
        pedido.clienteDepartamento ? ` Depto ${pedido.clienteDepartamento}` : ""
      }`;
      doc.text(`Dirección: ${direccion}`, 14, yPos);
      yPos += 6;
      
      const localidad = `${pedido.clienteBarrio || ""}, ${pedido.clienteCiudad || ""} (CP: ${pedido.clienteCodigoPostal || "N/A"})`;
      doc.text(localidad, 14, yPos);
      yPos += 6;
    }

    // Información de envío (si existe)
    yPos += 4;
    if (pedido.empresaEnvio || pedido.numeroSeguimiento) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Información de Envío", 14, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      if (pedido.empresaEnvio) {
        doc.text(`Empresa: ${pedido.empresaEnvio}`, 14, yPos);
        yPos += 6;
      }
      
      if (pedido.numeroSeguimiento) {
        doc.text(`N° Seguimiento: ${pedido.numeroSeguimiento}`, 14, yPos);
        yPos += 6;
      }
    }

    // Tabla de productos
    yPos += 4;
    const tableData = prendas.map((prenda: any) => {
      // El precio_unitario del backend ya viene SIN descuentos
      const precioUnitarioSinDescuento = prenda.precio_unitario;
      const unidadesPorPresentacion = prenda.unidadesTotales / prenda.cantidadPresentaciones;
      const precioPorPresentacion = precioUnitarioSinDescuento * unidadesPorPresentacion;
      const subtotalSinDescuento = precioPorPresentacion * prenda.cantidadPresentaciones;

      return [
        prenda.nombre_producto || "-",
        prenda.nombrePresentacion || obtenerNombrePresentacion(prenda.idPresentacion) || "Unidad",
        prenda.talle || "-",
        prenda.color || "-",
        `$${Number(precioPorPresentacion).toLocaleString("es-AR", {
          minimumFractionDigits: 2,
        })}`,
        prenda.cantidadPresentaciones || prenda.cantidad || "-",
        `$${Number(subtotalSinDescuento).toLocaleString("es-AR", {
          minimumFractionDigits: 2,
        })}`,
      ];
    });

    autoTable(doc, {
      head: [
        [
          "Producto",
          "Presentación",
          "Talle",
          "Color",
          "Precio Unit.",
          "Cant.",
          "Subtotal",
        ],
      ],
      body: tableData,
      startY: yPos,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [254, 175, 0],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 45, halign: "left" }, // Producto
        1: { cellWidth: 28, halign: "center" }, // Presentación
        2: { cellWidth: 18, halign: "center" }, // Talle
        3: { cellWidth: 22, halign: "center" }, // Color
        4: { cellWidth: 26, halign: "right" }, // Precio Unit.
        5: { cellWidth: 16, halign: "center" }, // Cant.
        6: { cellWidth: 26, halign: "right" }, // Subtotal
      },
      didParseCell: function(data) {
        // Aplicar alineación específica según la columna para asegurar que se respete en header y body
        const columnIndex = data.column.index;
        if (columnIndex === 0) {
          data.cell.styles.halign = 'left';
        } else if (columnIndex === 1 || columnIndex === 2 || columnIndex === 3 || columnIndex === 5) {
          data.cell.styles.halign = 'center';
        } else if (columnIndex === 4 || columnIndex === 6) {
          data.cell.styles.halign = 'right';
        }
      },
    });

    // Obtener posición final de la tabla
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    // La columna Subtotal termina en: margen izquierdo (14) + ancho de todas las columnas
    const subtotalColumnEnd = 14 + 45 + 28 + 18 + 22 + 26 + 16 + 26; // = 181

    // Calcular descuentos de presentación y subtotal sin descuentos
    let descuentoCajaCerrada = 0;
    let descuentoPack = 0;
    let subtotalSinDescuentos = 0;
    
    console.log('=== Calculando descuentos de presentación ===');
    prendas.forEach((prenda: any) => {
      // descuento_por_item es un valor absoluto en pesos, no un porcentaje
      const descuentoItem = Number(prenda.descuento_por_item) || 0;
      
      console.log('Prenda:', {
        nombre: prenda.nombre_producto,
        idPresentacion: prenda.idPresentacion,
        descuento_por_item: prenda.descuento_por_item,
        descuentoItem: descuentoItem
      });
      
      // Calcular subtotal sin descuentos de esta prenda
      const precioUnitarioSinDescuento = prenda.precio_unitario;
      const unidadesPorPresentacion = prenda.unidadesTotales / prenda.cantidadPresentaciones;
      const precioPorPresentacion = precioUnitarioSinDescuento * unidadesPorPresentacion;
      const subtotalPrenda = precioPorPresentacion * prenda.cantidadPresentaciones;
      
      subtotalSinDescuentos += subtotalPrenda;
      
      if (prenda.idPresentacion === 2) { // Caja Cerrada
        descuentoCajaCerrada += descuentoItem;
        console.log('Agregando a descuento Caja Cerrada:', descuentoItem);
      } else if (prenda.idPresentacion === 3) { // Pack
        descuentoPack += descuentoItem;
        console.log('Agregando a descuento Pack:', descuentoItem);
      }
    });
    
    console.log('Totales descuentos:', {
      descuentoCajaCerrada,
      descuentoPack
    });

    // Subtotal - alineado con la columna Subtotal de la tabla
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", 14, finalY);
    doc.text(
      `$${Number(subtotalSinDescuentos).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
      })}`,
      subtotalColumnEnd,
      finalY,
      { align: "right" }
    );

    let currentY = finalY;

    // Descuento VIP (si aplica) - Se muestra primero porque se aplica sobre el subtotal
    if (pedido.descuentoOrden && Number(pedido.descuentoOrden) > 0) {
      currentY += 6;
      doc.setTextColor(218, 165, 32); // Color dorado
      doc.setLineWidth(0.05); // Grosor del contorno
      doc.text("Descuento VIP (10%):", 14, currentY, { renderingMode: "fillThenStroke" });
      doc.setLineWidth(0.05); // Grosor del contorno
      doc.text(
        `-$${Number(pedido.descuentoOrden).toLocaleString("es-AR", {
          minimumFractionDigits: 2,
        })}`,
        subtotalColumnEnd,
        currentY,
        { align: "right", renderingMode: "fillThenStroke" }
      );
      doc.setTextColor(0, 0, 0); // Volver a negro
    }

    // Espacio adicional si hay descuento VIP y descuentos de presentación
    if (pedido.descuentoOrden && Number(pedido.descuentoOrden) > 0 && 
        (descuentoCajaCerrada > 0 || descuentoPack > 0)) {
      currentY += 3;
    }

    // Descuento por Caja Cerrada (si aplica)
    if (descuentoCajaCerrada > 0) {
      currentY += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Descuento por Caja Cerrada (10%):", 14, currentY);
      doc.text(
        `-$${Number(descuentoCajaCerrada).toLocaleString("es-AR", {
          minimumFractionDigits: 2,
        })}`,
        subtotalColumnEnd,
        currentY,
        { align: "right" }
      );
    }

    // Descuento por Pack (si aplica)
    if (descuentoPack > 0) {
      currentY += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Descuento por Pack (5%):", 14, currentY);
      doc.text(
        `-$${Number(descuentoPack).toLocaleString("es-AR", {
          minimumFractionDigits: 2,
        })}`,
        subtotalColumnEnd,
        currentY,
        { align: "right" }
      );
    }

    // Total - alineado con la columna Subtotal de la tabla
    currentY += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL A PAGAR:", 14, currentY);
    doc.text(
      `$${Number(pedido.total || 0).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
      })}`,
      subtotalColumnEnd,
      currentY,
      { align: "right" }
    );

    // Pie de página
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text(
      "Gracias por su compra - HARDWAY",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    // Guardar PDF
    doc.save(`Pedido_${pedido.numeroPedido || numeroPedido}_HARDWAY.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error al generar PDF del pedido:", error);
    throw error;
  }
};
