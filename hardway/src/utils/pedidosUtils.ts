// src/utils/pedidosUtils.ts
import axios from "axios";
import { Cliente } from "../context/ClientesContext";

export interface Pedido {
  id: number;
  descripcion: string;
  fecha: string;
  estado: string;
  clienteId: number;
  cliente?: Cliente;
}

export const cargarPedidos = async (): Promise<Pedido[]> => {
  const res = await axios.get("/api/pedidos");
  return res.data;
};

export const crearPedido = async (pedido: Omit<Pedido, "id">) => {
  return await axios.post("/api/pedidos", pedido);
};