import axiosInstance from "../config/axios";

export interface ProductoMasPedido {
  nombreProducto: string;
  totalPedidos: number;
}

export const obtenerProductosMasPedidos = async (): Promise<
  ProductoMasPedido[]
> => {
  const res = await axiosInstance.get("/api/reportes/productos-mas-pedidos");
  return res.data;
};
