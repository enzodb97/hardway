// Servicio para gestionar presentaciones de productos
import axiosInstance from "../config/axios";
import { ConfiguracionPresentacion, PresentacionProducto } from "../types/presentaciones";

/**
 * Obtiene todas las presentaciones disponibles (Unidad, Caja Cerrada, Pack)
 */
export const obtenerPresentaciones = async (): Promise<PresentacionProducto[]> => {
  const response = await axiosInstance.get("/api/presentaciones");
  return response.data;
};

/**
 * Obtiene las configuraciones de presentación para un producto específico
 * @param codigoIndumentaria - Código del producto
 */
export const obtenerConfiguracionesPorProducto = async (
  codigoIndumentaria: string
): Promise<ConfiguracionPresentacion[]> => {
  const response = await axiosInstance.get(
    `/api/presentaciones/configuraciones/${codigoIndumentaria}`
  );
  return response.data;
};

/**
 * Verifica el estado de las configuraciones y las inicializa si es necesario
 */
export const verificarEstadoConfiguraciones = async () => {
  const response = await axiosInstance.get(
    "/api/presentaciones/configuraciones/verificar/estado"
  );
  return response.data;
};

/**
 * Crea o actualiza una configuración de presentación
 */
export const guardarConfiguracion = async (configuracion: {
  codigoIndumentaria: string;
  idPresentacion: number;
  cantidadUnidades: number;
  precioBase?: number | null;
}) => {
  const response = await axiosInstance.post(
    "/api/presentaciones/configuraciones",
    configuracion
  );
  return response.data;
};

/**
 * Desactiva una configuración de presentación
 */
export const eliminarConfiguracion = async (idConfiguracion: number) => {
  const response = await axiosInstance.delete(
    `/api/presentaciones/configuraciones/${idConfiguracion}`
  );
  return response.data;
};

/**
 * Actualiza el porcentaje de descuento de una presentación
 * @param idPresentacion - ID de la presentación (1=Unidad, 2=Caja Cerrada, 3=Pack)
 * @param porcentajeDescuento - Nuevo porcentaje de descuento (0-100, solo enteros)
 */
export const actualizarPorcentajeDescuento = async (
  idPresentacion: number,
  porcentajeDescuento: number
): Promise<any> => {
  // Asegurar que sea un número entero
  const porcentajeEntero = Math.round(Math.abs(porcentajeDescuento));
  
  if (porcentajeEntero < 0 || porcentajeEntero > 100) {
    throw new Error("El porcentaje debe estar entre 0 y 100");
  }

  if (!Number.isInteger(porcentajeEntero)) {
    throw new Error("El porcentaje debe ser un número entero");
  }

  const response = await axiosInstance.put(
    `/api/presentaciones/${idPresentacion}/descuento`,
    { porcentajeDescuento: porcentajeEntero }
  );
  return response.data;
};
