import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonMenuButton,
  IonIcon,
  useIonViewWillEnter,
} from "@ionic/react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { documentTextOutline } from "ionicons/icons";
import "./DetallePedido.css";
import zepelin from "../../assets/images/zepelin.png";
import axiosInstance from "../../config/axios";
import { exportarPDFDetallePedido } from "../../utils/pedidosUtils";
import { obtenerHistorialModificaciones } from "../../utils/pedidosUtils";

const DetallePedido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const location = useLocation();
  const [prendas, setPrendas] = useState<any[]>([]);
  const [pedido, setPedido] = useState<any>(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [historialModificaciones, setHistorialModificaciones] = useState<any[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Función reutilizable para cargar el pedido
  const cargarPedido = async () => {
    try {
      const res = await axiosInstance.get(`/api/pedidos/${id}/detalle-plano`);
      setPrendas(res.data.items || []);
      setPedido(res.data.pedido);
      
      // Debug: verificar los datos del pedido
      console.log("📦 Datos del pedido recibidos:", res.data.pedido);
      console.log("🚚 Empresa de envío:", res.data.pedido?.empresaEnvio);
      console.log("📋 Número de seguimiento:", res.data.pedido?.numeroSeguimiento);

      // Cargar historial de modificaciones si el pedido existe
      if (res.data.pedido?.numeroPedido) {
        console.log("🔍 Cargando historial para pedido:", res.data.pedido.numeroPedido);
        const historial = await obtenerHistorialModificaciones(res.data.pedido.numeroPedido);
        console.log("📜 Historial recibido:", historial);
        console.log("📊 Cantidad de registros:", historial.length);
        setHistorialModificaciones(historial);
      }
    } catch (error) {
      console.error("Error al cargar pedido:", error);
    }
  };

  // Cargar pedido cuando se entra a la vista (navegación Ionic)
  useIonViewWillEnter(() => {
    cargarPedido();
  });

  // Cargar pedido cuando cambia la ubicación (redirecciones)
  useEffect(() => {
    if (location.pathname.includes(`/detalle-pedido/${id}`)) {
      cargarPedido();
    }
  }, [location, id]);

  // Cargar pedido al montar el componente (mantener para compatibilidad)
  useEffect(() => {
    cargarPedido();
    // eslint-disable-next-line
  }, [id]);

  // Función para mostrar valores amigables
  const mostrar = (valor: any) => {
    if (valor === null || valor === undefined || valor === "") return "-";
    return valor;
  };

  const mostrarPrecio = (valor: any) => {
    if (valor === null || valor === undefined || isNaN(Number(valor)))
      return "-";
    return Number(valor).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  };

  // Función para generar PDF
  const handleGenerarPDF = async () => {
    setGenerandoPDF(true);
    try {
      await exportarPDFDetallePedido(id);
      alert("PDF generado exitosamente");
    } catch (error) {
      alert("Error al generar el PDF");
      console.error("Error:", error);
    } finally {
      setGenerandoPDF(false);
    }
  };

  // Configuración de estados y progreso
  const estadosPedido = [
    {
      id: 1,
      nombre: "En Curso",
      icono: "📋",
      descripcion: "Pedido creado",
      key: "creado",
    },
    {
      id: 2,
      nombre: "Pendiente de Pago",
      icono: "💳",
      descripcion: "Esperando pago",
      key: "pago",
    },
    {
      id: 3,
      nombre: "Abonado",
      icono: "✅",
      descripcion: "Pago confirmado",
      key: "abonado",
    },
    {
      id: 4,
      nombre: "Despachado",
      icono: "🚚",
      descripcion: "En camino",
      key: "enviado",
    },
    {
      id: 5,
      nombre: "Finalizado",
      icono: "🏠",
      descripcion: "Entregado",
      key: "entregado",
    },
  ];

  const obtenerProgresoActual = () => {
    if (!pedido) return 0;

    // Si está cancelado, retornar estado especial
    if (pedido.idEstado === 6) return -1;

    const estadoActual = estadosPedido.findIndex(
      (estado) => estado.id === pedido.idEstado
    );
    return estadoActual >= 0 ? estadoActual : 0;
  };

  const BarraProgreso = () => {
    const progresoActual = obtenerProgresoActual();

    // Si está cancelado, mostrar barra especial
    if (progresoActual === -1) {
      return (
        <div className="barra-progreso-container">
          <div className="progreso-cancelado">
            <div className="estado-cancelado">
              <div className="circulo-cancelado">
                <span className="icono-cancelado">❌</span>
              </div>
              <div className="info-estado-cancelado">
                <span className="nombre-estado-cancelado">
                  Pedido Cancelado
                </span>
                <span className="descripcion-estado-cancelado">
                  El pedido ha sido cancelado
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="barra-progreso-container">
        <div className="barra-progreso">
          {estadosPedido.map((estado, index) => (
            <div key={estado.id} className="paso-progreso">
              <div
                className={`paso-contenido ${
                  index <= progresoActual ? "completado" : "pendiente"
                }`}
              >
                <div
                  className={`circulo-estado ${
                    index <= progresoActual ? "activo" : ""
                  } ${index === progresoActual ? "actual" : ""}`}
                >
                  <span className="icono-estado">{estado.icono}</span>
                </div>
                <div className="info-estado">
                  <span className="nombre-estado">{estado.nombre}</span>
                  <span className="descripcion-estado">
                    {estado.descripcion}
                  </span>
                </div>
              </div>
              {index < estadosPedido.length - 1 && (
                <div
                  className={`linea-conexion ${
                    index < progresoActual ? "completada" : "pendiente"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <IonPage className="detalle-pedido-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Detalle de Pedido</IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            onClick={handleGenerarPDF}
            disabled={generandoPDF}
          >
            <IonIcon icon={documentTextOutline} slot="start" />
            {generandoPDF ? "Generando..." : "Emitir PDF"}
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h2 className="detalle-pedido-titulo">
          <img src={zepelin} alt="Ícono Hardway" className="brand-logo" />{" "}
          Detalle de Pedido #{pedido?.numeroPedido || id}
        </h2>

        {/* Barra de progreso del pedido */}
        {pedido && <BarraProgreso />}

        {/* Información del Cliente */}
        {pedido && (
          <div className="cliente-info-cards">
            <h3>📋 Información del Cliente</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Nombre completo:</strong>{" "}
                {`${mostrar(pedido.clienteNombre)} ${mostrar(pedido.clienteApellido)}`.trim()}
              </div>
              <div className="info-item">
                <strong>Documento:</strong> {mostrar(pedido.clienteDocumento)}
              </div>
              <div className="info-item">
                <strong>Email:</strong> {mostrar(pedido.clienteEmail)}
              </div>
              <div className="info-item">
                <strong>Teléfono:</strong> {mostrar(pedido.clienteTelefono)}
              </div>
              <div className="info-item full-width">
                <strong>Dirección:</strong>{" "}
                {pedido.clienteCalle && pedido.clienteNumero
                  ? `${pedido.clienteCalle} ${pedido.clienteNumero}${
                      pedido.clientePiso ? ` Piso ${pedido.clientePiso}` : ""
                    }${
                      pedido.clienteDepartamento
                        ? ` Depto ${pedido.clienteDepartamento}`
                        : ""
                    }, ${pedido.clienteBarrio || ""}, ${
                      pedido.clienteCiudad || ""
                    } (CP: ${pedido.clienteCodigoPostal || "N/A"})`
                  : "-"}
              </div>
            </div>
          </div>
        )}

        {/* Información de Envío */}
        {pedido && (pedido.empresaEnvio || pedido.numeroSeguimiento) && (
          <div className="envio-info-card">
            <h3>🚚 Información de Envío</h3>
            <div className="info-grid">
              {pedido.empresaEnvio && (
                <div className="info-item">
                  <strong>Empresa de envío:</strong>{" "}
                  <span className="empresa-badge">{pedido.empresaEnvio}</span>
                </div>
              )}
              {pedido.numeroSeguimiento && (
                <div className="info-item">
                  <strong>Número de seguimiento:</strong>{" "}
                  <span className="tracking-number">{pedido.numeroSeguimiento}</span>
                </div>
              )}
              {!pedido.numeroSeguimiento && pedido.empresaEnvio && (
                <div className="info-item" style={{ color: '#64748b', fontStyle: 'italic' }}>
                  <strong>Número de seguimiento:</strong> Aún no asignado
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información del estado del pedido */}
        {pedido && (
          <div className="pedido-info-card">
            <p>
              <strong>Estado:</strong> {pedido.tipoEstado}
            </p>
          </div>
        )}

        {/* Mostrar información del usuario que creó el pedido */}
        {pedido && pedido.usuarioCreo && (
          <div className="usuario-creacion-card">
            <h3>Información de Creación</h3>
            <p className="usuario-creacion">
              <strong>Creado por:</strong> {pedido.usuarioCreo}
            </p>
            <p className="usuario-creacion">
              <strong>Fecha del pedido:</strong>{" "}
              {pedido.fechaPedido
                ? new Date(pedido.fechaPedido).toLocaleString("es-AR")
                : "-"}
            </p>
          </div>
        )}

        {/* Mostrar información de modificación si existe y es diferente a la fecha de creación */}
        {pedido &&
          pedido.fechaModificacion &&
          pedido.fechaPedido &&
          new Date(pedido.fechaModificacion).getTime() !==
            new Date(pedido.fechaPedido).getTime() && (
            <div className="modificacion-pedido-card">
              <h3>📜 Historial de Modificaciones</h3>
              
              {/* Información de última modificación */}
              <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p className="fecha-modificacion" style={{ marginBottom: '8px' }}>
                  <strong>Última modificación:</strong>{" "}
                  {new Date(pedido.fechaModificacion).toLocaleString("es-AR")}
                </p>
                {pedido.usuarioModifico && (
                  <p className="fecha-modificacion" style={{ marginBottom: '0' }}>
                    <strong>Modificado por:</strong> {pedido.usuarioModifico}
                  </p>
                )}
              </div>

              {/* Historial detallado de cambios */}
              {historialModificaciones.length > 0 && (
                <div className="historial-detallado">
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      padding: '10px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}
                    onClick={() => setMostrarHistorial(!mostrarHistorial)}
                  >
                    <h4 style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
                      📋 Registro de Cambios ({historialModificaciones.length})
                    </h4>
                    <span style={{ fontSize: '18px', color: '#64748b' }}>
                      {mostrarHistorial ? '▼' : '▶'}
                    </span>
                  </div>
                  
                  {mostrarHistorial && (
                    <div>
                      {historialModificaciones.map((item, index) => (
                        <div 
                          key={item.idHistorial} 
                          className="historial-item"
                          style={{
                            padding: '16px',
                            marginBottom: '12px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            borderLeft: '4px solid #fdb40b'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <div>
                              <strong style={{ color: '#1e293b', fontSize: '14px' }}>
                                {item.descripcion}
                              </strong>
                              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                📅 {new Date(item.fechaModificacion).toLocaleString("es-AR")}
                              </div>
                            </div>
                            <span 
                              style={{ 
                                fontSize: '11px', 
                                padding: '4px 8px', 
                                backgroundColor: '#e0f2fe', 
                                color: '#0369a1',
                                borderRadius: '4px',
                                fontWeight: '600'
                              }}
                            >
                              {item.tipoModificacion}
                            </span>
                          </div>
                          
                          {/* Motivo */}
                          <div style={{ marginTop: '8px', fontSize: '13px' }}>
                            <strong style={{ color: '#475569' }}>Motivo:</strong>{" "}
                            <span style={{ color: '#64748b' }}>
                              {item.Motivo?.descripcion || 'No especificado'}
                            </span>
                          </div>

                          {/* Usuario que modificó */}
                          <div style={{ marginTop: '4px', fontSize: '13px' }}>
                            <strong style={{ color: '#475569' }}>Modificado por:</strong>{" "}
                            <span style={{ color: '#64748b' }}>
                              {item.UsuarioModificador?.nombreUsuario || 'Usuario desconocido'}
                            </span>
                          </div>

                          {/* Detalles del cambio según el tipo */}
                          {item.tipoModificacion === 'Se modifico la cantidad de un producto' && (
                            <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                              <strong style={{ color: '#475569' }}>Cambio:</strong> {item.cantidadAnterior} → {item.cantidadNueva} unidades
                            </div>
                          )}

                          {item.tipoModificacion === 'Envio' && (
                            <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                              <strong style={{ color: '#475569' }}>Cambio de envío:</strong> {item.valorAnterior} → {item.valorNuevo}
                            </div>
                          )}

                          {/* Observaciones si existen */}
                          {item.observaciones && (
                            <div 
                              style={{ 
                                marginTop: '12px', 
                                padding: '10px', 
                                backgroundColor: '#fef3c7', 
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#92400e'
                              }}
                            >
                              <strong>💬 Observaciones:</strong>
                              <div style={{ marginTop: '4px' }}>{item.observaciones}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Mostrar motivo de cancelación solo si el pedido está cancelado */}
        {pedido && pedido.idEstado === 6 && pedido.motivoCancelacion && (
          <div className="motivo-cancelacion-card">
            <h3>Motivo de Cancelación</h3>
            <p>
              <strong>Motivo:</strong> {pedido.motivoCancelacion}
            </p>

            {/* Mostrar fecha de cancelación */}
            {pedido.fechaCancelacion && (
              <p className="fecha-cancelacion">
                <strong>Fecha de cancelación:</strong>{" "}
                {new Date(pedido.fechaCancelacion).toLocaleString("es-AR")}
              </p>
            )}

            {/* Mostrar observación personalizada si existe */}
            {pedido.observacionCancelacion && (
              <div className="observacion-cancelacion">
                <p>
                  <strong>Observación:</strong>
                </p>
                <div className="observacion-texto">
                  {pedido.observacionCancelacion}
                </div>
              </div>
            )}

            {pedido.usuarioCancelo && (
              <p className="motivo-cancelacion">
                <strong>Cancelado por:</strong> {pedido.usuarioCancelo}
              </p>
            )}
          </div>
        )}

        <div className="productos-section">
          <div className="productos-section-header">
            <h3>Detalle de Productos</h3>
          </div>

          <table className="productos-tabla">
            <thead className="productos-tabla-header">
              <tr>
                <th>Producto</th>
                <th>Talle</th>
                <th>Color</th>
                <th>Precio Unit.</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody className="productos-tabla-body">
              {prendas.map((prenda, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="producto-nombre">
                      {mostrar(prenda.nombre_producto)}
                    </span>
                  </td>
                  <td>
                    <span className="producto-badge producto-badge-talle">
                      {mostrar(prenda.talle)}
                    </span>
                  </td>
                  <td>
                    <span className="producto-badge producto-badge-color">
                      {mostrar(prenda.color)}
                    </span>
                  </td>
                  <td>
                    <span className="producto-precio">
                      {mostrarPrecio(prenda.precio_unitario)}
                    </span>
                  </td>
                  <td>
                    <span className="producto-cantidad">
                      {mostrar(prenda.cantidad)}
                    </span>
                  </td>
                  <td>
                    <span className="producto-subtotal">
                      {mostrarPrecio(prenda.subtotal)}
                    </span>
                    {prenda.descuento_por_item &&
                      Number(prenda.descuento_por_item) > 0 && (
                        <div className="producto-descuento">
                          -{mostrarPrecio(prenda.descuento_por_item)}
                        </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="tabla-resumen">
            {/* Subtotal */}
            <div className="tabla-resumen-row tabla-resumen-row-subtotal">
              <span className="tabla-resumen-label">Subtotal:</span>
              <span className="tabla-resumen-valor">
                {mostrarPrecio(pedido?.subtotal)}
              </span>
            </div>

            {/* Descuento VIP */}
            {pedido &&
              pedido.descuentoOrden &&
              Number(pedido.descuentoOrden) > 0 && (
                <div className="tabla-resumen-row tabla-resumen-row-descuento">
                  <span className="tabla-resumen-label">
                    👑 Cliente VIP - 10% de descuento:
                  </span>
                  <span className="tabla-resumen-valor">
                    -{mostrarPrecio(pedido.descuentoOrden)}
                  </span>
                </div>
              )}

            {/* Total */}
            {pedido && (
              <div className="tabla-resumen-row tabla-resumen-row-total">
                <span className="tabla-resumen-label">💰 Total a pagar:</span>
                <span className="tabla-resumen-valor">
                  {mostrarPrecio(Number(pedido.total))}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="productos-separador"></div>
        <IonButton
          expand="block"
          onClick={() => history.goBack()}
          style={{
            marginTop: 24,
            width: "50%",
            marginLeft: "25%",
            padding: "40px",
          }}
        >
          Volver
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default DetallePedido;
