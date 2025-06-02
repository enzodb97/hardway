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
import { useHistory, useParams } from "react-router-dom";
import { crearPedido, editarPedido } from "../../utils/pedidosUtils";
import axios from "axios";
import "./AltaPedido.css";
import { useClientes } from "../../context/ClientesContext";

const AltaPedido: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const { clientes } = useClientes();
  const [form, setForm] = useState({
    descripcion: "",
    fecha: "",
    estado: "En Curso",
    clienteId: "",
    clienteNombre: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState("");
  const esEdicion = Boolean(id);

  // --- Indumentaria ---
  const [indumentaria, setIndumentaria] = useState<any[]>([]);
  const [prendasSeleccionadas, setPrendasSeleccionadas] = useState<
    { idIndumentaria: number; descripcion: string; cantidad: number }[]
  >([]);
  const [showIndumentariaModal, setShowIndumentariaModal] = useState(false);
  const [filtroIndumentaria, setFiltroIndumentaria] = useState("");

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
    } else {
      // Lógica para alta: formulario vacío y fecha actual
      setForm({
        descripcion: "",
        fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
        estado: "En Curso",
        clienteId: "",
        clienteNombre: "",
      });
      setPrendasSeleccionadas([]);
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
    if (prendasSeleccionadas.length === 0) {
      setAlertMsg("Debes agregar al menos una prenda al pedido.");
      setShowAlert(true);
      return;
    }
    try {
      if (esEdicion && id) {
        await editarPedido(Number(id), {
          ...form,
          clienteId: Number(form.clienteId),
          indumentaria: prendasSeleccionadas,
        });
      } else {
        await crearPedido({
          ...form,
          clienteId: Number(form.clienteId),
          indumentaria: prendasSeleccionadas,
        });
      }
      history.push("/pedidos");
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
          <IonItem button onClick={() => setShowClienteModal(true)}>
            <IonLabel position="floating">Cliente</IonLabel>
            <IonInput
              value={form.clienteNombre}
              placeholder="Seleccionar cliente"
              readonly
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Estado</IonLabel>
            <IonInput value={form.estado} readonly />
          </IonItem>

          {/* --- Prendas seleccionadas --- */}
          <IonList>
            {prendasSeleccionadas.map((prenda) => (
              <IonItem key={prenda.idIndumentaria}>
                <IonLabel>
                  {prenda.descripcion} (Cantidad: {prenda.cantidad})
                </IonLabel>
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
            Agregar Prenda
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
              <IonTitle>Seleccionar Prenda</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonItem>
              <IonInput
                placeholder="Buscar prenda"
                value={filtroIndumentaria}
                onIonChange={(e) => setFiltroIndumentaria(e.detail.value!)}
                clearInput
              />
            </IonItem>
            <IonList>
              {indumentaria
                .filter((i) =>
                  i.descripcionIndumentaria
                    .toLowerCase()
                    .includes(filtroIndumentaria.toLowerCase())
                )
                .map((prenda) => (
                  <IonItem key={prenda.idIndumentaria}>
                    <IonLabel>
                      {prenda.descripcionIndumentaria} (Stock:{" "}
                      {prenda.cantidadIndumentaria})
                    </IonLabel>
                    <IonInput
                      type="number"
                      placeholder="Cantidad"
                      min={1}
                      onIonChange={(e) => {
                        const cantidad = Number(e.detail.value);
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
