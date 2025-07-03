// src/pages/Pedidos/Pedidos.tsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { obtenerClaseDeEstado } from "../../utils/pedidosUtils";
import { obtenerIconoEstado } from "../../utils/pedidosUtils";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonMenuButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonAlert,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  cargarPedidos,
  filtrarPedidos,
  Pedido,
  eliminarPedido,
  marcarPedidoComoAbonado,
  handleEliminarPedido,
  fetchPickers,
  asignarPicker,
  handleConfirmAbonar,
  handleConfirmFinalizar,
  obtenerPickerAsignado,
  exportarPDF,
  marcarPedidoComoFinalizado,
  obtenerMotivosCancelacion,
  cancelarPedidoConMotivo,
  MotivoCancelacion,
} from "../../utils/pedidosUtils";
import { useHistory } from "react-router-dom";
import axiosInstance from "../../config/axios";
import { pencil, trash, documentText, chevronDown, cash } from "ionicons/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  IonPopover,
  IonLabel,
  IonList,
  IonItem,
  IonModal,
} from "@ionic/react";
import "./Pedidos.css";

const Pedidos: React.FC = () => {
  const { username } = useAuth(); // Obtener el usuario autenticado
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showPickerDropdown, setShowPickerDropdown] = useState<string | null>(
    null
  );
  const [pickers, setPickers] = useState<any[]>([]);
  const [selectedPicker, setSelectedPicker] = useState<any>(null);
  const [pedidoParaAsignar, setPedidoParaAsignar] = useState<string | null>(
    null
  );
  const [showConfirmAsignar, setShowConfirmAsignar] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [showFinalizarConfirm, setShowFinalizarConfirm] = useState(false);
  const [pedidoParaFinalizar, setPedidoParaFinalizar] = useState<string | null>(
    null
  );
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState<string | null>(
    null
  );
  const [motivosCancelacion, setMotivosCancelacion] = useState<any[]>([]);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<number | null>(
    null
  );
  const [showMotivoModal, setShowMotivoModal] = useState(false);
  
  // Estados para manejar errores de autorización
  const [showAuthError, setShowAuthError] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState("");
  
  const porPagina = 6;
  const history = useHistory();

  useIonViewWillEnter(() => {
    cargarPedidos()
      .then(setPedidos)
      .catch((error) => {
        console.error("Error al cargar pedidos:", error);
        setAuthErrorMsg(error.message);
        setShowAuthError(true);
      });
  });

  const mostrarTodos = busqueda === " ";
  const pedidosFiltrados = filtrarPedidos(
    pedidos,
    busqueda === " " ? "" : busqueda
  ).sort(
    (a, b) =>
      (b.fechaPedido ? new Date(b.fechaPedido).getTime() : 0) -
      (a.fechaPedido ? new Date(a.fechaPedido).getTime() : 0)
  );
  const totalPaginas = Math.ceil(pedidosFiltrados.length / porPagina);
  const pedidosPaginados = pedidosFiltrados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );
  const pedidosAMostrar = mostrarTodos
    ? pedidosFiltrados
    : busqueda.trim() === ""
    ? pedidosFiltrados.slice(0, 5)
    : pedidosFiltrados;

  // --- FUNCIONES UTILITARIAS ---
  // Todas las funciones de negocio se delegan a pedidosUtils.ts
  const handleCancelarPedido = async (numeroPedido: string) => {
    setPedidoParaCancelar(numeroPedido);
    try {
      const response = await axiosInstance.get("/api/motivos-cancelacion");
      const motivos = response.data;
      setMotivosCancelacion(motivos);
      setMotivoSeleccionado(null);
      setShowMotivoModal(true);
    } catch {
      setAlertMsg("No se pudieron cargar los motivos de cancelación.");
      setShowAlert(true);
    }
  };

  return (
    <IonPage className="pedidos-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Pedidos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="pedidos-content">
        <IonGrid>
          {/* Fila 1: Buscador */}
          <IonRow>
            <IonCol size="10">
              <div className="pedidos-buscador">
                <IonInput
                  placeholder="Buscar por cliente, fecha o N° de pedido"
                  value={busqueda === " " ? "" : busqueda}
                  onIonChange={(e) => setBusqueda(e.detail.value!)}
                  clearInput
                />
              </div>
            </IonCol>
            <IonCol size="2" className="ion-text-right pedidos-total-col">
              <span className="pedidos-total-badge">
                {/*Total: {pedidosFiltrados.length}*/}
                Total: {pedidos.length}
              </span>
            </IonCol>
          </IonRow>
          {/* Fila 2: Tabla */}
          <IonRow>
            <IonCol size="12">
              <div className="pedidos-table-wrapper">
                <IonGrid className="pedidos-table">
                  <IonRow className="table-header">
                    <IonCol className="text-center">
                      <strong>N° Pedido</strong>
                    </IonCol>
                    <IonCol className="text-center">
                      <strong>Estado</strong>
                    </IonCol>
                    <IonCol className="text-center">
                      <strong>Cliente</strong>
                    </IonCol>
                    <IonCol className="text-center">
                      <strong>Fecha y Hora</strong>
                    </IonCol>
                    <IonCol className="text-center">
                      <strong>Acciones</strong>
                    </IonCol>
                  </IonRow>
                  {pedidosPaginados.map((pedido) => (
                    <IonRow key={pedido.numeroPedido} className="table-row">
                      <IonCol className="text-center">
                        {pedido.numeroPedido}
                      </IonCol>
                      <IonCol className="text-center">
                        <span
                          className={`status-badge ${obtenerClaseDeEstado(
                            pedido.EstadoPedido?.tipoEstado || ""
                          )}`}
                        >
                          <IonIcon
                            icon={obtenerIconoEstado(
                              pedido.EstadoPedido?.tipoEstado || ""
                            )}
                            className="estado-icono"
                          />
                          {pedido.EstadoPedido?.tipoEstado || "Sin estado"}
                        </span>
                      </IonCol>
                      <IonCol className="text-center">
                        {pedido.Cliente?.Persona
                          ? `${pedido.Cliente.Persona.nombre} ${
                              pedido.Cliente.Persona.apellido ?? ""
                            }`.trim()
                          : "Sin cliente"}
                      </IonCol>
                      <IonCol className="text-center">
                        {pedido.fechaPedido
                          ? new Date(pedido.fechaPedido).toLocaleString("es-AR")
                          : ""}
                      </IonCol>
                      <IonCol className="text-center">
                        <div className="action-buttons">
                          {/* Botón Editar solo para estados permitidos */}
                          {(() => {
                            const estado = pedido.EstadoPedido?.tipoEstado
                              ?.trim()
                              .toLowerCase();
                            const idEstado = pedido.EstadoPedido?.idEstado;
                            const puedeEditar =
                              estado === "en curso" ||
                              estado === "pendiente de pago";
                            // Solo NO puede cancelar si está Finalizado (5) o ya Cancelado (6)
                            const puedeCancelar =
                              idEstado !== 5 && idEstado !== 6;
                            return (
                              <>
                                {puedeEditar && (
                                  <IonButton
                                    fill="clear"
                                    onClick={() =>
                                      history.push(
                                        `/alta-pedido/${pedido.numeroPedido}`
                                      )
                                    }
                                  >
                                    <IonIcon icon={pencil} color="primary" />
                                  </IonButton>
                                )}
                                {/* Botón Cancelar visible salvo si está Finalizado */}
                                {puedeCancelar && (
                                  <IonButton
                                    fill="clear"
                                    onClick={() =>
                                      handleCancelarPedido(pedido.numeroPedido)
                                    }
                                    className="cancel-btn"
                                  >
                                    <IonIcon icon={trash} color="danger" />
                                  </IonButton>
                                )}
                              </>
                            );
                          })()}
                          <IonButton
                            fill="clear"
                            onClick={() =>
                              history.push(
                                `/detalle-pedido/${pedido.numeroPedido}`
                              )
                            }
                            className="detail-btn"
                          >
                            <IonIcon icon={documentText} color="medium" />
                          </IonButton>
                          {/* Botón Asignar Picker */}
                          {(() => {
                            const estado = pedido.EstadoPedido?.tipoEstado
                              ?.trim()
                              .toLowerCase();
                            if (estado === "en curso") {
                              return (
                                <IonButton
                                  fill="outline"
                                  color="success"
                                  onClick={async (e) => {
                                    const pickerAsignado =
                                      await obtenerPickerAsignado(
                                        pedido.numeroPedido
                                      );
                                    if (
                                      pickerAsignado &&
                                      pickerAsignado.nombre
                                    ) {
                                      setAlertMsg(
                                        `Este pedido ya fue asignado al picker '${pickerAsignado.nombre}'. ¿Desea cambiarlo?`
                                      );
                                      setShowAlert(true);
                                      setShowPickerDropdown(null);
                                      setPedidoParaAsignar(pedido.numeroPedido);
                                      fetchPickers(
                                        setPickers,
                                        setAlertMsg,
                                        setShowAlert
                                      );
                                    } else {
                                      setShowPickerDropdown(
                                        pedido.numeroPedido
                                      );
                                      setPedidoParaAsignar(pedido.numeroPedido);
                                      fetchPickers(
                                        setPickers,
                                        setAlertMsg,
                                        setShowAlert
                                      );
                                    }
                                  }}
                                  className="asignar-picker-btn"
                                >
                                  + <IonIcon icon={chevronDown} slot="end" />
                                </IonButton>
                              );
                            }
                            return null;
                          })()}
                          {/* Botón Abonar */}
                          {(() => {
                            const estado = pedido.EstadoPedido?.tipoEstado
                              ?.trim()
                              .toLowerCase();
                            if (estado === "pendiente de pago") {
                              return (
                                <IonButton
                                  fill="outline"
                                  color="warning"
                                  onClick={() => {
                                    setPedidoParaAsignar(pedido.numeroPedido);
                                    setShowConfirmAsignar(true);
                                  }}
                                  className="abonar-btn"
                                >
                                  <IonIcon icon={cash} slot="icon-only" />
                                </IonButton>
                              );
                            }
                            return null;
                          })()}
                          {/* Botón Finalizar para estado 'despachado' */}
                          {(() => {
                            const estado = pedido.EstadoPedido?.tipoEstado
                              ?.trim()
                              .toLowerCase();
                            if (estado === "despachado") {
                              return (
                                <IonButton
                                  fill="outline"
                                  color="success"
                                  onClick={() => {
                                    setPedidoParaFinalizar(pedido.numeroPedido);
                                    setShowFinalizarConfirm(true);
                                  }}
                                  className="finalizar-btn"
                                >
                                  Finalizar
                                </IonButton>
                              );
                            }
                            return null;
                          })()}
                          {/* Popover para seleccionar picker */}
                          <IonPopover
                            isOpen={showPickerDropdown === pedido.numeroPedido}
                            onDidDismiss={() => setShowPickerDropdown(null)}
                          >
                            <IonList>
                              <IonItem lines="none" color="light">
                                <IonLabel className="ion-text-center picker-label">
                                  Pickers
                                </IonLabel>
                              </IonItem>
                              {pickers.length === 0 && (
                                <IonItem>
                                  <IonLabel>No hay pickers disponibles</IonLabel>
                                </IonItem>
                              )}
                              {pickers.map((picker, index) => (
                                <IonItem
                                  button
                                  key={picker.id || index}
                                  onClick={() => {
                                    console.log("📌 Picker seleccionado:", picker);
                                    setSelectedPicker(picker);
                                    setShowConfirmAsignar(true);
                                    setShowPickerDropdown(null);
                                  }}
                                >
                                  <IonLabel>
                                    <div style={{ fontWeight: 'bold' }}>
                                      {picker.nombre}
                                    </div>
                                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                                      Legajo: {picker.legajo}
                                    </div>
                                  </IonLabel>
                                </IonItem>
                              ))}
                            </IonList>
                          </IonPopover>
                        </div>
                      </IonCol>
                    </IonRow>
                  ))}
                </IonGrid>
              </div>
            </IonCol>
          </IonRow>
          {/* Paginación */}
          {totalPaginas > 1 && (
            <IonRow className="pedidos-paginacion-row">
              <IonCol size="12" className="pedidos-paginacion-col">
                <IonButton
                  size="small"
                  disabled={pagina === 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </IonButton>
                <span className="pedidos-paginacion-text">
                  Página {pagina} de {totalPaginas} &nbsp;|&nbsp; Mostrando{" "}
                  {pedidosFiltrados.length === 0
                    ? 0
                    : (pagina - 1) * porPagina + 1}
                  -{Math.min(pagina * porPagina, pedidosFiltrados.length)} de{" "}
                  {pedidosFiltrados.length}
                </span>
                <IonButton
                  size="small"
                  disabled={pagina === totalPaginas}
                  onClick={() =>
                    setPagina((p) => Math.min(totalPaginas, p + 1))
                  }
                >
                  Siguiente
                </IonButton>
              </IonCol>
            </IonRow>
          )}
          {/* Fila 3: Botón */}
          <IonRow>
            <IonCol size="12">
              <IonButton routerLink="/alta-pedido" expand="block">
                Nuevo Pedido
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonButton
                expand="block"
                onClick={() => exportarPDF(pedidosFiltrados)}
              >
                Exportar lista de pedidos a PDF
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Advertencia"
          message={alertMsg}
          buttons={
            alertMsg === "El pedido fue marcado como finalizado correctamente."
              ? [{ text: "Aceptar", handler: () => setShowAlert(false) }]
              : [
                  {
                    text: "Cancelar",
                    role: "cancel",
                    handler: () => setShowAlert(false),
                  },
                  {
                    text: "Cambiar Picker",
                    handler: () => {
                      setShowPickerDropdown(pedidoParaAsignar);
                      setShowAlert(false);
                    },
                  },
                ]
          }
        />
        <IonAlert
          isOpen={showDeleteSuccess}
          message="El pedido fue cancelado correctamente."
          buttons={[
            {
              text: "Aceptar",
              handler: () => setShowDeleteSuccess(false),
            },
          ]}
        />
        <IonAlert
          isOpen={showConfirmAsignar}
          onDidDismiss={() => setShowConfirmAsignar(false)}
          header={(() => {
            const estado = pedidos
              .find((p) => p.numeroPedido === pedidoParaAsignar)
              ?.EstadoPedido?.tipoEstado?.trim()
              .toLowerCase();
            if (estado === "pendiente de pago") return "Confirmar abono";
            return "Confirmar asignación";
          })()}
          message={(() => {
            const estado = pedidos
              .find((p) => p.numeroPedido === pedidoParaAsignar)
              ?.EstadoPedido?.tipoEstado?.trim()
              .toLowerCase();
            if (estado === "pendiente de pago")
              return `¿El pedido '${pedidoParaAsignar}' fue abonado?`;
            return `¿Asignar picker '${selectedPicker?.nombre}' al pedido ${pedidoParaAsignar}?`;
          })()}
          buttons={(() => {
            const estado = pedidos
              .find((p) => p.numeroPedido === pedidoParaAsignar)
              ?.EstadoPedido?.tipoEstado?.trim()
              .toLowerCase();
            if (estado === "pendiente de pago") {
              return [
                {
                  text: "Aceptar",
                  handler: async () => {
                    await handleConfirmAbonar(
                      pedidoParaAsignar,
                      setAlertMsg,
                      setShowAlert,
                      setShowConfirmAsignar,
                      setPedidoParaAsignar,
                      setPedidos
                    );
                    setShowConfirmAsignar(false);
                  },
                },
              ];
            }
            return [
              {
                text: "Cancelar",
                role: "cancel",
                handler: () => setShowConfirmAsignar(false),
              },
              {
                text: "Asignar",
                handler: () =>
                  asignarPicker(
                    pedidoParaAsignar,
                    selectedPicker,
                    setAlertMsg,
                    setShowAlert,
                    setShowConfirmAsignar,
                    setShowPickerDropdown,
                    setSelectedPicker,
                    setPedidoParaAsignar,
                    setPedidos
                  ),
              },
            ];
          })()}
        />
        <IonAlert
          isOpen={showFinalizarConfirm}
          onDidDismiss={() => setShowFinalizarConfirm(false)}
          header="Confirmar"
          message={`¿Desea dar como Finalizado el Pedido '${pedidoParaFinalizar}'?`}
          buttons={[
            {
              text: "Finalizar",
              handler: async () => {
                await handleConfirmFinalizar(
                  pedidoParaFinalizar,
                  setAlertMsg,
                  setShowAlert,
                  setShowFinalizarConfirm,
                  setPedidoParaFinalizar,
                  setPedidos
                );
              },
            },
          ]}
        />
        <IonModal
          isOpen={showMotivoModal}
          onDidDismiss={() => setShowMotivoModal(false)}
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
                    motivoSeleccionado === motivo.idMotivo ? 'selected' : ''
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
                    <div className="motivo-option-text">{motivo.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="motivo-cancelacion-buttons">
              <IonButton
                onClick={() => {
                  setShowMotivoModal(false);
                  setPedidoParaCancelar(null);
                  setMotivoSeleccionado(null);
                }}
                className="motivo-cancelacion-btn-cancelar"
              >
                Cancelar
              </IonButton>
              <IonButton
                disabled={!motivoSeleccionado || !pedidoParaCancelar}
                className="motivo-cancelacion-btn-confirmar"
                onClick={async () => {
                  if (!motivoSeleccionado || !pedidoParaCancelar || !username) return;
                  
                  try {
                    // Primero obtener el ID del usuario por su nombre de usuario
                    const userResponse = await fetch(`/api/usuarios/buscar-por-nombre/${username}`, {
                      headers: {
                        "nombreUsuario": username  // Agregar header de autorización si es necesario
                      }
                    });
                    let idUsuarioCancelo = null;
                    
                    if (userResponse.ok) {
                      const userData = await userResponse.json();
                      idUsuarioCancelo = userData.idUsuario;
                    }
                    
                    if (!idUsuarioCancelo) {
                      setAlertMsg("Error: No se pudo identificar el usuario que cancela");
                      setShowAlert(true);
                      return;
                    }
                    
                    // Proceder con la cancelación
                    const response = await fetch(
                      `/api/pedidos/${pedidoParaCancelar}/cancelar`,
                      {
                        method: "PUT",
                        headers: { 
                          "Content-Type": "application/json",
                          "nombreUsuario": username  // Agregar header de autorización
                        },
                        body: JSON.stringify({ 
                          idMotivo: motivoSeleccionado,
                          idUsuarioCancelo: idUsuarioCancelo 
                        }),
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
                      return;
                    }

                    setShowDeleteSuccess(true);
                    cargarPedidos().then(setPedidos);
                    setShowMotivoModal(false);
                    setPedidoParaCancelar(null);
                    setMotivoSeleccionado(null);
                  } catch (error) {
                    setAlertMsg("Error de conexión al cancelar el pedido.");
                    setShowAlert(true);
                    setShowMotivoModal(false);
                    setPedidoParaCancelar(null);
                    setMotivoSeleccionado(null);
                  }
                }}
              >
                Confirmar Cancelación
              </IonButton>
            </div>
          </div>
        </IonModal>

        {/* Alerta de Error de Autorización */}
        <IonAlert
          isOpen={showAuthError}
          onDidDismiss={() => setShowAuthError(false)}
          header="Acceso Denegado"
          message={authErrorMsg}
          buttons={[
            {
              text: "Entendido",
              handler: () => {
                setShowAuthError(false);
                // Opcional: redirigir al dashboard o página principal
                history.push("/dashboard");
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Pedidos;
