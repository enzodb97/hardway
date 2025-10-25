import axiosInstance from "../config/axios";

export interface PedidoEnvio {
  numeroPedido: string;
  fechaPedido: string;
  cliente_email: string;
  nombre: string;
  apellido: string;
  direccion_envio: string;
  total_items: number;
  codigoSeguimiento?: string;
  idEmpresaEnvio?: number;
  empresaEnvio?: string;
  idEstado: number;
}

// Trae todos los pedidos con estado 'Abonado' (idEstado = 3)
export const obtenerPedidosAbonados = async (): Promise<PedidoEnvio[]> => {
  console.log("🚚 Iniciando obtenerPedidosAbonados...");
  try {
    const res = await axiosInstance.get("/api/envios/pendientes");
    console.log("✅ Respuesta de envíos:", res.data.length, "pedidos");
    return res.data;
  } catch (error) {
    console.error("❌ Error en obtenerPedidosAbonados:", error);
    throw error;
  }
};

// Marca un pedido como despachado y guarda el código de seguimiento
export const despacharPedido = async (
  numeroPedido: string,
  codigoSeguimiento: string
) => {
  await axiosInstance.put(`/api/envios/despachar/${numeroPedido}`, {
    codigoSeguimiento,
  });
};
