import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonLabel,
  IonItem,
  IonMenuButton,
  IonSelect,
  IonSelectOption,
  IonAlert,
} from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { useClientes } from "../../context/ClientesContext";
import { Cliente } from "../../context/ClientesContext";
import "./AltaCliente.css";
import zepelin from "../../assets/images/zepelin.png";
import { useEffect, useState } from "react";
import {
  validarUnicidadCliente,
  validarCamposCliente,
  soloNumeros,
} from "../../utils/clientesUtils";
import axiosInstance from "../../config/axios";

// Función para capitalizar la primera letra de cada palabra
const capitalizar = (texto: string): string => {
  if (!texto) return texto;
  return texto
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const AltaCliente: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { clientes, agregarCliente, modificarCliente } = useClientes();
  const history = useHistory();
  const [esEdicion, setEsEdicion] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    tipoDocumento: "DNI",
    numeroDocumento: "",
    nombre: "",
    apellido: "",
    domicilio: "",
    calle: "",
    altura: "",
    piso: "",
    numeroDepartamento: "",
    observaciones: "",
    localidad: "",
    barrio: "",
    cp: "",
    telefono: "",
    email: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [previousNumeroDocumento, setPreviousNumeroDocumento] = useState("");
  const [previousTelefono, setPreviousTelefono] = useState("");
  const [showSuccess, setShowSuccess] = useState(false); // NUEVO

  useEffect(() => {
    if (id) {
      const clienteExistente = clientes.find((c) => c.id === Number(id));
      if (clienteExistente) {
        setFormData(clienteExistente);
        setEsEdicion(true);
        setPreviousNumeroDocumento(clienteExistente.numeroDocumento || "");
        setPreviousTelefono(clienteExistente.telefono || "");
      } else {
        console.log("❌ Cliente no encontrado con ID:", id);
      }
    }
  }, [id, clientes]);

  // Handlers delegados a utils
  const handleNumeroDocumentoChange = (e: any) => {
    const value = e.detail.value;
    let nuevoValor = soloNumeros(value, previousNumeroDocumento);
    
    // Validar longitud máxima según tipo de documento
    if (formData.tipoDocumento === 'DNI' && nuevoValor.length > 8) {
      nuevoValor = nuevoValor.substring(0, 8);
    } else if ((formData.tipoDocumento === 'CUIL' || formData.tipoDocumento === 'CUIT') && nuevoValor.length > 11) {
      nuevoValor = nuevoValor.substring(0, 11);
    }
    
    setFormData({ ...formData, numeroDocumento: nuevoValor });
    setPreviousNumeroDocumento(nuevoValor);
  };

  const handleTelefonoChange = (e: any) => {
    const value = e.detail.value;
    let nuevoValor = soloNumeros(value, previousTelefono);
    
    // Validar longitud máxima de 13 caracteres
    if (nuevoValor.length > 13) {
      setAlertMessage("El teléfono no puede superar los 13 dígitos.");
      setShowAlert(true);
      return; // No actualizar el estado si supera el límite
    }
    
    setFormData({ ...formData, telefono: nuevoValor });
    setPreviousTelefono(nuevoValor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obligatorios
    const errorCampos = validarCamposCliente(formData);
    if (errorCampos) {
      setAlertMessage(errorCampos);
      setShowAlert(true);
      return;
    }

    // Validar unicidad (tanto en creación como en edición)
    const errorUnicidad = validarUnicidadCliente(formData, clientes);
    if (errorUnicidad) {
      setAlertMessage(errorUnicidad);
      setShowAlert(true);
      return;
    }

    try {
      // 1. Obtener o crear ciudad
      const ciudadRes = await axiosInstance.post(
        "/api/ciudades/find-or-create",
        {
          nombreCiudad: formData.localidad,
          codigoPostal: formData.cp,
        }
      );
      console.log("Respuesta ciudad:", ciudadRes.data); // <-- Agrega esto
      const idCiudad = ciudadRes.data.idCiudad;

      // 2. Obtener o crear barrio
      const barrioRes = await axiosInstance.post(
        "/api/barrios/find-or-create",
        {
          nombreBarrio: formData.barrio,
          idCiudad,
        }
      );
      console.log("Respuesta barrio:", barrioRes.data); // <-- Agrega esto
      const idBarrio = barrioRes.data.idBarrio;

      // 3. Armar el payload
      const clientePayload = {
        ...formData,
        idCiudad,
        idBarrio,
      };

      // 4. Enviar al backend
      if (esEdicion) {
        await modificarCliente({
          ...clientePayload,
          id: formData.id!,
          tipoDocumento: formData.tipoDocumento ?? "",
          numeroDocumento: formData.numeroDocumento ?? "",
          nombre: formData.nombre ?? "",
          apellido: formData.apellido ?? "",
          domicilio: formData.domicilio ?? "",
          calle: formData.calle ?? "",
          altura: formData.altura ?? "",
          piso: formData.piso ?? "",
          numeroDepartamento: formData.numeroDepartamento ?? "",
          observaciones: formData.observaciones ?? "",
          localidad: formData.localidad ?? "",
          barrio: formData.barrio ?? "",
          cp: formData.cp ?? "",
          telefono: formData.telefono ?? "",
          email: formData.email ?? "",
        });
        setShowSuccess(true);
      } else {
        await agregarCliente(clientePayload as Omit<Cliente, "id">);
        // Limpiar formulario después de registro exitoso
        setFormData({
          tipoDocumento: "DNI",
          numeroDocumento: "",
          nombre: "",
          apellido: "",
          domicilio: "",
          calle: "",
          altura: "",
          piso: "",
          numeroDepartamento: "",
          observaciones: "",
          localidad: "",
          barrio: "",
          cp: "",
          telefono: "",
          email: "",
        });
        setPreviousNumeroDocumento("");
        setPreviousTelefono("");
        setShowSuccess(true);
      }
    } catch (error: any) {
      setAlertMessage(
        error?.response?.data?.error ||
          "Ocurrió un error al guardar el cliente."
      );
      setShowAlert(true);
    }
  };

  return (
    <IonPage className="alta-cliente-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>
            {esEdicion ? "Modificar Cliente" : "Nuevo Cliente"}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="alta-cliente-content">
        <form onSubmit={handleSubmit} className="alta-cliente-form">
          <div className="encb">
            <img src={zepelin} alt="Ícono Hardway" className="brand-logo" />
            <h1 className="form-title">
              {esEdicion ? "Modificar Cliente" : "Nuevo Cliente"}
            </h1>
          </div>
          {esEdicion && (
            <div className="id-cliente-display">
              <span>ID Cliente: {formData.id}</span>
            </div>
          )}
          {/* Sección: Datos Personales / Datos de la Empresa */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">{formData.tipoDocumento === 'CUIT' ? '🏢' : '👤'}</span>
              {formData.tipoDocumento === 'CUIT' ? 'Datos de la Empresa' : 'Datos Personales'}
            </h3>
            <div className="two-column-grid">
              <div className="form-column">
                <IonItem className="form-item">
                  <IonLabel position="floating">
                    Tipo Documento <span className="required">*</span>
                  </IonLabel>
                  <IonSelect
                    value={formData.tipoDocumento}
                    onIonChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoDocumento: e.detail.value,
                        apellido: e.detail.value === 'CUIT' ? '' : formData.apellido, // Limpiar apellido si es CUIT
                      })
                    }
                  >
                    <IonSelectOption value="DNI">DNI</IonSelectOption>
                    <IonSelectOption value="CUIL">CUIL</IonSelectOption>
                    <IonSelectOption value="CUIT">CUIT</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">
                    N° Documento <span className="required">*</span>
                  </IonLabel>
                  <IonInput
                    type="number"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    maxlength={formData.tipoDocumento === 'DNI' ? 8 : 11}
                    value={formData.numeroDocumento}
                    onIonChange={handleNumeroDocumentoChange}
                    onWheel={(e: any) => e.target.blur()}
                    placeholder={
                      esEdicion && !formData.numeroDocumento
                        ? "Dato obligatorio"
                        : formData.tipoDocumento === 'CUIT' 
                        ? "Ej: 30712345678"
                        : formData.tipoDocumento === 'CUIL'
                        ? "Ej: 20123456789"
                        : "Ej: 12345678"
                    }
                    className={
                      esEdicion && !formData.numeroDocumento
                        ? "input-obligatorio"
                        : ""
                    }
                  />
                </IonItem>
              </div>

              <div className="form-column">
                <IonItem className="form-item">
                  <IonLabel position="floating">
                    {formData.tipoDocumento === 'CUIT' ? 'Nombre de la Empresa' : 'Nombre'} <span className="required">*</span>
                  </IonLabel>
                  <IonInput
                    type="text"
                    value={formData.nombre}
                    onIonChange={(e) =>
                      setFormData({ ...formData, nombre: capitalizar(e.detail.value!) })
                    }
                    placeholder={
                      esEdicion && !formData.nombre 
                        ? "Dato obligatorio." 
                        : formData.tipoDocumento === 'CUIT'
                        ? "Ej: Distribuidora El Sol SA"
                        : ""
                    }
                    className={
                      esEdicion && !formData.nombre ? "input-obligatorio" : ""
                    }
                  />
                </IonItem>

                {formData.tipoDocumento !== 'CUIT' && (
                  <IonItem className="form-item">
                    <IonLabel position="floating">
                      Apellido <span className="required">*</span>
                    </IonLabel>
                    <IonInput
                      type="text"
                      value={formData.apellido}
                      onIonChange={(e) =>
                        setFormData({ ...formData, apellido: capitalizar(e.detail.value!) })
                      }
                      placeholder={
                        esEdicion && !formData.apellido ? "Dato obligatorio." : ""
                      }
                      className={
                        esEdicion && !formData.apellido ? "input-obligatorio" : ""
                      }
                    />
                  </IonItem>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Domicilio */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">🏠</span>
              Domicilio
            </h3>
            <div className="two-column-grid">
              <div className="form-column">
                <IonItem className="form-item">
                  <IonLabel position="floating">
                    Localidad
                    <span className="required">*</span>
                  </IonLabel>
                  <IonInput
                    value={formData.localidad}
                    onIonChange={(e) =>
                      setFormData({ ...formData, localidad: capitalizar(e.detail.value!) })
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">
                    Barrio <span className="required">*</span>
                  </IonLabel>
                  <IonInput
                    value={formData.barrio}
                    onIonChange={(e) =>
                      setFormData({ ...formData, barrio: capitalizar(e.detail.value!) })
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">Calle</IonLabel>
                  <IonInput
                    value={formData.calle}
                    onIonChange={(e) =>
                      setFormData({ ...formData, calle: capitalizar(e.detail.value!) })
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">
                    Domicilio (Alternativo)
                  </IonLabel>
                  <IonInput
                    value={formData.domicilio}
                    onIonChange={(e) =>
                      setFormData({ ...formData, domicilio: capitalizar(e.detail.value!) })
                    }
                  />
                </IonItem>
              </div>

              <div className="form-column">
                <IonItem className="form-item">
                  <IonLabel position="floating">Altura</IonLabel>
                  <IonInput
                    type="number"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    value={formData.altura}
                    onIonChange={(e) =>
                      setFormData({ ...formData, altura: e.detail.value! })
                    }
                    onWheel={(e: any) => e.target.blur()}
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">Piso</IonLabel>
                  <IonInput
                    value={formData.piso}
                    onIonChange={(e) =>
                      setFormData({ ...formData, piso: e.detail.value! })
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">N° Departamento</IonLabel>
                  <IonInput
                    value={formData.numeroDepartamento}
                    onIonChange={(e) =>
                      setFormData({
                        ...formData,
                        numeroDepartamento: e.detail.value!,
                      })
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">Código Postal</IonLabel>
                  <IonInput
                    type="text"
                    value={formData.cp}
                    onIonChange={(e) =>
                      setFormData({ ...formData, cp: e.detail.value! })
                    }
                    placeholder="Ej: C1000, X5000, 1234"
                  />
                </IonItem>
              </div>
            </div>
          </div>

          {/* Sección: Contacto */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📞</span>
              Información de Contacto
            </h3>
            <div className="two-column-grid">
              <div className="form-column">
                <IonItem className="form-item">
                  <IonLabel position="floating">
                    Teléfono <span className="required">*</span>
                  </IonLabel>
                  <IonInput
                    type="number"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    value={formData.telefono}
                    onIonChange={handleTelefonoChange}
                    onWheel={(e: any) => e.target.blur()}
                  />
                </IonItem>
              </div>

              <div className="form-column">
                <IonItem className="form-item">
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={formData.email}
                    onIonChange={(e) =>
                      setFormData({ ...formData, email: e.detail.value! })
                    }
                  />
                </IonItem>
              </div>
            </div>
          </div>

          {/* Sección: Observaciones */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📝</span>
              Observaciones Adicionales
            </h3>
            <IonItem className="form-item full-width">
              <IonLabel position="floating">Observaciones</IonLabel>
              <IonInput
                value={formData.observaciones}
                onIonChange={(e) =>
                  setFormData({
                    ...formData,
                    observaciones: e.detail.value!,
                  })
                }
              />
            </IonItem>
          </div>

          <div className="button-group">
            <IonButton
              expand="block"
              color="danger"
              onClick={() => history.push("/Clientes")}
              className="cancelar-btn"
            >
              Cancelar
            </IonButton>
            <IonButton expand="block" type="submit" className="guardar-btn">
              {esEdicion ? "Actualizar" : "Guardar"}
            </IonButton>
          </div>
        </form>
      </IonContent>

      <IonAlert
        isOpen={showAlert}
        message={alertMessage}
        buttons={[{ text: "Aceptar", handler: () => setShowAlert(false) }]}
      />
      <IonAlert
        isOpen={showSuccess}
        onDidDismiss={() => setShowSuccess(false)}
        message="Actualizacion de cliente exitoso"
        buttons={[
          {
            text: "Aceptar",
            handler: () => {
              setShowSuccess(false);
              history.push("/Clientes");
            },
          },
        ]}
      />
    </IonPage>
  );
};

export default AltaCliente;
