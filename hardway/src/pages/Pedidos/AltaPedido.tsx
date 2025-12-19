// src/pages/Pedidos/AltaPedido.tsx
import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonAlert,
  IonMenuButton,
  IonModal,
  IonList,
  IonIcon,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  person,
  shirt,
  list,
  shirtOutline,
  add,
  arrowBack,
  checkmark,
  save,
  carOutline,
} from "ionicons/icons";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { crearPedido, editarPedido } from "../../utils/pedidosUtils";
import { useClientesVip } from "../../utils/useClientesVip";
import axiosInstance from "../../config/axios";
import "./AltaPedido.css";
import zepelin from "../../assets/images/zepelin.png";
import { useClientes, Cliente } from "../../context/ClientesContext";

// --- Tipo para el pedido ---
type PedidoInput = {
  descripcion: string;
  fecha: string;
  estado: string;
  clienteId: number;
  indumentaria: { idIndumentaria: number; cantidad: number }[];
};

const estadoInicial = {
  idCliente: "",
  clienteNombre: "",
  idEstado: "", // si quieres permitir elegir estado
};

const AltaPedido: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const location = useLocation();

  const { clientes } = useClientes();
  const { vipIds } = useClientesVip();

  // ...estados...

  const [form, setForm] = useState(estadoInicial);
  const [prendasSeleccionadas, setPrendasSeleccionadas] = useState<
    {
      codigoIndumentaria: string;
      nombre: string;
      color: string;
      talle: string;
      nombreTela: string;
      cantidad: number;
    }[]
  >([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState("");
  const esEdicion = Boolean(id);

  // --- Indumentaria ---
  const [indumentaria, setIndumentaria] = useState<any[]>([]);
  const [showIndumentariaModal, setShowIndumentariaModal] = useState(false);
  const [filtroIndumentaria, setFiltroIndumentaria] = useState("");

  // --- Empresas de Envío ---
  const [empresasEnvio, setEmpresasEnvio] = useState<{ idEmpresaEnvio: number; nombre: string }[]>([]);
  const [empresaEnvioSeleccionada, setEmpresaEnvioSeleccionada] = useState<string>("");

  // Calcular total y descuento si corresponde (después de los estados)
  const esVip = form.idCliente && vipIds.has(Number(form.idCliente));
  const totalPedido = prendasSeleccionadas.reduce((acc, prenda) => {
    // Buscar precio de la prenda en el catálogo
    const prendaCat = indumentaria.find(
      (i) => i.codigoIndumentaria === prenda.codigoIndumentaria
    );
    const precio = prendaCat ? prendaCat.precio : 0;
    return acc + precio * prenda.cantidad;
  }, 0);
  const descuento = esVip ? totalPedido * 0.1 : 0;
  const totalConDescuento = totalPedido - descuento;

  // Limpiar formulario y prendas SIEMPRE al entrar a la página de alta
  useEffect(() => {
    if (!esEdicion) {
      setForm({
        ...estadoInicial,
      });
      setPrendasSeleccionadas([]);
      setEmpresaEnvioSeleccionada(""); // Limpiar empresa de envío
    }
    // eslint-disable-next-line
  }, [location.pathname, esEdicion]);

  // Cargar indumentaria
  useEffect(() => {
    axiosInstance.get("/api/indumentaria").then((res) => {
      // Mapear datos anidados del backend a estructura plana
      const indumentariaMapeada = res.data.map((item: any) => ({
        codigoIndumentaria: item.codigoIndumentaria,
        nombre:
          item.DetalleIndumentarium?.NombreIndumentarium?.nombre ||
          "Sin nombre",
        color: item.DetalleIndumentarium?.Color?.color || "Sin color",
        nombreTela:
          item.DetalleIndumentarium?.TelaIndumentarium?.tipoTela || "Sin tela",
        talle: item.DetalleIndumentarium?.Talle?.talle || "Sin talle",
        categoria:
          item.DetalleIndumentarium?.CategoriaIndumentarium?.categoria ||
          "Sin categoría",
        precio: parseFloat(
          item.DetalleIndumentarium?.PrecioIndumentarium?.precio || "0"
        ),
        estado:
          item.DetalleIndumentarium?.EstadoIndumentarium?.estadoIndumentaria ||
          "Sin estado",
        cantidadIndumentaria:
          item.DetalleIndumentarium?.cantidadIndumentaria || 0,
        idIndumentaria: item.idDetalle,
      }));
      setIndumentaria(indumentariaMapeada);
    });
  }, []);

  // Cargar empresas de envío
  useEffect(() => {
    const cargarEmpresasEnvio = async () => {
      try {
        const resEmpresas = await axiosInstance.get("/api/auxiliares/empresas-envio");
        setEmpresasEnvio(resEmpresas.data);
      } catch (error) {
        console.error("Error al cargar empresas de envío:", error);
        setAlertMsg("Error al cargar las empresas de envío");
        setShowAlert(true);
      }
    };
    cargarEmpresasEnvio();
  }, []);

  // Almacenar datos de pedido para procesamiento posterior
  const [datosDelPedido, setDatosDelPedido] = useState<any>(null);

  // Cargar datos si es edición
  useEffect(() => {
    if (esEdicion && id) {
      const cargarPedido = async () => {
        try {
          const res = await axiosInstance.get(`/api/pedidos/${id}`);
          setForm({
            idCliente: res.data.idCliente?.toString() || "",
            clienteNombre: res.data.Cliente?.Persona
              ? `${res.data.Cliente.Persona.nombre} ${
                  res.data.Cliente.Persona.apellido ?? ""
                }`.trim()
              : "",
            idEstado: res.data.idEstado?.toString() || "",
          });

          // Cargar empresa de envío
          if (res.data.idEmpresaEnvio) {
            setEmpresaEnvioSeleccionada(res.data.idEmpresaEnvio.toString());
          }

          // Guardar los datos del pedido para procesarlos cuando tengamos el catálogo
          if (res.data.DetallePedidos) {
            setDatosDelPedido(res.data.DetallePedidos);
          }
        } catch (error: any) {
          console.error("Error al cargar el pedido:", error);
          if (error.response?.status === 401) {
            setAlertMsg(
              "Error de autenticación. Por favor, inicie sesión nuevamente."
            );
          } else if (error.response?.status === 404) {
            setAlertMsg("Pedido no encontrado.");
          } else if (error.response?.data?.error) {
            setAlertMsg(`Error: ${error.response.data.error}`);
          } else {
            setAlertMsg("Error al cargar el pedido.");
          }
          setShowAlert(true);
        }
      };
      cargarPedido();
    }
  }, [id, esEdicion]);

  // Procesar las prendas cuando tengamos tanto los datos del pedido como el catálogo de indumentaria
  useEffect(() => {
    if (datosDelPedido && indumentaria.length > 0) {
      const prendasDelPedido = datosDelPedido.map((detalle: any) => {
        // Buscamos en el catálogo la información completa de esta indumentaria
        const indumentariaEnCatalogo = indumentaria.find(
          (item) => item.codigoIndumentaria === detalle.codigoIndumentaria
        );

        // Si la encontramos en el catálogo, usamos los datos más completos
        if (indumentariaEnCatalogo) {
          return {
            codigoIndumentaria: detalle.codigoIndumentaria,
            nombre: indumentariaEnCatalogo.nombre || "Sin nombre",
            color: indumentariaEnCatalogo.color || "Sin color",
            talle: indumentariaEnCatalogo.talle || "Sin talle",
            nombreTela: indumentariaEnCatalogo.nombreTela || "Sin tela",
            cantidad: detalle.cantidad,
          };
        } else {
          // Si no está en el catálogo, usamos los datos del detalle
          return {
            codigoIndumentaria: detalle.codigoIndumentaria,
            nombre:
              detalle.Indumentarium?.DetalleIndumentarium?.NombreIndumentarium
                ?.nombre ||
              detalle.codigoIndumentaria ||
              "Sin nombre",
            color:
              detalle.Indumentarium?.DetalleIndumentarium?.Color?.color ||
              "Sin color",
            talle:
              detalle.Indumentarium?.DetalleIndumentarium?.Talle?.talle ||
              "Sin talle",
            nombreTela:
              detalle.Indumentarium?.DetalleIndumentarium?.TelaIndumentarium
                ?.tipoTela || "Sin tela",
            cantidad: detalle.cantidad,
          };
        }
      });

      setPrendasSeleccionadas(prendasDelPedido);
    }
  }, [datosDelPedido, indumentaria]);

  // --- Lógica de prendas ---
  const agregarPrenda = (prenda: any, cantidad: number) => {
    if (
      prendasSeleccionadas.some(
        (p) => p.codigoIndumentaria === prenda.codigoIndumentaria
      )
    ) {
      setAlertMsg("Ya has agregado esta Indumentaria.");
      setShowAlert(true);
      return;
    }
    if (cantidad > prenda.cantidadIndumentaria) {
      setAlertMsg(
        `Stock insuficiente. Stock disponible: ${prenda.cantidadIndumentaria}`
      );
      setShowAlert(true);
      return;
    }
    setPrendasSeleccionadas((prev) => [
      ...prev,
      {
        codigoIndumentaria: prenda.codigoIndumentaria,
        nombre: prenda.nombre,
        color: prenda.color || "Sin color",
        talle: prenda.talle || "Sin talle",
        nombreTela: prenda.nombreTela || "Sin tela",
        cantidad,
      },
    ]);
    // Limpiar la cantidad temporal de la prenda agregada
    delete prenda._cantidadTemp;
    setShowIndumentariaModal(false);
    setFiltroIndumentaria("");
  };

  const eliminarPrenda = (codigoIndumentaria: string) => {
    setPrendasSeleccionadas((prev) =>
      prev.filter((p) => p.codigoIndumentaria !== codigoIndumentaria)
    );
  };

  // --- Envío del formulario ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idCliente) {
      setAlertMsg("Debe agregar un cliente");
      setShowAlert(true);
      return;
    }

    // Validar que el cliente esté activo
    const validacion = validarClienteActivo(Number(form.idCliente));
    if (!validacion.esValido) {
      setAlertMsg(validacion.mensaje);
      setShowAlert(true);
      return;
    }

    if (prendasSeleccionadas.length === 0) {
      setAlertMsg("Debes agregar al menos un producto al pedido.");
      setShowAlert(true);
      return;
    }

    // Validar que se haya seleccionado una empresa de envío
    if (!empresaEnvioSeleccionada) {
      setAlertMsg("Debe seleccionar una empresa de envío");
      setShowAlert(true);
      return;
    }

    try {
      const pedido = {
        idCliente: Number(form.idCliente),
        idEstado: 1,
        prendas: prendasSeleccionadas.map(
          ({ codigoIndumentaria, cantidad }) => ({
            codigoIndumentaria,
            cantidad,
          })
        ),
        total: totalConDescuento,
        descuento: descuento,
        esVip: esVip,
        idEmpresaEnvio: Number(empresaEnvioSeleccionada), // Agregar empresa de envío
      };

      console.log("📦 Datos del pedido a enviar:", pedido);
      console.log("🚚 Empresa seleccionada:", empresaEnvioSeleccionada);
      console.log("🚚 Empresa convertida a número:", Number(empresaEnvioSeleccionada));

      if (esEdicion && id) {
        // EDITAR pedido existente
        await editarPedido(id, pedido);
      } else {
        // CREAR nuevo pedido
        await crearPedido(pedido);
      }
      setShowSuccess(true);
    } catch (error) {
      setAlertMsg("Error al guardar el pedido.");
      setShowAlert(true);
    }
  };

  // --- Filtro de clientes ---
  const clientesFiltrados = (clientes ?? []).filter((c) => {
    if (!c || (typeof c.nombre !== "string" && typeof c.apellido !== "string"))
      return false; // Evita elementos undefined o sin nombre/apellido string
    const normalizar = (str: string) =>
      (str ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    
    const nombreCompleto = `${c.nombre || ""} ${c.apellido || ""}`;
    const nombreCompletoNormalizado = normalizar(nombreCompleto);
    const filtroNorm = normalizar(filtroCliente);
    
    return (
      normalizar(c.nombre || "").includes(filtroNorm) ||
      normalizar(c.apellido || "").includes(filtroNorm) ||
      nombreCompletoNormalizado.includes(filtroNorm) ||
      (c.numeroDocumento && c.numeroDocumento.toString().includes(filtroCliente))
    );
  });

  // --- Validación de cliente activo ---
  const validarClienteActivo = (clienteId: number) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      return { esValido: false, mensaje: "Cliente no encontrado" };
    }
    if (cliente.estaActivo === 0) {
      return {
        esValido: false,
        mensaje: `El cliente ${cliente.nombre} ${
          cliente.apellido || ""
        } está dado de baja, no se le puede asignar un pedido.`.trim(),
      };
    }
    return { esValido: true, mensaje: "" };
  };

  // --- Función para seleccionar cliente ---
  const seleccionarCliente = (cliente: Cliente) => {
    const validacion = validarClienteActivo(cliente.id);
    if (!validacion.esValido) {
      setAlertMsg(validacion.mensaje);
      setShowAlert(true);
      return;
    }

    setForm({
      ...form,
      idCliente: cliente.id.toString(),
      clienteNombre: `${cliente.nombre} ${cliente.apellido || ""}`.trim(),
    });
    setShowClienteModal(false);
  };

  return (
    <IonPage className="alta-pedido-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>{esEdicion ? `Editar Pedido` : "Nuevo Pedido"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="alta-pedido-content">
        <div className="form-container">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <img src={zepelin} alt="Hardway Logo" className="brand-logo" />
              <h1 className="hero-title">
                {esEdicion ? `Editar Pedido #${id}` : " Crear Nuevo Pedido"}
              </h1>
              <p className="hero-subtitle">
                {esEdicion
                  ? "Modifica los detalles del pedido existente"
                  : "Registra un nuevo pedido para tu cliente"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Card de Cliente */}
              <div className="form-card cliente-card">
                <div className="card-header">
                  <h3 className="card-title">
                    <IonIcon icon={person} />
                    Información del Cliente
                  </h3>
                  <p className="card-subtitle">
                    Selecciona el cliente para este pedido
                  </p>
                </div>
                <div className="card-content">
                  <IonItem
                    className={`form-item ${esEdicion ? "disabled" : ""}`}
                    button={!esEdicion}
                    onClick={
                      esEdicion ? undefined : () => setShowClienteModal(true)
                    }
                  >
                    <IonLabel position="floating">Cliente</IonLabel>
                    <IonInput
                      value={form.clienteNombre}
                      placeholder={
                        esEdicion
                          ? "Cliente del pedido"
                          : "Toca para seleccionar un cliente"
                      }
                      readonly
                      required
                    />
                  </IonItem>
                  {form.idCliente && (
                    <IonItem className="form-item">
                      <IonLabel position="floating">ID del Cliente</IonLabel>
                      <IonInput value={form.idCliente} readonly />
                    </IonItem>
                  )}

                  {/* Select de Empresa de Envío */}
                  <IonItem className="form-item empresa-envio-item">
                    <IonIcon icon={carOutline} slot="start" style={{ marginRight: '8px', color: '#fdb40b' }} />
                    <IonLabel position="floating">Empresa de Envío</IonLabel>
                    <IonSelect
                      value={empresaEnvioSeleccionada}
                      placeholder="Seleccione una empresa"
                      onIonChange={(e: CustomEvent) => setEmpresaEnvioSeleccionada(e.detail.value!)}
                      interface="popover"
                    >
                      {empresasEnvio.map((empresa) => (
                        <IonSelectOption 
                          key={empresa.idEmpresaEnvio} 
                          value={empresa.idEmpresaEnvio.toString()}
                        >
                          {empresa.nombre}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </div>
              </div>

              {/* Card de Prendas */}
              <div className="form-card full-width">
                <div className="card-header">
                  <h3 className="card-title">
                    <IonIcon icon={shirt} />
                    Indumentaria del Pedido
                  </h3>
                  <p className="card-subtitle">
                    Agrega las Indumentarias que incluirá este pedido
                  </p>
                </div>
                <div className="card-content">
                  <div className="prendas-header">
                    <div className="prendas-title">
                      <IonIcon icon={list} />
                      Indumentarias Seleccionadas
                    </div>
                    <div className="prendas-counter">
                      {prendasSeleccionadas.length}{" "}
                      {prendasSeleccionadas.length === 1 ? "indumentaria" : "indumentaria"}
                    </div>
                  </div>

                  {prendasSeleccionadas.length === 0 ? (
                    <div className="empty-state">
                      <IonIcon icon={shirtOutline} className="empty-icon" />
                      <h4 className="empty-title">No hay indumentarias agregadas</h4>
                      <p className="empty-description">
                        Haz clic en "Agregar Indumentria" para comenzar a
                        construir tu pedido
                      </p>
                    </div>
                  ) : (
                    <div className="prendas-list">
                      {prendasSeleccionadas.map((prenda) => (
                        <div
                          key={prenda.codigoIndumentaria}
                          className="prenda-card"
                        >
                          <button
                            className="remove-button"
                            onClick={() =>
                              eliminarPrenda(prenda.codigoIndumentaria)
                            }
                            title="Quitar prenda"
                          >
                            ×
                          </button>

                          <div className="prenda-header">
                            <div className="prenda-title-section">
                              <h4 className="prenda-name">{prenda.nombre}</h4>
                              <div className="prenda-code">
                                {prenda.codigoIndumentaria}
                              </div>
                            </div>
                          </div>

                          <div className="prenda-details">
                            <div className="prenda-detail">
                              <strong>Color:</strong> {prenda.color}
                            </div>
                            <div className="prenda-detail">
                              <strong>Talle:</strong> {prenda.talle}
                            </div>
                            <div className="prenda-detail">
                              <strong>Tela:</strong> {prenda.nombreTela}
                            </div>
                          </div>

                          <div className="prenda-quantity">
                            <span className="quantity-label">Cantidad:</span>
                            <div className="quantity-value">
                              <button
                                type="button"
                                className="quantity-btn"
                                onClick={() => {
                                  setPrendasSeleccionadas((prev) =>
                                    prev.map((p) =>
                                      p.codigoIndumentaria ===
                                      prenda.codigoIndumentaria
                                        ? {
                                            ...p,
                                            cantidad:
                                              p.cantidad > 1
                                                ? p.cantidad - 1
                                                : 1,
                                          }
                                        : p
                                    )
                                  );
                                }}
                                disabled={prenda.cantidad <= 1}
                              >
                                −
                              </button>
                              <span style={{ margin: "0 8px" }}>
                                {prenda.cantidad}
                              </span>
                              <button
                                type="button"
                                className="quantity-btn"
                                onClick={() => {
                                  // Buscar el stock máximo
                                  const prendaCat = indumentaria.find(
                                    (i) =>
                                      i.codigoIndumentaria ===
                                      prenda.codigoIndumentaria
                                  );
                                  const maxStock = prendaCat
                                    ? prendaCat.cantidadIndumentaria
                                    : 1;
                                  setPrendasSeleccionadas((prev) =>
                                    prev.map((p) =>
                                      p.codigoIndumentaria ===
                                      prenda.codigoIndumentaria
                                        ? {
                                            ...p,
                                            cantidad:
                                              p.cantidad < maxStock
                                                ? p.cantidad + 1
                                                : maxStock,
                                          }
                                        : p
                                    )
                                  );
                                }}
                                disabled={(() => {
                                  const prendaCat = indumentaria.find(
                                    (i) =>
                                      i.codigoIndumentaria ===
                                      prenda.codigoIndumentaria
                                  );
                                  const maxStock = prendaCat
                                    ? prendaCat.cantidadIndumentaria
                                    : 1;
                                  return prenda.cantidad >= maxStock;
                                })()}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <IonButton
                    className="button-secondary"
                    expand="block"
                    onClick={() => {
                      // Limpiar cantidades temporales antes de abrir el modal
                      indumentaria.forEach(prenda => delete prenda._cantidadTemp);
                      setShowIndumentariaModal(true);
                    }}
                  >
                    <IonIcon icon={add} slot="start" />
                    Agregar Indumentaria
                  </IonButton>
                </div>
              </div>
            </div>

            {/* Mostrar resumen de total y descuento si hay prendas */}
            {prendasSeleccionadas.length > 0 && (
              <div
                className="pedido-resumen-total"
                style={{ marginBottom: 16, marginTop: 8 }}
              >
                <div>
                  <strong>Total sin descuento:</strong> $
                  {totalPedido.toFixed(2)}
                </div>
                {esVip && (
                  <div style={{ color: "goldenrod", fontWeight: 600 }}>
                    <span role="img" aria-label="vip">
                      👑
                    </span>{" "}
                    Cliente VIP: 10% de descuento aplicado
                  </div>
                )}
                {descuento > 0 && (
                  <div>
                    <strong>Descuento:</strong> -${descuento.toFixed(2)}
                  </div>
                )}
                <div>
                  <strong>Total a pagar:</strong> $
                  {totalConDescuento.toFixed(2)}
                </div>
              </div>
            )}
            <div className="form-actions">
              <IonButton
                className="button-danger"
                fill="outline"
                expand="block"
                onClick={() => history.goBack()}
              >
                <IonIcon icon={arrowBack} slot="start" />
                Cancelar
              </IonButton>

              <IonButton
                className="button-success"
                type="submit"
                expand="block"
                disabled={!form.idCliente || prendasSeleccionadas.length === 0}
              >
                <IonIcon icon={esEdicion ? save : checkmark} slot="start" />
                {esEdicion ? "Guardar Cambios" : "Crear Pedido"}
              </IonButton>
            </div>
          </form>
        </div>

        {/* Alertas */}
        <IonAlert
          isOpen={showAlert}
          message={alertMsg}
          buttons={["Aceptar"]}
          onDidDismiss={() => setShowAlert(false)}
        />
        <IonAlert
          isOpen={showSuccess}
          message="Registro exitoso"
          buttons={[
            {
              text: "Aceptar",
              handler: () => {
                setShowSuccess(false);
                history.push("/pedidos");
              },
            },
          ]}
        />

        {/* --- Modal de selección de cliente --- */}
        <IonModal
          isOpen={showClienteModal}
          onDidDismiss={() => setShowClienteModal(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Seleccionar Cliente</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonItem>
              <IonInput
                placeholder="Buscar por nombre, apellido o DNI"
                value={filtroCliente}
                onIonChange={(e) => setFiltroCliente(e.detail.value!)}
                clearInput
              />
            </IonItem>
            <IonItem
              button
              onClick={() => {
                setShowClienteModal(false);
                history.push("/alta-cliente");
              }}
            >
              <IonLabel>Registrar nuevo cliente</IonLabel>
            </IonItem>
            <IonList>
              {clientesFiltrados.map((c) => (
                <IonItem
                  key={c.id}
                  button
                  onClick={() => seleccionarCliente(c)}
                  className={
                    c.estaActivo === 0 ? "cliente-inactivo" : "cliente-activo"
                  }
                >
                  <IonLabel>
                    <div className="cliente-info">
                      <div className="cliente-nombre">
                        {`${c.nombre} ${c.apellido || ""}`} ({c.numeroDocumento}
                        )
                      </div>
                      <div className="cliente-estado">
                        {c.estaActivo === 0 ? (
                          <span className="estado-chip inactivo">Inactivo</span>
                        ) : (
                          <span className="estado-chip activo">Activo</span>
                        )}
                      </div>
                    </div>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonContent>
        </IonModal>

        {/* --- Modal de selección de indumentaria --- */}
        <IonModal
          isOpen={showIndumentariaModal}
          onDidDismiss={() => {
            setShowIndumentariaModal(false);
            setFiltroIndumentaria("");
            // Limpiar todas las cantidades temporales al cerrar el modal
            indumentaria.forEach(prenda => delete prenda._cantidadTemp);
          }}
          className="indumentaria-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Seleccionar Indumentaria</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonItem>
              <IonInput
                placeholder="Buscar Indumentaria"
                value={filtroIndumentaria}
                onIonChange={(e) => setFiltroIndumentaria(e.detail.value!)}
                clearInput
              />
            </IonItem>
            <IonList class="indumentaria-list">
              {indumentaria
                .filter((i) => {
                  const filtro = (filtroIndumentaria ?? "").toLowerCase();
                  return (
                    (i.nombre ?? "").toLowerCase().includes(filtro) ||
                    (i.codigoIndumentaria &&
                      i.codigoIndumentaria.toLowerCase().includes(filtro))
                  );
                })
                .map((prenda) => (
                  <IonItem
                    key={prenda.codigoIndumentaria}
                    className="indumentaria-item"
                  >
                    <IonLabel class="indumentaria-label">
                      {`${prenda.nombre} - ${prenda.color} - ${prenda.talle} - ${prenda.nombreTela} - (Stock: ${prenda.cantidadIndumentaria})`}
                    </IonLabel>
                    <IonInput
                      class="cantidad-input"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Cantidad"
                      min={1}
                      value={prenda._cantidadTemp || ""}
                      onIonInput={(e: any) => {
                        // Solo permitir números, sin +, -, e, .
                        let valor = e.target.value.replace(/[^0-9]/g, "");
                        if (valor === "") valor = "1";
                        let cantidad = Number(valor);
                        if (cantidad > prenda.cantidadIndumentaria) {
                          setAlertMsg(
                            `Stock del producto insuficiente, el stock actual es: ${prenda.cantidadIndumentaria}`
                          );
                          setShowAlert(true);
                          cantidad = prenda.cantidadIndumentaria;
                        }
                        prenda._cantidadTemp = cantidad;
                        // Forzar el valor limpio en el input
                        e.target.value = cantidad;
                      }}
                    />
                    <IonButton
                      onClick={() =>
                        agregarPrenda(prenda, prenda._cantidadTemp || 1)
                      }
                    >
                      Agregar
                    </IonButton>
                  </IonItem>
                ))}
            </IonList>
            <IonButton
              expand="block"
              color="medium"
              onClick={() => setShowIndumentariaModal(false)}
            >
              Cerrar
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default AltaPedido;
