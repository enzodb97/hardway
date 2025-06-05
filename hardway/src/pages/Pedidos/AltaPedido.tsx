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
import axios from "axios";
import "./AltaPedido.css";
import zepelin from "../../assets/images/zepelin.png";
import { useClientes } from "../../context/ClientesContext";

// --- Tipo para el pedido ---
type PedidoInput = {
  descripcion: string;
  fecha: string;
  estado: string;
  clienteId: number;
  indumentaria: { idIndumentaria: number; cantidad: number }[];
};

const estadoInicial = {
  descripcion: "",
  fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
  estado: "",
  clienteId: "",
  clienteNombre: "",
};

const AltaPedido: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const location = useLocation();
  const { clientes } = useClientes();

  const [form, setForm] = useState(estadoInicial);
  const [prendasSeleccionadas, setPrendasSeleccionadas] = useState<
    { idIndumentaria: number; descripcion: string; cantidad: number }[]
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
        fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
      });
      setPrendasSeleccionadas([]);
    }
    // eslint-disable-next-line
  }, [location.pathname, esEdicion]);

  // Cargar indumentaria
  useEffect(() => {
    axios.get("/api/indumentaria").then((res) => setIndumentaria(res.data));
  }, []);

  // Cargar datos si es edición
  useEffect(() => {
    if (esEdicion && id) {
      const cargarPedido = async () => {
        try {
          const res = await axios.get(`/api/pedidos/${id}`);
          setForm({
            descripcion: res.data.descripcion,
            fecha: res.data.fecha,
            estado: res.data.estado,
            clienteId: res.data.clienteId?.toString() || "",
            clienteNombre: res.data.Cliente?.nombre || "",
          });
          // Cargar prendas asociadas al pedido
          if (res.data.Indumentaria) {
            setPrendasSeleccionadas(
              res.data.Indumentaria.map((prenda: any) => ({
                idIndumentaria: prenda.idIndumentaria,
                descripcion: prenda.descripcionIndumentaria,
                cantidad: prenda.PedidoIndumentaria.cantidad,
              }))
            );
          }
        } catch (error) {
          setAlertMsg("Error al cargar el pedido.");
          setShowAlert(true);
        }
      };
      cargarPedido();
    }
  }, [id, esEdicion]);

  // --- Lógica de prendas ---
  const agregarPrenda = (prenda: any, cantidad: number) => {
    if (
      prendasSeleccionadas.some(
        (p) => p.idIndumentaria === prenda.idIndumentaria
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
        idIndumentaria: prenda.idIndumentaria,
        descripcion: prenda.descripcionIndumentaria,
        cantidad,
      },
    ]);
    setShowIndumentariaModal(false);
    setFiltroIndumentaria("");
  };

  const eliminarPrenda = (idIndumentaria: number) => {
    setPrendasSeleccionadas((prev) =>
      prev.filter((p) => p.idIndumentaria !== idIndumentaria)
    );
  };

  // --- Envío del formulario ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) {
      setAlertMsg("Debe agregar un cliente");
      setShowAlert(true);
      return;
    }
    if (prendasSeleccionadas.length === 0) {
      setAlertMsg("Debes agregar al menos una prenda al pedido.");
      setShowAlert(true);
      return;
    }
    try {
      const pedido: PedidoInput = {
        ...form,
        estado: "En Curso", // Estado por defecto
        clienteId: Number(form.clienteId),
        indumentaria: prendasSeleccionadas.map(
          ({ idIndumentaria, cantidad }) => ({
            idIndumentaria,
            cantidad,
          })
        ),
      };
      if (esEdicion && id) {
        await editarPedido(Number(id), pedido);
      } else {
        await crearPedido(pedido);
      }
      setShowSuccess(true); // Mostrar mensaje de éxito
    } catch (error) {
      setAlertMsg("Error al guardar el pedido.");
      setShowAlert(true);
    }
  };

  // --- Filtro de clientes ---
  const clientesFiltrados = clientes.filter((c) => {
    const normalizar = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const filtroNorm = normalizar(filtroCliente);
    return (
      normalizar(c.nombre).includes(filtroNorm) ||
      (c.numeroDocumento && c.numeroDocumento.toString().includes(filtroNorm))
    );
  });

  return (
    <IonPage className="alta-pedido-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>{esEdicion ? "Editar Pedido" : "Nuevo Pedido"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="alta-pedido-content">
        <form className="alta-pedido-form" onSubmit={handleSubmit}>
          <div className="titulo">
            <img src={zepelin} alt="Ícono Hardway" className="brand-logo" />
            <IonTitle>
              {esEdicion ? "Editar Pedido" : "Registrar Pedido"}
            </IonTitle>
          </div>
          <IonItem>
            <IonLabel position="floating">Descripción</IonLabel>
            <IonInput
              value={form.descripcion}
              onIonChange={(e) =>
                setForm({ ...form, descripcion: e.detail.value! })
              }
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Fecha y hora</IonLabel>
            <IonInput value={form.fecha} readonly />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Cliente ID</IonLabel>
            <IonInput value={form.clienteId} readonly />
          </IonItem>
          {/* --- Cliente --- */}
          {esEdicion ? (
            // Si es edición, solo mostrar el cliente como texto no editable
            <IonItem>
              <IonLabel position="floating">Cliente</IonLabel>
              <IonInput value={form.clienteNombre} readonly />
            </IonItem>
          ) : (
            // Si es alta, permitir seleccionar cliente
            <IonItem button onClick={() => setShowClienteModal(true)}>
              <IonLabel position="floating">Cliente</IonLabel>
              <IonInput
                value={form.clienteNombre}
                placeholder="Seleccionar cliente"
                readonly
                required
              />
            </IonItem>
          )}

          {/* --- Prendas seleccionadas --- */}
          <IonList>
            {prendasSeleccionadas.map((prenda, idx) => (
              <IonItem key={prenda.idIndumentaria}>
                <IonLabel>
                  {prenda.descripcion} (Cantidad: {prenda.cantidad})
                </IonLabel>
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
                >
                  -
                </IonButton>
                <IonButton
                  onClick={() => {
                    // Stock real en base de datos
                    const stockReal =
                      indumentaria.find(
                        (i) => i.idIndumentaria === prenda.idIndumentaria
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
                >
                  +
                </IonButton>
                <IonButton
                  color="danger"
                  onClick={() => eliminarPrenda(prenda.idIndumentaria)}
                  type="button"
                >
                  Quitar
                </IonButton>
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
                placeholder="Buscar por nombre o DNI"
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
                  onClick={() => {
                    setForm({
                      ...form,
                      clienteId: c.id.toString(),
                      clienteNombre: c.nombre,
                    });
                    setShowClienteModal(false);
                  }}
                >
                  <IonLabel>
                    {c.nombre} ({c.numeroDocumento})
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
                  const filtro = filtroIndumentaria.toLowerCase();
                  return (
                    i.descripcionIndumentaria.toLowerCase().includes(filtro) ||
                    (i.codigoIndumentaria &&
                      i.codigoIndumentaria.toLowerCase().includes(filtro))
                  );
                })
                .map((prenda) => (
                  <IonItem
                    key={prenda.idIndumentaria}
                    className="indumentaria-item"
                  >
                    <IonLabel class="indumentaria-label">
                      {prenda.descripcionIndumentaria} (Stock:{" "}
                      {prenda.cantidadIndumentaria})
                    </IonLabel>
                    <IonInput
                      type="number"
                      placeholder="Cantidad"
                      min={1}
                      value={prenda._cantidadTemp || ""}
                      onIonChange={(e) => {
                        const cantidad = Number(e.detail.value);
                        // Validar stock en tiempo real
                        if (cantidad > prenda.cantidadIndumentaria) {
                          setAlertMsg(
                            `Stock del producto insuficiente, el stock actual es: ${prenda.cantidadIndumentaria}`
                          );
                          setShowAlert(true);
                          prenda._cantidadTemp = prenda.cantidadIndumentaria; // Opcional: limitar al máximo
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
