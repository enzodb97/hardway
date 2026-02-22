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
  IonModal,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonAlert,
  IonList,
  IonItem,
  IonLabel,
  IonSearchbar,
} from "@ionic/react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { documentTextOutline, checkmarkCircleOutline, closeCircleOutline } from "ionicons/icons";
import "./DetallePedido.css";
import zepelin from "../../assets/images/zepelin.png";
import axiosInstance from "../../config/axios";
import { exportarPDFDetallePedido, handleCancelarPedido, cargarPedidos } from "../../utils/pedidosUtils";
import { obtenerHistorialModificaciones } from "../../utils/pedidosUtils";
import { obtenerNotificacionesPedido, resolverNotificacion } from "../../utils/pickingUtils";
import { obtenerIndumentariaPaginada } from "../../utils/indumentariaUtils";
import { useAuth } from "../../context/AuthContext";

const DetallePedido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const location = useLocation();
  const { username } = useAuth();
  const [prendas, setPrendas] = useState<any[]>([]);
  const [pedido, setPedido] = useState<any>(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [historialModificaciones, setHistorialModificaciones] = useState<any[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [notificacionesProblemas, setNotificacionesProblemas] = useState<any[]>([]);
  
  // Estados para resolución de notificaciones
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState<any>(null);
  const [tipoResolucionSeleccionada, setTipoResolucionSeleccionada] = useState<string>("");
  const [showModalResolucion, setShowModalResolucion] = useState(false);
  const [observacionesResolucion, setObservacionesResolucion] = useState("");
  const [nuevaCantidad, setNuevaCantidad] = useState<number>(0);
  const [productoAlternativo, setProductoAlternativo] = useState<any>(null);
  const [indumentariasDisponibles, setIndumentariasDisponibles] = useState<any[]>([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [showAlertResolucion, setShowAlertResolucion] = useState(false);
  const [alertMsgResolucion, setAlertMsgResolucion] = useState("");
  const [procesandoResolucion, setProcesandoResolucion] = useState(false);

  // Estados para cancelación de pedido
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState<string | null>(null);
  const [motivosCancelacion, setMotivosCancelacion] = useState<any[]>([]);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<number | null>(null);
  const [observacionPersonalizada, setObservacionPersonalizada] = useState<string>("");
  const [showMotivoModal, setShowMotivoModal] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  // Calcular descuentos por presentación
  const calcularDescuentosPresentacion = () => {
    let descuentoPacks = 0;
    let descuentoCajasCerradas = 0;
    let subtotalOriginal = 0;

    prendas.forEach((prenda) => {
      const precioUnitario = Number(prenda.precio_unitario) || 0;
      const cantidad = Number(prenda.cantidad) || 0;
      const subtotalPrendaOriginal = precioUnitario * cantidad;
      
      // Acumular subtotal original (sin descuentos de presentación)
      subtotalOriginal += subtotalPrendaOriginal;
      
      // Aplicar descuentos según idPresentacion
      // idPresentacion: 1=Unidad, 2=Caja Cerrada, 3=Pack
      const idPres = prenda.idPresentacion || 1;
      
      if (idPres === 3) {
        // Pack: 5% de descuento
        const descuento = subtotalPrendaOriginal * 0.05;
        descuentoPacks += descuento;
      } else if (idPres === 2) {
        // Caja Cerrada: 10% de descuento
        const descuento = subtotalPrendaOriginal * 0.10;
        descuentoCajasCerradas += descuento;
      }
    });

    return { 
      descuentoPacks, 
      descuentoCajasCerradas, 
      subtotalOriginal,
      totalConDescuentosPresentacion: subtotalOriginal - descuentoPacks - descuentoCajasCerradas
    };
  };

  const { descuentoPacks, descuentoCajasCerradas, subtotalOriginal, totalConDescuentosPresentacion } = calcularDescuentosPresentacion();

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
        
        // Cargar notificaciones de problemas
        try {
          const notificaciones = await obtenerNotificacionesPedido(res.data.pedido.numeroPedido);
          console.log("⚠️ Notificaciones de problemas:", notificaciones);
          setNotificacionesProblemas(notificaciones);
        } catch (error) {
          console.error("Error al cargar notificaciones:", error);
          setNotificacionesProblemas([]);
        }
      }
    } catch (error) {
      console.error("Error al cargar pedido:", error);
    }
  };

  // ==========================================
  // FUNCIONES DE RESOLUCIÓN DE NOTIFICACIONES
  // ==========================================

  const abrirModalResolucion = async (notificacion: any, tipoResolucion: string) => {
    setNotificacionSeleccionada(notificacion);
    setTipoResolucionSeleccionada(tipoResolucion);
    setObservacionesResolucion("");
    setNuevaCantidad(0);
    setProductoAlternativo(null);
    setBusquedaProducto("");
    
    // Si es producto alternativo, cargar indumentarias disponibles
    if (tipoResolucion === 'producto_alternativo') {
      try {
        const result = await obtenerIndumentariaPaginada(1, 1000, "");
        setIndumentariasDisponibles(result.prendas);
      } catch (error) {
        console.error("Error al cargar indumentarias:", error);
        setIndumentariasDisponibles([]);
      }
    }
    
    setShowModalResolucion(true);
  };

  const procesarResolucion = async () => {
    if (!notificacionSeleccionada || !tipoResolucionSeleccionada) return;
    
    // Validaciones según tipo de resolución
    if (tipoResolucionSeleccionada === 'reducir_cantidad') {
      if (!nuevaCantidad || nuevaCantidad <= 0) {
        setAlertMsgResolucion("Debe especificar una cantidad válida mayor a 0");
        setShowAlertResolucion(true);
        return;
      }
    }
    
    if (tipoResolucionSeleccionada === 'producto_alternativo') {
      if (!productoAlternativo) {
        setAlertMsgResolucion("Debe seleccionar un producto alternativo");
        setShowAlertResolucion(true);
        return;
      }
    }
    
    setProcesandoResolucion(true);
    
    try {
      await resolverNotificacion(
        notificacionSeleccionada.idNotificacion,
        tipoResolucionSeleccionada as any,
        observacionesResolucion,
        productoAlternativo?.codigoIndumentaria,
        nuevaCantidad || undefined
      );
      
      setShowModalResolucion(false);
      setAlertMsgResolucion(`✅ Resolución "${obtenerNombreResolucion(tipoResolucionSeleccionada)}" aplicada exitosamente`);
      setShowAlertResolucion(true);
      
      // Recargar pedido y notificaciones
      await cargarPedido();
    } catch (error: any) {
      console.error("Error al procesar resolución:", error);
      setAlertMsgResolucion(
        `❌ Error al procesar resolución: ${error.response?.data?.detalle || error.message}`
      );
      setShowAlertResolucion(true);
    } finally {
      setProcesandoResolucion(false);
    }
  };

  const obtenerNombreResolucion = (tipo: string): string => {
    const nombres: Record<string, string> = {
      'cancelar_articulo': 'Cancelar Artículo',
      'reducir_cantidad': 'Reducir Cantidad',
      'producto_alternativo': 'Producto Alternativo',
      'reabastecer': 'Reabastecer y Continuar',
      'continuar': 'Continuar con el Pedido',
      'cancelar_pedido': 'Cancelar Pedido Completo'
    };
    return nombres[tipo] || tipo;
  };

  const filtrarIndumentarias = () => {
    if (!busquedaProducto) return indumentariasDisponibles;
    
    const busqueda = busquedaProducto.toLowerCase();
    return indumentariasDisponibles.filter((item: any) => 
      item.codigoIndumentaria?.toLowerCase().includes(busqueda) ||
      item.nombre?.toLowerCase().includes(busqueda) ||
      item.color?.toLowerCase().includes(busqueda) ||
      item.talle?.toLowerCase().includes(busqueda)
    );
  };

  // ==========================================
  // FIN FUNCIONES DE RESOLUCIÓN
  // ==========================================

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

  // Función para obtener colores para el badge según el nombre del color
  const obtenerEstilosColor = (nombreColor: string) => {
    if (!nombreColor || nombreColor === "-") {
      return { backgroundColor: "#f3f4f6", color: "#6b7280" };
    }

    const colorLower = nombreColor.toLowerCase().trim();
    
    // Mapeo de colores en español a valores CSS
    const coloresMap: { [key: string]: { bg: string; text: string } } = {
      // Básicos
      rojo: { bg: "#dc2626", text: "#ffffff" },
      azul: { bg: "#2563eb", text: "#ffffff" },
      verde: { bg: "#16a34a", text: "#ffffff" },
      amarillo: { bg: "#eab308", text: "#000000" },
      naranja: { bg: "#ea580c", text: "#ffffff" },
      violeta: { bg: "#7c3aed", text: "#ffffff" },
      morado: { bg: "#9333ea", text: "#ffffff" },
      rosa: { bg: "#ec4899", text: "#ffffff" },
      
      // Tonos
      negro: { bg: "#1f2937", text: "#ffffff" },
      blanco: { bg: "#f9fafb", text: "#1f2937" },
      gris: { bg: "#6b7280", text: "#ffffff" },
      beige: { bg: "#d4b896", text: "#000000" },
      marron: { bg: "#92400e", text: "#ffffff" },
      marrón: { bg: "#92400e", text: "#ffffff" },
      
      // Tonalidades específicas
      "rojo oscuro": { bg: "#991b1b", text: "#ffffff" },
      "azul oscuro": { bg: "#1e40af", text: "#ffffff" },
      "verde oscuro": { bg: "#15803d", text: "#ffffff" },
      "azul claro": { bg: "#60a5fa", text: "#000000" },
      "verde claro": { bg: "#4ade80", text: "#000000" },
      celeste: { bg: "#38bdf8", text: "#000000" },
      turquesa: { bg: "#14b8a6", text: "#ffffff" },
      
      // Metálicos
      dorado: { bg: "#fbbf24", text: "#000000" },
      plateado: { bg: "#d1d5db", text: "#1f2937" },
      
      // Otros
      bordo: { bg: "#881337", text: "#ffffff" },
      borravino: { bg: "#881337", text: "#ffffff" },
      fucsia: { bg: "#db2777", text: "#ffffff" },
      coral: { bg: "#fb7185", text: "#ffffff" },
      salmón: { bg: "#fb923c", text: "#ffffff" },
      salmon: { bg: "#fb923c", text: "#ffffff" },
      crema: { bg: "#fef3c7", text: "#92400e" },
      ocre: { bg: "#d97706", text: "#ffffff" },
    };

    // Buscar coincidencia exacta o parcial
    for (const [key, value] of Object.entries(coloresMap)) {
      if (colorLower.includes(key)) {
        return { backgroundColor: value.bg, color: value.text };
      }
    }

    // Color por defecto si no se encuentra
    return { backgroundColor: "#e5e7eb", color: "#374151" };
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

        {/* Alertas de problemas reportados por el picker */}
        {notificacionesProblemas.filter(n => n.estadoResolucion === 'pendiente').length > 0 && (
          <div style={{
            margin: '20px 0',
            padding: '20px',
            backgroundColor: '#fff3cd',
            border: '2px solid #fdb40b',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(253, 180, 11, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '32px', marginRight: '12px' }}>⚠️</span>
              <h3 style={{ margin: 0, color: '#856404', fontSize: '20px' }}>
                Problemas Reportados en el Picking
              </h3>
            </div>
            
            {notificacionesProblemas.filter(n => n.estadoResolucion === 'pendiente').map((notif, idx) => (
              <div key={notif.idNotificacion} style={{
                marginBottom: idx < notificacionesProblemas.filter(n => n.estadoResolucion === 'pendiente').length - 1 ? '16px' : '0',
                padding: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #fdb40b'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '8px'
                  }}>
                    {notif.motivoDescripcion || 'Problema reportado'}
                  </div>
                  
                  {notif.pickerAsignado && (
                    <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '6px' }}>
                      👤 Reportado por: <strong>{notif.pickerAsignado}</strong>
                    </div>
                  )}
                </div>
                
                <div style={{ fontSize: '14px', color: '#495057', lineHeight: '1.6' }}>
                  {notif.mensaje}
                </div>
                
                {notif.observacionesProblema && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#495057',
                    borderLeft: '3px solid #fdb40b'
                  }}>
                    <strong>💬 Observaciones:</strong>
                    <div style={{ marginTop: '6px' }}>{notif.observacionesProblema}</div>
                  </div>
                )}
                
                {/* Botones de resolución */}
                <div style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e9ecef'
                }}>
                  <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#495057' }}>
                    🔧 Acciones de resolución:
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '8px' 
                  }}>
                    <button
                      onClick={() => abrirModalResolucion(notif, 'continuar')}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      ✅ Continuar
                    </button>
                    <button
                      onClick={() => {
                        handleCancelarPedido(
                          pedido.numeroPedido,
                          setPedidoParaCancelar,
                          setMotivosCancelacion,
                          setMotivoSeleccionado,
                          setShowMotivoModal,
                          setAlertMsg,
                          setShowAlert
                        );
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      🚫 Cancelar Pedido
                    </button>
                    <button
                      onClick={() => history.push(`/alta-pedido/${pedido.numeroPedido}`)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      ✏️ Editar Pedido
                    </button>
                  </div>
                </div>
                
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e9ecef',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#6c757d'
                }}>
                  <span>
                    📅 {new Date(notif.fechaNotificacion).toLocaleString('es-AR')}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    backgroundColor: notif.completarParcial ? '#28a745' : '#ffc107',
                    color: notif.completarParcial ? 'white' : '#000',
                    borderRadius: '4px',
                    fontWeight: '600'
                  }}>
                    {notif.completarParcial ? '✅ Completado parcialmente' : '⏸️ En espera de resolución'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

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
              {prendas.map((prenda, idx) => {
                // Calcular precio por presentación (sin descuento)
                const precioOriginal = Number(prenda.precio_unitario) || 0;
                const cantidad = Number(prenda.cantidad) || 0;
                const cantidadPresentaciones = Number(prenda.cantidadPresentaciones) || cantidad;
                const unidadesTotales = Number(prenda.unidadesTotales) || cantidad;
                
                // Precio por presentación = precio unitario × (unidades por presentación)
                const unidadesPorPresentacion = cantidadPresentaciones > 0 
                  ? unidadesTotales / cantidadPresentaciones 
                  : 1;
                const precioPorPresentacion = precioOriginal * unidadesPorPresentacion;
                
                return (
                  <tr key={idx}>
                    <td>
                      <span className="producto-nombre">
                        {mostrar(prenda.nombre_producto)}
                      </span>
                      {prenda.nombrePresentacion && (
                        <div style={{ 
                          fontSize: '0.85em', 
                          marginTop: '4px',
                          padding: '4px 8px',
                          backgroundColor: '#e8f4f8',
                          borderRadius: '4px',
                          color: '#0066cc',
                          fontWeight: 'bold',
                          display: 'inline-block'
                        }}>
                          📦 {prenda.nombrePresentacion}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="producto-badge producto-badge-talle">
                        {mostrar(prenda.talle)}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="producto-badge producto-badge-color"
                        style={obtenerEstilosColor(prenda.color)}
                      >
                        {mostrar(prenda.color)}
                      </span>
                    </td>
                    <td>
                      <span className="producto-precio">
                        {mostrarPrecio(precioPorPresentacion)}
                      </span>
                    </td>
                    <td>
                      <span className="producto-cantidad">
                        {mostrar(prenda.cantidadPresentaciones || prenda.cantidad)}
                      </span>
                      {prenda.cantidadPresentaciones && prenda.unidadesTotales && (
                        <div style={{ 
                          fontSize: '0.8em', 
                          marginTop: '4px',
                          color: '#666'
                        }}>
                          ({prenda.cantidadPresentaciones} {prenda.nombrePresentacion}(s) × {prenda.unidadesTotales / prenda.cantidadPresentaciones} u. = {prenda.unidadesTotales} u. totales)
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="producto-subtotal">
                        {mostrarPrecio(precioPorPresentacion * (prenda.cantidadPresentaciones || prenda.cantidad))}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="tabla-resumen">
            {/* Subtotal original */}
            <div className="tabla-resumen-row tabla-resumen-row-subtotal">
              <span className="tabla-resumen-label">Subtotal:</span>
              <span className="tabla-resumen-valor">
                {mostrarPrecio(subtotalOriginal || pedido?.subtotal)}
              </span>
            </div>

            {/* Descuento VIP - Se muestra primero porque se aplica sobre el subtotal */}
            {pedido &&
              pedido.descuentoOrden &&
              Number(pedido.descuentoOrden) > 0 && (
                <div className="tabla-resumen-row tabla-resumen-row-descuento" style={{ marginTop: '4px' }}>
                  <span className="tabla-resumen-label">
                    👑 Cliente VIP - 10% de descuento:
                  </span>
                  <span className="tabla-resumen-valor">
                    -{mostrarPrecio(pedido.descuentoOrden)}
                  </span>
                </div>
              )}

            {/* Separador visual entre descuento VIP y descuentos de presentación */}
            {pedido && pedido.descuentoOrden && Number(pedido.descuentoOrden) > 0 && 
             (descuentoPacks > 0 || descuentoCajasCerradas > 0) && (
              <div style={{ 
                borderTop: '1px dashed #ddd', 
                margin: '8px 0',
                paddingTop: '8px'
              }}></div>
            )}

            {/* Descuentos por presentación */}
            {descuentoPacks > 0 && (
              <div className="tabla-resumen-row" style={{ color: '#2196F3', fontSize: '0.95em' }}>
                <span className="tabla-resumen-label">
                  📦 Descuento por Packs (5%):
                </span>
                <span className="tabla-resumen-valor">
                  -{mostrarPrecio(descuentoPacks)}
                </span>
              </div>
            )}
            {descuentoCajasCerradas > 0 && (
              <div className="tabla-resumen-row" style={{ color: '#4CAF50', fontSize: '0.95em' }}>
                <span className="tabla-resumen-label">
                  📦 Descuento por Cajas Cerradas (10%):
                </span>
                <span className="tabla-resumen-valor">
                  -{mostrarPrecio(descuentoCajasCerradas)}
                </span>
              </div>
            )}

            {/* Total */}
            {pedido && (
              <div className="tabla-resumen-row tabla-resumen-row-total" style={{ marginTop: '12px', fontSize: '1.1em', paddingTop: '8px', borderTop: '2px solid #fdb40b' }}>
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

        {/* Modal de Resolución */}
        <IonModal isOpen={showModalResolucion} onDidDismiss={() => setShowModalResolucion(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>
                {obtenerNombreResolucion(tipoResolucionSeleccionada)}
              </IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '8px', color: '#495057' }}>
                  Detalles de la resolución
                </h4>
                <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '16px' }}>
                  {tipoResolucionSeleccionada === 'cancelar_articulo' && 'El artículo será eliminado del pedido. El stock será devuelto.'}
                  {tipoResolucionSeleccionada === 'reducir_cantidad' && 'Especifica la nueva cantidad del artículo. La diferencia se devolverá al stock.'}
                  {tipoResolucionSeleccionada === 'producto_alternativo' && 'Selecciona un producto alternativo para reemplazar el artículo con problema.'}
                  {tipoResolucionSeleccionada === 'reabastecer' && 'El problema se marcará como "en resolución". La tarea quedará disponible cuando esté resuelto.'}
                  {tipoResolucionSeleccionada === 'continuar' && 'Autoriza al picker a continuar con el pedido a pesar del problema reportado.'}
                  {tipoResolucionSeleccionada === 'cancelar_pedido' && 'El pedido completo será cancelado. Todo el stock será devuelto.'}
                </p>
              </div>

              {/* Campo específico para Reducir Cantidad */}
              {tipoResolucionSeleccionada === 'reducir_cantidad' && (
                <div style={{ marginBottom: '16px' }}>
                  <IonItem>
                    <IonLabel position="stacked">
                      <strong>Nueva Cantidad *</strong>
                    </IonLabel>
                    <IonInput
                      type="number"
                      value={nuevaCantidad}
                      onIonChange={(e) => setNuevaCantidad(parseInt(e.detail.value || '0'))}
                      placeholder="Ingrese la nueva cantidad"
                      min="1"
                    />
                  </IonItem>
                </div>
              )}

              {/* Campo específico para Producto Alternativo */}
              {tipoResolucionSeleccionada === 'producto_alternativo' && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Buscar Producto Alternativo *</strong>
                  </div>
                  <IonSearchbar
                    value={busquedaProducto}
                    onIonChange={(e) => setBusquedaProducto(e.detail.value || '')}
                    placeholder="Buscar por código, nombre, color o talle"
                  />
                  <IonList style={{ 
                    maxHeight: '300px', 
                    overflow: 'auto',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    marginTop: '8px'
                  }}>
                    {filtrarIndumentarias().slice(0, 20).map((item: any) => (
                      <IonItem
                        key={item.codigoIndumentaria}
                        button
                        onClick={() => setProductoAlternativo(item)}
                        style={{
                          backgroundColor: productoAlternativo?.codigoIndumentaria === item.codigoIndumentaria ? '#e7f3ff' : 'white'
                        }}
                      >
                        <IonLabel>
                          <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {item.codigoIndumentaria}
                          </h3>
                          <p style={{ fontSize: '13px', color: '#6c757d' }}>
                            {item.nombre} - {item.color} - {item.talle} - ${item.precio}
                          </p>
                        </IonLabel>
                        {productoAlternativo?.codigoIndumentaria === item.codigoIndumentaria && (
                          <IonIcon icon={checkmarkCircleOutline} slot="end" color="primary" />
                        )}
                      </IonItem>
                    ))}
                    {filtrarIndumentarias().length === 0 && (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                        No se encontraron productos
                      </div>
                    )}
                  </IonList>
                  {productoAlternativo && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: '#d4edda',
                      borderRadius: '6px',
                      border: '1px solid #c3e6cb'
                    }}>
                      <strong style={{ color: '#155724' }}>✅ Producto seleccionado:</strong>
                      <div style={{ marginTop: '4px', fontSize: '14px', color: '#155724' }}>
                        {productoAlternativo.codigoIndumentaria} - {productoAlternativo.nombre}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Campo de Observaciones (para todos) */}
              <div style={{ marginBottom: '16px' }}>
                <IonItem>
                  <IonLabel position="stacked">
                    <strong>Observaciones {tipoResolucionSeleccionada === 'continuar' ? '(Instrucciones para el picker)' : ''}</strong>
                  </IonLabel>
                  <IonTextarea
                    value={observacionesResolucion}
                    onIonChange={(e) => setObservacionesResolucion(e.detail.value || '')}
                    placeholder="Agregar comentarios u observaciones..."
                    rows={4}
                  />
                </IonItem>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <IonButton
                  expand="block"
                  color="secondary"
                  onClick={() => setShowModalResolucion(false)}
                  disabled={procesandoResolucion}
                  style={{ flex: 1 }}
                >
                  <IonIcon icon={closeCircleOutline} slot="start" />
                  Cancelar
                </IonButton>
                <IonButton
                  expand="block"
                  color="primary"
                  onClick={procesarResolucion}
                  disabled={procesandoResolucion}
                  style={{ flex: 1 }}
                >
                  {procesandoResolucion ? (
                    <>Procesando...</>
                  ) : (
                    <>
                      <IonIcon icon={checkmarkCircleOutline} slot="start" />
                      Aplicar Resolución
                    </>
                  )}
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Alerta de Resolución */}
        <IonAlert
          isOpen={showAlertResolucion}
          onDidDismiss={() => setShowAlertResolucion(false)}
          header="Resolución de Problema"
          message={alertMsgResolucion}
          buttons={['OK']}
        />

        {/* Modal de Cancelación de Pedido */}
        <IonModal
          isOpen={showMotivoModal}
          onDidDismiss={() => {
            setShowMotivoModal(false);
            setMotivoSeleccionado(null);
            setObservacionPersonalizada("");
          }}
          className="motivo-cancelacion-modal"
        >
          <div className="motivo-cancelacion-content">
            <h2 className="motivo-cancelacion-header">Motivo de cancelación</h2>
            <div className="motivo-cancelacion-pedido-info">
              Pedido: {pedidoParaCancelar}
            </div>
            <div className="motivo-cancelacion-options">
              {motivosCancelacion.map((motivo) => (
                <div
                  key={motivo.idMotivo}
                  className={`motivo-option ${
                    motivoSeleccionado === motivo.idMotivo ? "selected" : ""
                  }`}
                  onClick={() => setMotivoSeleccionado(motivo.idMotivo)}
                >
                  <input
                    type="radio"
                    name="motivo"
                    value={motivo.idMotivo}
                    checked={motivoSeleccionado === motivo.idMotivo}
                    onChange={() => setMotivoSeleccionado(motivo.idMotivo)}
                  />
                  <div className="motivo-option-content">
                    <div className="motivo-option-radio"></div>
                    <div className="motivo-option-text">
                      {motivo.descripcion}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Campo de observación personalizada - solo visible cuando el motivo es "Otro" (id 6) */}
            {motivoSeleccionado === 6 && (
              <div className="observacion-personalizada">
                <IonItem className="observacion-input-item">
                  <IonLabel position="stacked">
                    Observación personalizada *
                  </IonLabel>
                  <IonTextarea
                    value={observacionPersonalizada}
                    onIonInput={(e: any) =>
                      setObservacionPersonalizada(e.detail.value!)
                    }
                    placeholder="Ingrese el motivo de cancelación..."
                    rows={3}
                    maxlength={500}
                    counter={true}
                    className="observacion-textarea"
                  />
                </IonItem>
              </div>
            )}
            <div className="motivo-cancelacion-buttons">
              <IonButton
                onClick={() => {
                  setShowMotivoModal(false);
                  setPedidoParaCancelar(null);
                  setMotivoSeleccionado(null);
                  setObservacionPersonalizada("");
                }}
                className="motivo-cancelacion-btn-cancelar"
              >
                Cancelar
              </IonButton>
              <IonButton
                disabled={
                  !motivoSeleccionado ||
                  !pedidoParaCancelar ||
                  (motivoSeleccionado === 6 && !observacionPersonalizada.trim())
                }
                className="motivo-cancelacion-btn-confirmar"
                onClick={async () => {
                  if (!motivoSeleccionado || !pedidoParaCancelar || !username)
                    return;

                  // Validar observación si el motivo es "Otro" (id 6)
                  if (
                    motivoSeleccionado === 6 &&
                    !observacionPersonalizada.trim()
                  ) {
                    setAlertMsg(
                      "La observación es requerida cuando el motivo es 'Otro'"
                    );
                    setShowAlert(true);
                    return;
                  }

                  try {
                    // Primero obtener el ID del usuario por su nombre de usuario
                    const userResponse = await fetch(
                      `/api/auth/usuarios/buscar-por-nombre/${username}`,
                      {
                        headers: {
                          nombreUsuario: username,
                        },
                      }
                    );
                    let idUsuarioCancelo = null;

                    if (userResponse.ok) {
                      const userData = await userResponse.json();
                      idUsuarioCancelo = userData.idUsuario;
                    }

                    if (!idUsuarioCancelo) {
                      setAlertMsg(
                        "Error: No se pudo identificar el usuario que cancela"
                      );
                      setShowAlert(true);
                      return;
                    }

                    // Preparar el cuerpo de la petición
                    const requestBody: any = {
                      idMotivo: motivoSeleccionado,
                      idUsuarioCancelo: idUsuarioCancelo,
                    };

                    // Solo incluir observación si el motivo es "Otro" y hay texto
                    if (
                      motivoSeleccionado === 6 &&
                      observacionPersonalizada.trim()
                    ) {
                      requestBody.observacionCancelacion =
                        observacionPersonalizada.trim();
                    }

                    // Proceder con la cancelación
                    const response = await fetch(
                      `/api/pedidos/${pedidoParaCancelar}/cancelar`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          nombreUsuario: username,
                        },
                        body: JSON.stringify(requestBody),
                      }
                    );

                    if (!response.ok) {
                      const errorData = await response.json();
                      setAlertMsg(
                        errorData.error || "Error al cancelar el pedido."
                      );
                      setShowAlert(true);
                      setShowMotivoModal(false);
                      setPedidoParaCancelar(null);
                      setMotivoSeleccionado(null);
                      setObservacionPersonalizada("");
                      return;
                    }

                    setShowDeleteSuccess(true);
                    setShowMotivoModal(false);
                    setPedidoParaCancelar(null);
                    setMotivoSeleccionado(null);
                    setObservacionPersonalizada("");
                    // Recargar el pedido para ver los cambios
                    await cargarPedido();
                  } catch (error) {
                    setAlertMsg("Error de conexión al cancelar el pedido.");
                    setShowAlert(true);
                    setShowMotivoModal(false);
                    setPedidoParaCancelar(null);
                    setMotivoSeleccionado(null);
                    setObservacionPersonalizada("");
                  }
                }}
              >
                Confirmar Cancelación
              </IonButton>
            </div>
          </div>
        </IonModal>

        {/* Alerta de éxito al cancelar */}
        <IonAlert
          isOpen={showDeleteSuccess}
          message="El pedido fue cancelado correctamente."
          buttons={[
            {
              text: "Aceptar",
              handler: () => {
                setShowDeleteSuccess(false);
                history.push('/pedidos');
              },
            },
          ]}
        />

        {/* Alerta general */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Advertencia"
          message={alertMsg}
          buttons={["Aceptar"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default DetallePedido;
