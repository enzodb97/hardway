// src/utils/pedidosUtils.ts
import axios from "axios";
import { checkmarkCircle, closeCircle, time, cash, airplane, ribbon } from "ionicons/icons";

// Interfaces según tu backend
export interface Persona {
  nombre: string;
  apellido: string;
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
  EstadoPedido?: EstadoPedido;
  Cliente?: Cliente;
  // otros campos si necesitas
}

// Obtener todos los pedidos
export const cargarPedidos = async (): Promise<Pedido[]> => {
  const res = await axios.get("/api/pedidos");
  return res.data;
};

// Crear un pedido
export const crearPedido = async (pedido: Omit<Pedido, "numeroPedido">) => {
  return await axios.post("/api/pedidos", pedido);
};

// Eliminar un pedido por numeroPedido
export const eliminarPedido = async (numeroPedido: string) => {
  await axios.delete(`/api/pedidos/${numeroPedido}`);
};

// Editar un pedido por numeroPedido
export const editarPedido = async (numeroPedido: string, datos: any) => {
  await axios.put(`/api/pedidos/${numeroPedido}`, datos);
};

// Filtrar pedidos por texto (cliente, fecha, numeroPedido)
export function filtrarPedidos(pedidos: Pedido[], filtro: string): Pedido[] {
  if (!filtro) return pedidos;

  const normalizar = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtroNorm = normalizar(filtro);

  return pedidos.filter(
    (p) =>
      (p.numeroPedido && normalizar(p.numeroPedido).includes(filtroNorm)) ||
      (p.fechaPedido && normalizar(p.fechaPedido).includes(filtroNorm)) ||
      (p.Cliente?.Persona?.nombre &&
        normalizar(p.Cliente.Persona.nombre).includes(filtroNorm)) ||
      (p.Cliente?.Persona?.apellido &&
        normalizar(p.Cliente.Persona.apellido).includes(filtroNorm))
  );
}

// Devuelve la clase CSS según el estado del pedido
export function obtenerClaseDeEstado(estado: string): string {
  const mapa: Record<string, string> = {
    "En curso": "status--en-curso",
    "Pendiente de Pago": "status--pendiente-pago",
    "Abonado": "status--abonado",
    "Despachado": "status--despachado",
    "Finalizado": "status--finalizado",
    "Cancelado": "status--cancelado",
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
