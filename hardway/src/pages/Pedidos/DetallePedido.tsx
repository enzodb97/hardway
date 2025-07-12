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
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import "./DetallePedido.css";
import zepelin from "../../assets/images/zepelin.png";
import axiosInstance from "../../config/axios";

const DetallePedido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [prendas, setPrendas] = useState<any[]>([]);
  const [pedido, setPedido] = useState<any>(null);

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        const res = await axiosInstance.get(`/api/pedidos/${id}/detalle-plano`);
        setPrendas(res.data.items || []);
        setPedido(res.data.pedido);
      } catch (error) {
        console.error('Error al cargar pedido:', error);
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

  // Configuración de estados y progreso
  const estadosPedido = [
    { id: 1, nombre: "En Curso", icono: "📋", descripcion: "Pedido creado", key: "creado" },
    { id: 2, nombre: "Pendiente de Pago", icono: "💳", descripcion: "Esperando pago", key: "pago" },
    { id: 3, nombre: "Abonado", icono: "✅", descripcion: "Pago confirmado", key: "abonado" },
    { id: 4, nombre: "Despachado", icono: "🚚", descripcion: "En camino", key: "enviado" },
    { id: 5, nombre: "Finalizado", icono: "🏠", descripcion: "Entregado", key: "entregado" },
  ];

  const obtenerProgresoActual = () => {
    if (!pedido) return 0;
    
    // Si está cancelado, retornar estado especial
    if (pedido.idEstado === 6) return -1;
    
    const estadoActual = estadosPedido.findIndex(estado => estado.id === pedido.idEstado);
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
                <span className="nombre-estado-cancelado">Pedido Cancelado</span>
                <span className="descripcion-estado-cancelado">El pedido ha sido cancelado</span>
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
              <div className={`paso-contenido ${index <= progresoActual ? 'completado' : 'pendiente'}`}>
                <div className={`circulo-estado ${index <= progresoActual ? 'activo' : ''} ${index === progresoActual ? 'actual' : ''}`}>
                  <span className="icono-estado">{estado.icono}</span>
                </div>
                <div className="info-estado">
                  <span className="nombre-estado">{estado.nombre}</span>
                  <span className="descripcion-estado">{estado.descripcion}</span>
                </div>
              </div>
              {index < estadosPedido.length - 1 && (
                <div className={`linea-conexion ${index < progresoActual ? 'completada' : 'pendiente'}`}></div>
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
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h2 className="detalle-pedido-titulo">
          <img src={zepelin} alt="Ícono Hardway" className="brand-logo" />{" "}
          Detalle de Pedido #{pedido?.numeroPedido || id}
        </h2>
        
        {/* Barra de progreso del pedido */}
        {pedido && <BarraProgreso />}
        
        {/* Información del estado del pedido */}
        {pedido && (
          <div className="pedido-info-card">
            <p><strong>Estado:</strong> {pedido.tipoEstado}</p>

          </div>
        )}

        {/* Mostrar información del usuario que creó el pedido */}
        {pedido && pedido.usuarioCreo && (
          <div className="usuario-creacion-card">
            <h3>Información de Creación</h3>
            <p className="usuario-creacion">
              <strong>Creado por:</strong> {pedido.usuarioCreo}
            </p>
             <p className="usuario-creacion"><strong>Fecha del pedido:</strong> {pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleString("es-AR") : "-"}</p>
          </div>
        )}

        {/* Mostrar información de modificación si existe y es diferente a la fecha de creación */}
        {pedido && pedido.fechaModificacion && pedido.fechaPedido && 
         new Date(pedido.fechaModificacion).getTime() !== new Date(pedido.fechaPedido).getTime() && (
          <div className="modificacion-pedido-card">
            <h3>Historial de Modificaciones</h3>
            <p className="fecha-modificacion">
              <strong>Última modificación:</strong> {new Date(pedido.fechaModificacion).toLocaleString("es-AR")}
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
            <p><strong>Motivo:</strong> {pedido.motivoCancelacion}</p>
            
            {/* Mostrar fecha de cancelación */}
            {pedido.fechaCancelacion && (
              <p className="fecha-cancelacion">
                <strong>Fecha de cancelación:</strong> {new Date(pedido.fechaCancelacion).toLocaleString("es-AR")}
              </p>
            )}
            
            {/* Mostrar observación personalizada si existe */}
            {pedido.observacionCancelacion && (
              <div className="observacion-cancelacion">
                <p><strong>Observación:</strong></p>
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
              </IonCol>
            </IonRow>
          ))}
          {/* Fila de total */}
          <IonRow className="table-total-row">
            <IonCol size="9" style={{ textAlign: "right", fontWeight: "bold" }}>
              Total del pedido:
            </IonCol>
            <IonCol size="2" style={{ fontWeight: "bold" }}>
              {mostrarPrecio(
                prendas.reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0)
              )}
            </IonCol>
          </IonRow>
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
