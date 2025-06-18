// src/utils/pedidosPagoUtils.ts
import axios from "axios";

// Cambia el estado de un pedido a Abonado (idEstado = 3)
export const marcarPedidoComoAbonado = async (numeroPedido: string) => {
  // Puedes cambiar el endpoint si decides hacer uno específico
  return await axios.put(`/api/pedidos/${numeroPedido}/abonado`);
};
