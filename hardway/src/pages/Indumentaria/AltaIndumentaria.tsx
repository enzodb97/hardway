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
  obtenerSiguienteCodigoIndumentaria,
  validarCamposObligatorios,
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
  
  // Estados para confirmaciones y cambios
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formOriginal, setFormOriginal] = useState<IndumentariaFormData>(camposIniciales);
  
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

        // Solo generar código automático si no es edición
        if (!esEdicion) {
          const siguienteCodigo = await obtenerSiguienteCodigoIndumentaria();
          // Buscar el estado "Apta" y establecerlo por defecto
          const estadoApta = datos.estados.find((e: Estado) => e.estadoIndumentaria.toLowerCase() === 'apta');
          setForm(prev => ({ 
            ...prev, 
            codigoIndumentaria: siguienteCodigo,
            idEstado: estadoApta ? String(estadoApta.idEstado) : ""
          }));
        }
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
  }, [esEdicion]);

  useEffect(() => {
    if (esEdicion && id) {
      const cargarPrendaExistente = async () => {
        try {
          const datos = await cargarIndumentaria(id);
          setForm(datos);
          setFormOriginal(datos); // Guardar copia original para comparar
          setHasUnsavedChanges(false);
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
      setFormOriginal(camposIniciales);
      setHasUnsavedChanges(false);
    }
  }, [id, esEdicion]);

  const handleChange = (campo: string, valor: string) => {
    // Validación inmediata para cantidad
    if (campo === "cantidad" && valor && parseInt(valor) === 0) {
      setAlertMsg("La cantidad debe ser mayor a 0. Por favor, ingresa un valor válido de stock.");
      setShowAlert(true);
      return;
    }
    
    // Validación inmediata para precio
    if (campo === "precio" && valor && parseFloat(valor) === 0) {
      setAlertMsg("El precio debe ser mayor a 0. Por favor, ingresa un valor válido.");
      setShowAlert(true);
      return;
    }
    
    const newForm = { ...form, [campo]: valor };
    setForm(newForm);
    
    // Solo verificar cambios en modo edición
    if (esEdicion) {
      const hayDiferencias = JSON.stringify(newForm) !== JSON.stringify(formOriginal);
      setHasUnsavedChanges(hayDiferencias);
    }
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
    
    // Validar campos obligatorios
    const camposFaltantes = validarCamposObligatorios(form);
    if (camposFaltantes.length > 0) {
      const mensaje = `Por favor, complete los siguientes campos requeridos para continuar:

${camposFaltantes.join('\n')}

Todos los campos marcados son obligatorios para registrar la indumentaria correctamente.`;
      setAlertMsg(mensaje);
      setShowAlert(true);
      return;
    }
    
    // Si es edición, mostrar confirmación
    if (esEdicion) {
      setShowConfirmSave(true);
      return;
    }
    
    // Si es nueva indumentaria, proceder directamente
    await ejecutarGuardado();
  };

  const ejecutarGuardado = async () => {
    setShowLoading(true);
    try {
      await guardarIndumentaria({ form, esEdicion, id });
      setShowToast(true);
      setHasUnsavedChanges(false); // Resetear cambios no guardados
      // Marcar que la lista de indumentaria necesita refrescarse
      localStorage.setItem('indumentaria_needs_refresh', 'true');
      setTimeout(() => history.push("/indumentaria"), 1200);
    } catch (error) {
      setAlertMsg("Error al guardar la Indumentaria.");
      setShowAlert(true);
    } finally {
      setShowLoading(false);
    }
  };

  const handleNavigation = () => {
    if (esEdicion && hasUnsavedChanges) {
      setShowUnsavedChanges(true);
    } else {
      history.push("/indumentaria");
    }
  };

  return (
    <IonPage className="indumentaria-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>{esEdicion ? "Editar Indumentaria" : "Nueva Indumentaria"}</IonTitle>
          <IonButton 
            fill="clear" 
            slot="end" 
            onClick={handleNavigation}
            color="primary"
          >
            Volver
          </IonButton>
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
                    {esEdicion && hasUnsavedChanges && (
                      <span className="unsaved-changes-indicator">
                        • Cambios sin guardar
                      </span>
                    )}
                  </IonCardTitle>
                  <IonIcon icon={shirtOutline} className="empty-icon icon-inner" />
                </IonCardHeader>
                <IonCardContent>
                  <form onSubmit={handleSubmit} autoComplete="off" noValidate>
                    <IonGrid>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Código</IonLabel>
                            <IonInput
                              value={form.codigoIndumentaria}
                              onIonChange={(e) => handleChange("codigoIndumentaria", e.detail.value!)}
                              
                              readonly={true}
                              placeholder="Generado automáticamente"
                              className="readonly-input"
                            />
                          </IonItem>
                        </IonCol>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Nombre</IonLabel>
                            <IonInput
                              value={form.nombre}
                              onIonChange={(e) => handleChange("nombre", e.detail.value!)}
                              
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
                        {esEdicion && (
                          <IonCol size="12" sizeMd="6">
                            <IonItem>
                              <IonLabel position="floating" class="titulo">Estado</IonLabel>
                              <IonInput
                                value={estados.find(e => String(e.idEstado) === form.idEstado)?.estadoIndumentaria || ''}
                                readonly={true}
                                placeholder="Estado actual"
                                className="readonly-input"
                              />
                            </IonItem>
                          </IonCol>
                        )}
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Unidad de Medida</IonLabel>
                            <IonSelect
                              value={form.idUnidadMedida}
                              onIonChange={(e) => handleChange("idUnidadMedida", e.detail.value)}
                              
                            >
                              {unidadesMedida.map((u) => (
                                <IonSelectOption key={u.idUnidadMedida} value={String(u.idUnidadMedida)}>
                                  {u.nombreUnidad} ({u.abreviatura})
                                </IonSelectOption>
                              ))}
                            </IonSelect>
                          </IonItem>
                        </IonCol>
                        {!esEdicion && (
                          <IonCol size="12" sizeMd="6">
                            <IonItem>
                              <IonLabel>
                                <p className="auto-state-indicator">
                                  ✓ Estado: Se registrará automáticamente como "Apta"
                                </p>
                              </IonLabel>
                            </IonItem>
                          </IonCol>
                        )}
                      </IonRow>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="floating" class="titulo">Rack</IonLabel>
                            <IonSelect
                              value={form.idRack}
                              onIonChange={(e) => handleChange("idRack", e.detail.value)}
                              
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
                              onIonChange={(e) => handleChange("cantidad", e.detail.value!)}
                              
                              placeholder="Ej: 10"
                            />
                          </IonItem>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <IonButton 
                            expand="block" 
                            fill="outline"
                            color="danger"
                            border-radius="8px"
                            onClick={handleNavigation}
                            className="cancel-button"
                          >
                            Cancelar
                          </IonButton>
                        </IonCol>
                        <IonCol size="12" sizeMd="6">
                          <IonButton 
                            expand="block" 
                            type="submit" 
                            color={esEdicion && hasUnsavedChanges ? "warning" : "primary"}
                            className="submit-button"
                          >
                            {esEdicion ? 
                              (hasUnsavedChanges ? "Confirmar Cambios" : "Guardar Cambios") 
                              : "Registrar"
                            }
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
          cssClass="custom-alert"
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

        {/* Alert de confirmación para guardar cambios */}
        <IonAlert
          isOpen={showConfirmSave}
          onDidDismiss={() => setShowConfirmSave(false)}
          header="Confirmar Cambios"
          message="¿Estás seguro de que deseas guardar los cambios realizados?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Guardar',
              handler: () => {
                ejecutarGuardado();
                setShowConfirmSave(false);
              }
            }
          ]}
        />

        {/* Alert para cambios no guardados */}
        <IonAlert
          isOpen={showUnsavedChanges}
          onDidDismiss={() => setShowUnsavedChanges(false)}
          header="Cambios sin guardar"
          message="Tienes cambios sin guardar. ¿Quieres guardar los cambios antes de salir?"
          buttons={[
            {
              text: 'Salir sin guardar',
              role: 'destructive',
              handler: () => {
                setHasUnsavedChanges(false);
                history.push("/indumentaria");
              }
            },
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Guardar y salir',
              handler: async () => {
                await ejecutarGuardado();
                setShowUnsavedChanges(false);
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AltaIndumentaria;
