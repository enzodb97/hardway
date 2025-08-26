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
import { 
  cargarAuxiliares, 
  cargarIndumentaria, 
  crearNuevoColor, 
  crearNuevoTalle, 
  crearNuevaTela, 
  crearNuevaCategoria,
  guardarIndumentaria,
  camposIniciales,
  IndumentariaFormData,
  Color,
  Talle,
  Tela,
  Categoria,
  Estado,
  UnidadMedida,
  Rack
} from "../../utils/indumentariaUtils";



const AltaIndumentaria: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const [form, setForm] = useState(camposIniciales);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Estados para los alerts de nuevos items
  const [showNewColorAlert, setShowNewColorAlert] = useState(false);
  const [showNewTalleAlert, setShowNewTalleAlert] = useState(false);
  const [showNewTelaAlert, setShowNewTelaAlert] = useState(false);
  const [showNewCategoriaAlert, setShowNewCategoriaAlert] = useState(false);
  const [newItemValue, setNewItemValue] = useState("");
  const esEdicion = Boolean(id);

  const [colores, setColores] = useState<Color[]>([]);
  const [talles, setTalles] = useState<Talle[]>([]);
  const [telas, setTelas] = useState<Tela[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [precios, setPrecios] = useState<any[]>([]);
  const [nombresIndumentaria, setNombresIndumentaria] = useState<any[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);

  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        const datos = await cargarAuxiliares();
        setColores(datos.colores);
        setTalles(datos.talles);
        setTelas(datos.telas);
        setCategorias(datos.categorias);
        setEstados(datos.estados);
        setPrecios(datos.precios);
        setNombresIndumentaria(datos.nombresIndumentaria);
        setUnidadesMedida(datos.unidadesMedida);
        setRacks(datos.racks);
      } catch (error) {
        if (error instanceof Error) {
          setAlertMsg(error.message);
        } else {
          setAlertMsg("Error al cargar datos auxiliares.");
        }
        setShowAlert(true);
      }
    };
    inicializarDatos();
  }, []);

  useEffect(() => {
    if (esEdicion && id) {
      const cargarPrendaExistente = async () => {
        try {
          const datos = await cargarIndumentaria(id);
          setForm(datos);
        } catch (error) {
          if (error instanceof Error) {
            setAlertMsg(error.message);
          } else {
            setAlertMsg("Error al cargar la Indumentaria.");
          }
          setShowAlert(true);
        }
      };
      cargarPrendaExistente();
    } else {
      setForm(camposIniciales);
    }
  }, [id, esEdicion]);

  const handleChange = (campo: string, valor: string) => {
    setForm({ ...form, [campo]: valor });
  };

  // Manejadores para nuevos items
  const handleNewColor = async (value: string) => {
    if (!value) return;
    try {
      const nuevoColor = await crearNuevoColor(value);
      setColores([...colores, nuevoColor]);
      handleChange("idColor", String(nuevoColor.idColor));
      setShowToast(true);
      setShowNewColorAlert(false);
    } catch (error) {
      setAlertMsg("Error al crear el nuevo color");
      setShowAlert(true);
    }
  };

  const handleNewTalle = async (value: string) => {
    if (!value) return;
    try {
      const nuevoTalle = await crearNuevoTalle(value);
      setTalles([...talles, nuevoTalle]);
      handleChange("idTalle", String(nuevoTalle.idTalle));
      setShowToast(true);
      setShowNewTalleAlert(false);
    } catch (error) {
      setAlertMsg("Error al crear el nuevo talle");
      setShowAlert(true);
    }
  };

  const handleNewTela = async (value: string) => {
    if (!value) return;
    try {
      const nuevaTela = await crearNuevaTela(value);
      setTelas([...telas, nuevaTela]);
      handleChange("idTela", String(nuevaTela.idTela));
      setShowToast(true);
      setShowNewTelaAlert(false);
    } catch (error) {
      setAlertMsg("Error al crear la nueva tela");
      setShowAlert(true);
    }
  };

  const handleNewCategoria = async (value: string) => {
    if (!value) return;
    try {
      const nuevaCategoria = await crearNuevaCategoria(value);
      setCategorias([...categorias, nuevaCategoria]);
      handleChange("idCategoria", String(nuevaCategoria.idCategoria));
      setShowToast(true);
      setShowNewCategoriaAlert(false);
    } catch (error) {
      setAlertMsg("Error al crear la nueva categoría");
      setShowAlert(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowLoading(true);
    try {
      await guardarIndumentaria({ form, esEdicion, id });
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
                                  setShowNewColorAlert(true);
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
                                  setShowNewTalleAlert(true);
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
                                  setShowNewTelaAlert(true);
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
                                  setShowNewCategoriaAlert(true);
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

        {/* Alertas para nuevos items */}
        <IonAlert
          isOpen={showNewColorAlert}
          onDidDismiss={() => setShowNewColorAlert(false)}
          header="Nuevo Color"
          inputs={[
            {
              name: 'color',
              type: 'text',
              placeholder: 'Ingrese el nuevo color'
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Agregar',
              handler: (data) => {
                handleNewColor(data.color);
              }
            }
          ]}
        />

        <IonAlert
          isOpen={showNewTalleAlert}
          onDidDismiss={() => setShowNewTalleAlert(false)}
          header="Nuevo Talle"
          inputs={[
            {
              name: 'talle',
              type: 'text',
              placeholder: 'Ingrese el nuevo talle'
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Agregar',
              handler: (data) => {
                handleNewTalle(data.talle);
              }
            }
          ]}
        />

        <IonAlert
          isOpen={showNewTelaAlert}
          onDidDismiss={() => setShowNewTelaAlert(false)}
          header="Nueva Tela"
          inputs={[
            {
              name: 'tela',
              type: 'text',
              placeholder: 'Ingrese el nuevo tipo de tela'
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Agregar',
              handler: (data) => {
                handleNewTela(data.tela);
              }
            }
          ]}
        />

        <IonAlert
          isOpen={showNewCategoriaAlert}
          onDidDismiss={() => setShowNewCategoriaAlert(false)}
          header="Nueva Categoría"
          inputs={[
            {
              name: 'categoria',
              type: 'text',
              placeholder: 'Ingrese la nueva categoría'
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Agregar',
              handler: (data) => {
                handleNewCategoria(data.categoria);
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AltaIndumentaria;
