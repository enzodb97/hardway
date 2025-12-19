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
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import { documentTextOutline } from "ionicons/icons";
import "./DetallePedido.css";
import zepelin from "../../assets/images/zepelin.png";
import axiosInstance from "../../config/axios";
import { exportarPDFDetallePedido } from "../../utils/pedidosUtils";

const DetallePedido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [prendas, setPrendas] = useState<any[]>([]);
  const [pedido, setPedido] = useState<any>(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        const res = await axiosInstance.get(`/api/pedidos/${id}/detalle-plano`);
        setPrendas(res.data.items || []);
        setPedido(res.data.pedido);
        
        // Debug: verificar los datos del pedido
        console.log("📦 Datos del pedido recibidos:", res.data.pedido);
        console.log("🚚 Empresa de envío:", res.data.pedido?.empresaEnvio);
        console.log("📋 Número de seguimiento:", res.data.pedido?.numeroSeguimiento);
      } catch (error) {
        console.error("Error al cargar pedido:", error);
      }
    };
    cargarPedido();
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
              <h3>Historial de Modificaciones</h3>
              <p className="fecha-modificacion">
                <strong>Última modificación:</strong>{" "}
                {new Date(pedido.fechaModificacion).toLocaleString("es-AR")}
              </p>
              {pedido.usuarioModifico && (
                <p className="fecha-modificacion">
                  <strong>Modificado por:</strong> {pedido.usuarioModifico}
                </p>
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

        <IonGrid>
          <IonRow className="table-header">
            <IonCol size="2">
              <strong>Nombre del producto</strong>
            </IonCol>
            <IonCol size="1">
              <strong>Talle</strong>
            </IonCol>
            <IonCol size="1">
              <strong>Color</strong>
            </IonCol>
            <IonCol size="2">
              <strong>Precio Unitario</strong>
            </IonCol>
            <IonCol size="1">
              <strong>Cantidad</strong>
            </IonCol>
            <IonCol size="2">
              <strong>Subtotal</strong>
            </IonCol>
          </IonRow>
          {prendas.map((prenda, idx) => (
            <IonRow key={idx}>
              <IonCol class="col" size="2">
                {mostrar(prenda.nombre_producto)}
              </IonCol>
              <IonCol class="col" size="1">
                {mostrar(prenda.talle)}
              </IonCol>
              <IonCol class="col" size="1">
                {mostrar(prenda.color)}
              </IonCol>
              <IonCol class="col" size="2">
                {mostrarPrecio(prenda.precio_unitario)}
              </IonCol>
              <IonCol class="col" size="1">
                {mostrar(prenda.cantidad)}
              </IonCol>
              <IonCol class="col" size="2">
                {mostrarPrecio(prenda.subtotal)}
                {prenda.descuento_por_item &&
                  Number(prenda.descuento_por_item) > 0 && (
                    <div style={{ color: "teal", fontSize: 12 }}>
                      -{mostrarPrecio(prenda.descuento_por_item)} desc.
                    </div>
                  )}
              </IonCol>
            </IonRow>
          ))}
          {/* Fila de subtotal */}
          <IonRow className="table-total-row">
            <IonCol size="9" style={{ textAlign: "right", fontWeight: "bold" }}>
              Subtotal:
            </IonCol>
            <IonCol size="2" style={{ fontWeight: "bold" }}>
              {mostrarPrecio(pedido?.subtotal)}
            </IonCol>
          </IonRow>
          {/* Mostrar descuento global si corresponde */}
          {pedido &&
            pedido.descuentoOrden &&
            Number(pedido.descuentoOrden) > 0 && (
              <IonRow className="table-descuento-row">
                <IonCol
                  size="9"
                  style={{
                    textAlign: "right",
                    fontWeight: "bold",
                    color: "goldenrod",
                    textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                  }}
                >
                  👑 Cliente VIP 10% de descuento aplicado:
                </IonCol>
                <IonCol
                  size="2"
                  style={{ 
                    fontWeight: "bold", 
                    color: "goldenrod",
                    textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                  }}
                >
                  -{mostrarPrecio(pedido.descuentoOrden)}
                </IonCol>
              </IonRow>
            )}
          {/* Mostrar total final */}
          {pedido && (
            <IonRow className="table-total-final-row">
              <IonCol
                size="9"
                style={{ textAlign: "right", fontWeight: "bold" }}
              >
                Total a pagar:
              </IonCol>
              <IonCol size="2" style={{ fontWeight: "bold" }}>
                {mostrarPrecio(Number(pedido.total))}
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
        <hr />
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
