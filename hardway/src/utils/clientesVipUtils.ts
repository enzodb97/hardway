// src/utils/clientesVipUtils.ts
import axiosInstance from "../config/axios";

/**
 * Utilidades para consultar la vista SQL `vista_clientes_vip` desde el backend.
 * Todas las funciones retornan datos en tiempo real, ya que la VIEW siempre está actualizada.
 */

// 1. Obtener todos los clientes VIP
export const getAllClientesVip = async () => {
  const res = await axiosInstance.get("/api/clientes/vip");
  return res.data;
};

// 2. Obtener el Top 5 de clientes VIP por monto gastado
enum Orden {
  ASC = "ASC",
  DESC = "DESC",
}
export const getTopClientesVip = async (
  limit = 5,
  order: Orden = Orden.DESC
) => {
  const res = await axiosInstance.get(
    `/api/clientes/vip/top?limit=${limit}&order=${order}`
  );
  return res.data;
};

// 3. Buscar un cliente VIP por nombre
export const findClienteVipByName = async (nombre: string) => {
  const res = await axiosInstance.get(
    `/api/clientes/vip?nombre=${encodeURIComponent(nombre)}`
  );
  return res.data;
};

// 4. Contar la cantidad de clientes VIP
export const countClientesVip = async () => {
  const res = await axiosInstance.get("/api/clientes/vip/count");
  return res.data.total_vips;
};

export type ClienteVip = {
  idCliente: number;
  nombre: string;
  apellido: string;
  monto_total_gastado: number;
};

export { Orden };
