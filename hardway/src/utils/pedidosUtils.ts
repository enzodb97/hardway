// src/utils/pedidosUtils.ts
import axios from "axios";
import { Cliente } from "../context/ClientesContext";

export interface Pedido {
  id: number;
  descripcion: string;
  fecha: string;
  estado: string;
  clienteId: number;
  Cliente?: Cliente;
}

export interface PedidoForm {
  descripcion: string;
  fecha: string;
  estado: string;
  clienteId: string;
}

// Obtener todos los pedidos
export const cargarPedidos = async (): Promise<Pedido[]> => {
  const res = await axios.get("/api/pedidos");
  return res.data;
};

// Crear un pedido
export const crearPedido = async (pedido: Omit<Pedido, "id">) => {
  return await axios.post("/api/pedidos", pedido);
};

// Validar campos obligatorios de un pedido
export function validarCamposPedido(form: PedidoForm): string | null {
  if (!form.descripcion.trim()) return "La descripción es obligatoria.";
  if (!form.fecha) return "La fecha es obligatoria.";
  if (!form.clienteId) return "Debe seleccionar un cliente.";
  return null;
}

// Filtrar pedidos por texto (cliente, fecha, id)
export function filtrarPedidos(pedidos: Pedido[], texto: string): Pedido[] {
  const normalizado = texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (normalizado === "") return pedidos;

  return pedidos.filter((pedido) => {
    const nombreCliente = (pedido.Cliente?.nombre || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const fecha = (pedido.fecha || "").toLowerCase();
    const id = pedido.id.toString();

    return (
      nombreCliente.includes(normalizado) ||
      fecha.includes(normalizado) ||
      id.includes(normalizado)
    );
  });
}

/**
 * Devuelve la fecha y hora actual en formato YYYY-MM-DD HH:mm:ss para Argentina (GMT-3)
 */
export function obtenerFechaHoraArgentina(): string {
  const now = new Date();
  // Obtener los componentes en UTC y restar 3 horas para Argentina
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  let hour = now.getUTCHours() - 3;
  // Ajustar día si la hora es negativa
  let adjDay = day;
  if (hour < 0) {
    hour += 24;
    adjDay -= 1;
  }
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${year}-${pad(month)}-${pad(adjDay)} ${pad(hour)}:${pad(
    now.getUTCMinutes()
  )}:${pad(now.getUTCSeconds())}`;
}

/**
 * Devuelve la lista de clientes filtrada por nombre, ignorando tildes/acentos.
 */
export function filtrarClientesPorNombre(
  clientes: Cliente[],
  filtro: string
): Cliente[] {
  const normalizado = filtro
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return clientes.filter((c) => {
    const nombreNormalizado = c.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const dni = c.numeroDocumento ? c.numeroDocumento.toString() : "";
    return nombreNormalizado.includes(normalizado) || dni.includes(normalizado);
  });
}
