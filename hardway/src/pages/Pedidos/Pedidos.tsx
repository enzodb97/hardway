// src/pages/Pedidos/Pedidos.tsx
import React, { useState } from "react";
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
  obtenerPickerAsignado,
  exportarPDF,
} from "../../utils/pedidosUtils";
import { useHistory } from "react-router-dom";
import { pencil, trash, documentText, chevronDown, cash } from "ionicons/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  IonSelect,
  IonSelectOption,
  IonPopover,
  IonLabel,
  IonList,
  IonItem,
} from "@ionic/react";
import "./Pedidos.css";

const Pedidos: React.FC = () => {
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
  const history = useHistory();

  useIonViewWillEnter(() => {
    cargarPedidos().then(setPedidos);
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
  const pedidosAMostrar = mostrarTodos
    ? pedidosFiltrados
    : busqueda.trim() === ""
    ? pedidosFiltrados.slice(0, 5)
    : pedidosFiltrados;

  // --- FUNCIONES UTILITARIAS ---
  // Todas las funciones de negocio se delegan a pedidosUtils.ts

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
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      (!busqueda || busqueda.trim() === "")
                    ) {
                      setBusqueda(" ");
                    }
                  }}
                />
              </div>
            </IonCol>
            <IonCol size="2" className="ion-text-right pedidos-total-col">
              <span className="pedidos-total-badge">
                Total: {pedidosFiltrados.length}
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
                  {pedidosAMostrar.map((pedido) => (
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
                          <IonButton
                            fill="clear"
                            onClick={() =>
                              handleEliminarPedido(
                                pedido.numeroPedido,
                                setShowDeleteSuccess,
                                setPedidos,
                                setAlertMsg,
                                setShowAlert
                              )
                            }
                            className="delete-btn"
                          >
                            <IonIcon icon={trash} color="danger" />
                          </IonButton>
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
                                <IonItem>No hay pickers disponibles</IonItem>
                              )}
                              {pickers.map((picker) => (
                                <IonItem
                                  button
                                  key={picker.id}
                                  onClick={() => {
                                    setSelectedPicker(picker);
                                    setShowConfirmAsignar(true);
                                    setShowPickerDropdown(null);
                                  }}
                                >
                                  <IonLabel>{picker.nombre}</IonLabel>
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
                onClick={() => exportarPDF(pedidosAMostrar)}
              >
                Exportar lista de pedidos a PDF
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={
            alertMsg === "El pedido fue marcado como abonado correctamente."
              ? undefined
              : "Advertencia"
          }
          message={alertMsg}
          buttons={
            alertMsg === "El pedido fue marcado como abonado correctamente."
              ? [
                  {
                    text: "Aceptar",
                    handler: () => setShowAlert(false),
                  },
                ]
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
          message="Se eliminó correctamente el pedido"
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
      </IonContent>
    </IonPage>
  );
};

export default Pedidos;
