// Tipos para el sistema de presentaciones de productos

export interface PresentacionProducto {
  idPresentacion: number;
  nombrePresentacion: string;
  descripcion: string;
  porcentajeDescuento?: number; // Porcentaje de descuento (0-100)
}

export interface ConfiguracionPresentacion {
  idConfiguracion: number;
  codigoIndumentaria: string;
  idPresentacion: number;
  cantidadUnidades: number;
  precioBase: number | null;
  estaActivo: number;
  Presentacion: PresentacionProducto;
}

export interface DetallePedidoConPresentacion {
  idDetallePedido?: number;
  numeroPedido?: number;
  codigoIndumentaria: string;
  cantidad: number;
  descuentoItem?: number;
  idPresentacion?: number;
  cantidadPresentaciones?: number;
  unidadesTotales?: number;
}
