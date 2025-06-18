import axios from "axios";

export interface PedidoEnvio {
  numeroPedido: string;
  fechaPedido: string;
  cliente_email: string;
  nombre: string;
  apellido: string;
  direccion_envio: string;
  total_items: number;
  codigoSeguimiento?: string;
}

// Trae todos los pedidos con estado 'Abonado' (idEstado = 3)
export const obtenerPedidosAbonados = async (): Promise<PedidoEnvio[]> => {
  const res = await axios.get("/api/envios/pendientes"); // endpoint sugerido
  return res.data;
};

// Marca un pedido como despachado y guarda el código de seguimiento
export const despacharPedido = async (
  numeroPedido: string,
  codigoSeguimiento: string
) => {
  await axios.put(`/api/envios/despachar/${numeroPedido}`, {
    codigoSeguimiento,
  });
};
