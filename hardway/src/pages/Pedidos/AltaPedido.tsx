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
} from "@ionic/react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { crearPedido, editarPedido } from "../../utils/pedidosUtils";
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

  // Limpiar formulario y prendas SIEMPRE al entrar a la página de alta
  useEffect(() => {
    if (!esEdicion) {
      setForm({
        ...estadoInicial,
      });
      setPrendasSeleccionadas([]);
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
      setAlertMsg("Ya has agregado esta prenda.");
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
      };

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
    const filtroNorm = normalizar(filtroCliente);
    return (
      normalizar(c.nombre || "").includes(filtroNorm) ||
      normalizar(c.apellido || "").includes(filtroNorm) ||
      (c.numeroDocumento && c.numeroDocumento.toString().includes(filtroNorm))
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
          <IonTitle>
            {esEdicion
              ? `Editar Pedido${id ? ` #${id}` : ""}`
              : "Registrar Pedido"}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="alta-pedido-content">
        <form className="alta-pedido-form" onSubmit={handleSubmit}>
          <div className="titulo">
            <img src={zepelin} alt="Ícono Hardway" className="brand-logo" />
            <IonTitle>
              {esEdicion
                ? `Editar Pedido${id ? ` #${id}` : ""}`
                : "Registrar Pedido"}
            </IonTitle>
          </div>
          <IonItem>
            <IonLabel position="floating">Cliente ID</IonLabel>
            <IonInput value={form.idCliente} readonly />
          </IonItem>
          <IonItem button onClick={() => setShowClienteModal(true)}>
            <IonLabel position="floating">Cliente</IonLabel>
            <IonInput
              value={form.clienteNombre}
              placeholder="Seleccionar cliente"
              readonly
              required
            />
          </IonItem>
          {/* --- Prendas seleccionadas --- */}
          <IonList className="prendas-seleccionadas">
            {prendasSeleccionadas.map((prenda, idx) => (
              <IonItem key={prenda.codigoIndumentaria} className="prenda-item">
                <div className="prenda-info">
                  <div className="prenda-title">
                    <strong>{prenda.nombre}</strong>{" "}
                    <small>({prenda.codigoIndumentaria})</small>
                  </div>
                  <div className="prenda-details">
                    <span className="detail-tag color">
                      Color: {prenda.color}
                    </span>
                    <span className="detail-tag talle">
                      Talle: {prenda.talle}
                    </span>
                    <span className="detail-tag tela">
                      Tela: {prenda.nombreTela}
                    </span>
                    <span className="detail-tag cantidad">
                      Cant: {prenda.cantidad}
                    </span>
                  </div>
                </div>
                <div className="prenda-actions">
                  <IonButton
                    onClick={() => {
                      setPrendasSeleccionadas((prev) =>
                        prev.map((p, i) =>
                          i === idx && p.cantidad > 1
                            ? { ...p, cantidad: p.cantidad - 1 }
                            : p
                        )
                      );
                    }}
                    disabled={prenda.cantidad <= 1}
                    color="medium"
                    type="button"
                    size="small"
                  >
                    -
                  </IonButton>
                  <IonButton
                    onClick={() => {
                      // Stock real en base de datos
                      const stockReal =
                        indumentaria.find(
                          (i) =>
                            i.codigoIndumentaria === prenda.codigoIndumentaria
                        )?.cantidadIndumentaria ?? 0;

                      // Stock disponible = stock real - cantidad seleccionada actualmente
                      const stockDisponible = stockReal - prenda.cantidad;

                      if (stockDisponible <= 0) {
                        setAlertMsg(
                          `Stock del producto insuficiente, el stock actual es: ${stockReal}`
                        );
                        setShowAlert(true);
                        return;
                      }

                      setPrendasSeleccionadas((prev) =>
                        prev.map((p, i) =>
                          i === idx ? { ...p, cantidad: p.cantidad + 1 } : p
                        )
                      );
                    }}
                    color="medium"
                    type="button"
                    size="small"
                  >
                    +
                  </IonButton>
                  <IonButton
                    color="danger"
                    onClick={() => eliminarPrenda(prenda.codigoIndumentaria)}
                    type="button"
                    size="small"
                  >
                    Quitar
                  </IonButton>
                </div>
              </IonItem>
            ))}
          </IonList>
          <IonButton
            expand="block"
            onClick={() => setShowIndumentariaModal(true)}
            type="button"
          >
            Agregar Indumentaria
          </IonButton>
          <IonButton expand="block" type="submit">
            {esEdicion ? "Guardar Cambios" : "Guardar Pedido"}
          </IonButton>
        </form>
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
          onDidDismiss={() => setShowIndumentariaModal(false)}
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
                      {`${prenda.nombre} - ${prenda.color} - ${prenda.talle} - ${prenda.nombreTela} - (Stock: ${prenda.cantidadIndumentaria}`}
                      )
                    </IonLabel>
                    <IonInput
                      class="cantidad-input"
                      type="number"
                      placeholder="Cantidad"
                      min={1}
                      value={prenda._cantidadTemp || ""}
                      onIonChange={(e) => {
                        const cantidad = Number(e.detail.value);
                        if (cantidad > prenda.cantidadIndumentaria) {
                          setAlertMsg(
                            `Stock del producto insuficiente, el stock actual es: ${prenda.cantidadIndumentaria}`
                          );
                          setShowAlert(true);
                          prenda._cantidadTemp = prenda.cantidadIndumentaria;
                          return;
                        }
                        prenda._cantidadTemp = cantidad;
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
