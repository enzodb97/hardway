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
  despachadorAsignado?: string;
  nombreDespachador?: string;
}

// Trae todos los pedidos con estado 'Abonado' (idEstado = 3) y 'Despachado' (idEstado = 4)
export const obtenerPedidosAbonados = async (rol?: string, legajoPicker?: string): Promise<PedidoEnvio[]> => {
  console.log("🚚 Iniciando obtenerPedidosAbonados...");
  console.log("📋 Parámetros:", { rol, legajoPicker });
  try {
    const params = new URLSearchParams();
    if (rol) params.append('rol', rol);
    if (legajoPicker) params.append('legajoPicker', legajoPicker);
    
    const url = `/api/envios/pendientes${params.toString() ? '?' + params.toString() : ''}`;
    console.log("🌐 URL de consulta:", url);
    
    const res = await axiosInstance.get(url);
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

// Actualiza el código de seguimiento de un pedido ya despachado
export const actualizarCodigoSeguimiento = async (
  numeroPedido: string,
  codigoSeguimiento: string
) => {
  await axiosInstance.put(`/api/envios/actualizar-codigo/${numeroPedido}`, {
    codigoSeguimiento,
  });
};
