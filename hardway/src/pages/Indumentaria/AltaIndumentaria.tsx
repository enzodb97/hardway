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
  IonSelect,
  IonSelectOption,
  IonCol,
} from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import axiosInstance from "../../config/axios";

const camposIniciales = {
  codigoIndumentaria: "",
  nombre: "",
  idColor: "",
  idTalle: "",
  idTela: "",
  idCategoria: "",
  idEstado: "",
  idPrecio: "",
  precio: "",
  cantidad: "",
  idDetalle: "",
  cantidadAnterior: "",
  idUnidadMedida: "", // Nueva propiedad para la unidad de medida
};

const AltaIndumentaria: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const [form, setForm] = useState(camposIniciales);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const esEdicion = Boolean(id);

  const [colores, setColores] = useState<any[]>([]);
  const [talles, setTalles] = useState<any[]>([]);
  const [telas, setTelas] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [precios, setPrecios] = useState<any[]>([]);
  const [nombresIndumentaria, setNombresIndumentaria] = useState<any[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<any[]>([]);

  useEffect(() => {
    const cargarAuxiliares = async () => {
      try {
        const [
          coloresRes,
          tallesRes,
          telasRes,
          categoriasRes,
          estadosRes,
          preciosRes,
          nombresRes,
          unidadesRes,
        ] = await Promise.all([
          axiosInstance.get("/api/colores"),
          axiosInstance.get("/api/talles"),
          axiosInstance.get("/api/telas"),
          axiosInstance.get("/api/categorias"),
          axiosInstance.get("/api/estados-indumentaria"),
          axiosInstance.get("/api/precios"),
          axiosInstance.get("/api/nombres-indumentaria"),
          axiosInstance.get("/api/unidades-medida"),
        ]);
        setColores(coloresRes.data);
        setTalles(tallesRes.data);
        setTelas(telasRes.data);
        setCategorias(categoriasRes.data);
        setEstados(estadosRes.data);
        setPrecios(preciosRes.data);
        setNombresIndumentaria(nombresRes.data);
        setUnidadesMedida(unidadesRes.data);
      } catch {
        setAlertMsg("Error al cargar datos auxiliares.");
        setShowAlert(true);
      }
    };
    cargarAuxiliares();
  }, []);

  useEffect(() => {
    if (esEdicion && id) {
      const cargarPrenda = async () => {
        try {
          const res = await axiosInstance.get(`/api/indumentaria/${id}`);
          const data = res.data;
          setForm({
            codigoIndumentaria: data.codigoIndumentaria || "",
            nombre: data.DetalleIndumentarium?.NombreIndumentarium?.nombre || "",
            idColor: data.DetalleIndumentarium?.idColor?.toString() || "",
            idTalle: data.DetalleIndumentarium?.idTalle?.toString() || "",
            idTela: data.DetalleIndumentarium?.idTela?.toString() || "",
            idCategoria: data.DetalleIndumentarium?.idCategoria?.toString() || "",
            idEstado: data.DetalleIndumentarium?.idEstado?.toString() || "",
            idPrecio: data.DetalleIndumentarium?.idPrecio?.toString() || "",
            precio: data.DetalleIndumentarium?.PrecioIndumentarium?.precio || "",
            cantidad: data.DetalleIndumentarium?.cantidadIndumentaria?.toString() || "",
            idDetalle: data.idDetalle?.toString() || "",
            cantidadAnterior: data.DetalleIndumentarium?.cantidadIndumentaria?.toString() || "",
            idUnidadMedida: data.DetalleIndumentarium?.idUnidadMedida?.toString() || "",
          });
        } catch (error) {
          setAlertMsg("Error al cargar la prenda.");
          setShowAlert(true);
        }
      };
      cargarPrenda();
    } else {
      setForm(camposIniciales);
    }
  }, [id, esEdicion]);

  const handleChange = (campo: string, valor: string) => {
    setForm({ ...form, [campo]: valor });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let idPrecio = form.idPrecio;

      // Si el usuario ingresó un precio manualmente (no seleccionó uno existente)
      if (form.precio && !form.idPrecio) {
        const precioRes = await axiosInstance.post("/api/precios", {
          precio: form.precio,
        });
        idPrecio = precioRes.data.idPrecio;
      }

      // 1. Busca o crea el nombre
      const nombreRes = await axiosInstance.post(
        "/api/nombres-indumentaria/find-or-create",
        {
          nombre: form.nombre,
        }
      );
      const idNombre = nombreRes.data.idNombre;

      // 2. Busca o crea el detalle
      const detalleRes = await axiosInstance.post(
        "/api/detalle-indumentaria/find-or-create",
        {
          idNombre,
          idPrecio,
          idCategoria: form.idCategoria,
          idColor: form.idColor,
          idTalle: form.idTalle,
          idEstado: form.idEstado,
          idTela: form.idTela,
          idUnidadMedida: form.idUnidadMedida,
        }
      );
      const idDetalle = detalleRes.data.idDetalle;

      // 3. Alta o edición
      if (esEdicion && id) {
        // Si el idDetalle es el mismo que el actual, actualiza el precio
        if (idDetalle === form.idDetalle) {
          await axiosInstance.put(`/api/detalle-indumentaria/${idDetalle}/precio`, {
            precio: form.precio,
          });
        } else {
          // Si cambió algún atributo, actualiza el detalle de la prenda
          await axiosInstance.put(`/api/indumentaria/${id}`, {
            codigoIndumentaria: form.codigoIndumentaria,
            idDetalle,
          });
          // Y actualiza el precio del nuevo detalle
          await axiosInstance.put(`/api/detalle-indumentaria/${idDetalle}/precio`, {
            precio: form.precio,
          });
        }

        // --- BLOQUE PARA AJUSTAR STOCK ---
        const cantidadActual = Number(form.cantidad);
        const cantidadAnterior = Number(form.cantidadAnterior);
        const diferencia = cantidadActual - cantidadAnterior;
        if (diferencia !== 0) {
          await axiosInstance.post("/api/stock/movimiento", {
            codigoIndumentaria: form.codigoIndumentaria,
            cantidad: diferencia,
            observaciones: "Ajuste manual desde edición",
          });
        }
        // --- FIN BLOQUE STOCK ---
      } else {
        await axiosInstance.post("/api/indumentaria", {
          codigoIndumentaria: form.codigoIndumentaria,
          idDetalle,
          cantidad: form.cantidad,
        });
        // Y actualiza el precio del nuevo detalle
        await axiosInstance.put(`/api/detalle-indumentaria/${idDetalle}/precio`, {
          precio: form.precio,
        });
      }
      history.push("/indumentaria");
    } catch (error) {
      setAlertMsg("Error al guardar la prenda.");
      setShowAlert(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>
            {esEdicion ? "Editar Indumentaria" : "Nueva Prenda"}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="floating">Código</IonLabel>
            <IonInput
              value={form.codigoIndumentaria}
              onIonChange={(e) =>
                handleChange("codigoIndumentaria", e.detail.value!)
              }
              required
              readonly={esEdicion}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Nombre</IonLabel>
            <IonInput
              value={form.nombre}
              onIonChange={(e) => handleChange("nombre", e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Color</IonLabel>
            <IonSelect
              value={form.idColor}
              onIonChange={(e) => {
                if (e.detail.value === "nuevo") {
                  const nuevoColor = prompt("Ingrese el nuevo color:");
                  if (nuevoColor) {
                    axiosInstance
                      .post("/api/colores", { color: nuevoColor })
                      .then((res) => {
                        setColores([...colores, res.data]);
                        handleChange("idColor", res.data.idColor);
                      });
                  }
                } else {
                  handleChange("idColor", e.detail.value);
                }
              }}
              required
            >
              {colores.map((c) => (
                <IonSelectOption key={c.idColor} value={c.idColor}>
                  {c.color}
                </IonSelectOption>
              ))}
              <IonSelectOption value="nuevo">
                + Agregar nuevo color
              </IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Talle</IonLabel>
            <IonSelect
              value={form.idTalle}
              onIonChange={(e) => {
                if (e.detail.value === "nuevo") {
                  const nuevoTalle = prompt("Ingrese el nuevo talle:");
                  if (nuevoTalle) {
                    axiosInstance
                      .post("/api/talles", { talle: nuevoTalle })
                      .then((res) => {
                        setTalles([...talles, res.data]);
                        handleChange("idTalle", res.data.idTalle);
                      });
                  }
                } else {
                  handleChange("idTalle", e.detail.value);
                }
              }}
              required
            >
              {talles.map((t) => (
                <IonSelectOption key={t.idTalle} value={t.idTalle}>
                  {t.talle}
                </IonSelectOption>
              ))}
              <IonSelectOption value="nuevo">
                + Agregar nuevo talle
              </IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Tela</IonLabel>
            <IonSelect
              value={form.idTela}
              onIonChange={(e) => {
                if (e.detail.value === "nuevo") {
                  const nuevaTela = prompt("Ingrese el nuevo tipo de tela:");
                  if (nuevaTela) {
                    axiosInstance
                      .post("/api/telas", { tipoTela: nuevaTela })
                      .then((res) => {
                        setTelas([...telas, res.data]);
                        handleChange("idTela", res.data.idTela);
                      });
                  }
                } else {
                  handleChange("idTela", e.detail.value);
                }
              }}
              required
            >
              {telas.map((t) => (
                <IonSelectOption key={t.idTela} value={t.idTela}>
                  {t.tipoTela}
                </IonSelectOption>
              ))}
              <IonSelectOption value="nuevo">
                + Agregar nueva tela
              </IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Categoría</IonLabel>
            <IonSelect
              value={form.idCategoria}
              onIonChange={(e) => {
                if (e.detail.value === "nuevo") {
                  const nuevaCategoria = prompt("Ingrese la nueva categoría:");
                  if (nuevaCategoria) {
                    axiosInstance
                      .post("/api/categorias", { categoria: nuevaCategoria })
                      .then((res) => {
                        setCategorias([...categorias, res.data]);
                        handleChange("idCategoria", res.data.idCategoria);
                      });
                  }
                } else {
                  handleChange("idCategoria", e.detail.value);
                }
              }}
              required
            >
              {categorias.map((c) => (
                <IonSelectOption key={c.idCategoria} value={c.idCategoria}>
                  {c.categoria}
                </IonSelectOption>
              ))}
              <IonSelectOption value="nuevo">
                + Agregar nueva categoría
              </IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Estado</IonLabel>
            <IonSelect
              value={form.idEstado}
              onIonChange={(e) => {
                if (e.detail.value === "nuevo") {
                  const nuevoEstado = prompt("Ingrese el nuevo estado:");
                  if (nuevoEstado) {
                    axiosInstance
                      .post("/api/estados-indumentaria", {
                        estadoIndumentaria: nuevoEstado,
                      })
                      .then((res) => {
                        setEstados([...estados, res.data]);
                        handleChange("idEstado", res.data.idEstado);
                      });
                  }
                } else {
                  handleChange("idEstado", e.detail.value);
                }
              }}
              required
            >
              {estados.map((e) => (
                <IonSelectOption key={e.idEstado} value={e.idEstado}>
                  {e.estadoIndumentaria}
                </IonSelectOption>
              ))}
              <IonSelectOption value="nuevo">
                + Agregar nuevo estado
              </IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Unidad de Medida</IonLabel>
            <IonSelect
              value={form.idUnidadMedida}
              onIonChange={(e) => handleChange("idUnidadMedida", e.detail.value)}
              required
            >
              {unidadesMedida.map((u) => (
                <IonSelectOption key={u.idUnidadMedida} value={u.idUnidadMedida}>
                  {u.nombreUnidad} ({u.abreviatura})
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Precio</IonLabel>
            <IonInput
              type="number"
              value={form.precio}
              onIonChange={(e) => handleChange("precio", e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Cantidad</IonLabel>
            <IonInput
              type="number"
              value={form.cantidad}
              min={0}
              onIonChange={(e) => handleChange("cantidad", e.detail.value!)}
              required
            />
          </IonItem>
          <IonButton expand="block" type="submit">
            {esEdicion ? "Guardar Cambios" : "Registrar Prenda"}
          </IonButton>
        </form>
        <IonAlert
          isOpen={showAlert}
          message={alertMsg}
          buttons={["Aceptar"]}
          onDidDismiss={() => setShowAlert(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default AltaIndumentaria;
