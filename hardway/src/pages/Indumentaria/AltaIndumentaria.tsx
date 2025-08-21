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
  IonGrid,
  IonRow,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLoading,
  IonToast,
  IonIcon
} from "@ionic/react";
import {
  shirtOutline,
} from "ionicons/icons";
import { useHistory, useParams } from "react-router-dom";
import axiosInstance from "../../config/axios";
import "./AltaIndumentaria.css";

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
  idUnidadMedida: "", // Propiedad para la unidad de medida
  idRack: "",        // Propiedad para el rack
};

const AltaIndumentaria: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const [form, setForm] = useState(camposIniciales);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const esEdicion = Boolean(id);

  const [colores, setColores] = useState<any[]>([]);
  const [talles, setTalles] = useState<any[]>([]);
  const [telas, setTelas] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [precios, setPrecios] = useState<any[]>([]);
  const [nombresIndumentaria, setNombresIndumentaria] = useState<any[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<any[]>([]);
  const [racks, setRacks] = useState<any[]>([]);

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
          racksRes,
        ] = await Promise.all([
          axiosInstance.get("/api/colores"),
          axiosInstance.get("/api/talles"),
          axiosInstance.get("/api/telas"),
          axiosInstance.get("/api/categorias"),
          axiosInstance.get("/api/estados-indumentaria"),
          axiosInstance.get("/api/precios"),
          axiosInstance.get("/api/nombres-indumentaria"),
          axiosInstance.get("/api/unidades-medida"),
          axiosInstance.get("/api/indumentaria/racks"),
        ]);
        setColores(coloresRes.data);
        setTalles(tallesRes.data);
        setTelas(telasRes.data);
        setCategorias(categoriasRes.data);
        setEstados(estadosRes.data);
        setPrecios(preciosRes.data);
        setNombresIndumentaria(nombresRes.data);
        setUnidadesMedida(unidadesRes.data);
        setRacks(racksRes.data);
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
            idRack: data.Stock?.idRack?.toString() || "",
          });
        } catch (error) {
          setAlertMsg("Error al cargar la Indumentaria.");
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
    setShowLoading(true);
    try {
      let idPrecio = form.idPrecio;
      if (form.precio && !form.idPrecio) {
        const precioRes = await axiosInstance.post("/api/precios", {
          precio: form.precio,
        });
        idPrecio = precioRes.data.idPrecio;
      }
      const nombreRes = await axiosInstance.post(
        "/api/nombres-indumentaria/find-or-create",
        { nombre: form.nombre }
      );
      const idNombre = nombreRes.data.idNombre;
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
      if (esEdicion && id) {
        if (idDetalle === form.idDetalle) {
          await axiosInstance.put(`/api/detalle-indumentaria/${idDetalle}/precio`, {
            precio: form.precio,
          });
        } else {
          await axiosInstance.put(`/api/indumentaria/${id}`, {
            codigoIndumentaria: form.codigoIndumentaria,
            idDetalle,
          });
          await axiosInstance.put(`/api/detalle-indumentaria/${idDetalle}/precio`, {
            precio: form.precio,
          });
        }
        const cantidadActual = Number(form.cantidad);
        const cantidadAnterior = Number(form.cantidadAnterior);
        const diferencia = cantidadActual - cantidadAnterior;
        if (diferencia !== 0 || form.idRack) {
          // Si hay cambio en el stock
          if (diferencia !== 0) {
            await axiosInstance.post("/api/indumentaria/stock/movimiento", {
              codigoIndumentaria: form.codigoIndumentaria,
              cantidad: diferencia,
              observaciones: "Ajuste manual desde edición",
            });
          }
          // Si hay cambio en el rack
          if (form.idRack) {
            await axiosInstance.put(`/api/indumentaria/stock/${form.codigoIndumentaria}`, {
              idRack: parseInt(form.idRack)
            });
          }
        }
      } else {
        await axiosInstance.post("/api/indumentaria", {
          codigoIndumentaria: form.codigoIndumentaria,
          idDetalle,
          cantidadInicial: parseInt(form.cantidad) || 0,
          idRack: parseInt(form.idRack) || null,
        });
        await axiosInstance.put(`/api/detalle-indumentaria/${idDetalle}/precio`, {
          precio: form.precio,
        });
      }
      setShowToast(true);
      setTimeout(() => history.push("/indumentaria"), 1200);
    } catch (error) {
      setAlertMsg("Error al guardar la Indumentaria.");
      setShowAlert(true);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <IonPage className="indumentaria-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>{esEdicion ? "Editar Indumentaria" : "Nueva Indumentaria"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
  <IonGrid className="alta-indumentaria-form-grid">
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="12">
              <IonCard className="alta-indumentaria-card ion-padding">
                <IonCardHeader>
                  <IonCardTitle>
                    {esEdicion ? "Editar Indumentaria" : "Registrar Nueva Indumentaria"}
                  </IonCardTitle>
                  <IonIcon icon={shirtOutline} className="empty-icon icon-inner" />
                </IonCardHeader>
                <IonCardContent>
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <IonGrid>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Código</IonLabel>
                            <IonInput
                              value={form.codigoIndumentaria}
                              onIonChange={(e) => handleChange("codigoIndumentaria", e.detail.value!)}
                              required
                              readonly={esEdicion}
                              placeholder="Ej: 1001"
                            />
                          </IonItem>
                        </IonCol>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Nombre</IonLabel>
                            <IonInput
                              value={form.nombre}
                              onIonChange={(e) => handleChange("nombre", e.detail.value!)}
                              required
                              placeholder="Ej: Camisa Oxford"
                            />
                          </IonItem>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Color</IonLabel>
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
                                <IonSelectOption key={c.idColor} value={String(c.idColor)}>
                                  {c.color}
                                </IonSelectOption>
                              ))}
                              <IonSelectOption value="nuevo">
                                + Agregar nuevo color
                              </IonSelectOption>
                            </IonSelect>
                          </IonItem>
                        </IonCol>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Talle</IonLabel>
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
                                <IonSelectOption key={t.idTalle} value={String(t.idTalle)}>
                                  {t.talle}
                                </IonSelectOption>
                              ))}
                              <IonSelectOption value="nuevo">
                                + Agregar nuevo talle
                              </IonSelectOption>
                            </IonSelect>
                          </IonItem>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Tela</IonLabel>
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
                                <IonSelectOption key={t.idTela} value={String(t.idTela)}>
                                  {t.tipoTela}
                                </IonSelectOption>
                              ))}
                              <IonSelectOption value="nuevo">
                                + Agregar nueva tela
                              </IonSelectOption>
                            </IonSelect>
                          </IonItem>
                        </IonCol>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Categoría</IonLabel>
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
                                <IonSelectOption key={c.idCategoria} value={String(c.idCategoria)}>
                                  {c.categoria}
                                </IonSelectOption>
                              ))}
                              <IonSelectOption value="nuevo">
                                + Agregar nueva categoría
                              </IonSelectOption>
                            </IonSelect>
                          </IonItem>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Estado</IonLabel>
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
                                <IonSelectOption key={e.idEstado} value={String(e.idEstado)}>
                                  {e.estadoIndumentaria}
                                </IonSelectOption>
                              ))}
                            </IonSelect>
                          </IonItem>
                        </IonCol>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Unidad de Medida</IonLabel>
                            <IonSelect
                              value={form.idUnidadMedida}
                              onIonChange={(e) => handleChange("idUnidadMedida", e.detail.value)}
                              required
                            >
                              {unidadesMedida.map((u) => (
                                <IonSelectOption key={u.idUnidadMedida} value={String(u.idUnidadMedida)}>
                                  {u.nombreUnidad} ({u.abreviatura})
                                </IonSelectOption>
                              ))}
                            </IonSelect>
                          </IonItem>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Rack</IonLabel>
                            <IonSelect
                              value={form.idRack}
                              onIonChange={(e) => handleChange("idRack", e.detail.value)}
                              required
                            >
                              {racks.map((r) => (
                                <IonSelectOption key={r.idRack} value={String(r.idRack)}>
                                  {r.numeroRack} - {r.descripcion || 'Sin descripción'}
                                </IonSelectOption>
                              ))}
                            </IonSelect>
                          </IonItem>
                        </IonCol>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Precio</IonLabel>
                            <IonInput
                              type="number"
                              value={form.precio}
                              onIonChange={(e) => handleChange("precio", e.detail.value!)}
                              required
                              placeholder="Ej: 1200"
                            />
                          </IonItem>
                        </IonCol>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Cantidad</IonLabel>
                            <IonInput
                              type="number"
                              value={form.cantidad}
                              min={0}
                              onIonChange={(e) => handleChange("cantidad", e.detail.value!)}
                              required
                              placeholder="Ej: 10"
                            />
                          </IonItem>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol size="12">
                          <IonButton expand="block" type="submit" color="primary" style={{ fontWeight: 600, fontSize: '1.1em', marginTop: 16 }}>
                            {esEdicion ? "Guardar Cambios" : "Registrar"}
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </form>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonLoading isOpen={showLoading} message="Guardando..." />
        <IonToast
          isOpen={showToast}
          message={esEdicion ? "Cambios guardados correctamente" : "Indumentaria registrada exitosamente"}
          duration={1200}
          color="success"
          onDidDismiss={() => setShowToast(false)}
        />
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
