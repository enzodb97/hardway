// src/utils/pedidosPagoUtils.ts
import axiosInstance from "../config/axios";

// Cambia el estado de un pedido a Abonado (idEstado = 3)
export const marcarPedidoComoAbonado = async (numeroPedido: string) => {
  // Puedes cambiar el endpoint si decides hacer uno específico
  return await axiosInstance.put(`/api/pedidos/${numeroPedido}/abonado`);
};
