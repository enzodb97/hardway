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

const AltaCliente: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { clientes, agregarCliente, modificarCliente } = useClientes();
  const history = useHistory();
  const [esEdicion, setEsEdicion] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    tipoDocumento: "DNI",
    numeroDocumento: "",
    nombre: "",
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
    const nuevoValor = soloNumeros(value, previousNumeroDocumento);
    setFormData({ ...formData, numeroDocumento: nuevoValor });
    setPreviousNumeroDocumento(nuevoValor);
  };

  const handleTelefonoChange = (e: any) => {
    const value = e.detail.value;
    const nuevoValor = soloNumeros(value, previousTelefono);
    setFormData({ ...formData, telefono: nuevoValor });
    setPreviousTelefono(nuevoValor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorCampos = validarCamposCliente(formData);
    if (errorCampos) {
      setAlertMessage(errorCampos);
      setShowAlert(true);
      return;
    }

    const errorUnicidad = validarUnicidadCliente(formData, clientes);
    if (errorUnicidad) {
      setAlertMessage(errorUnicidad);
      setShowAlert(true);
      return;
    }

    try {
      // 1. Obtener o crear ciudad
      const ciudadRes = await axiosInstance.post("/api/ciudades/find-or-create", {
        nombreCiudad: formData.localidad,
        codigoPostal: formData.cp,
      });
      console.log("Respuesta ciudad:", ciudadRes.data); // <-- Agrega esto
      const idCiudad = ciudadRes.data.idCiudad;

      // 2. Obtener o crear barrio
      const barrioRes = await axiosInstance.post("/api/barrios/find-or-create", {
        nombreBarrio: formData.barrio,
        idCiudad,
      });
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
        setShowSuccess(true); // NUEVO
      } else {
        await agregarCliente(clientePayload as Omit<Cliente, "id">);
        setShowSuccess(true); // NUEVO
      }
      // history.push("/Clientes"); // QUITA ESTA LÍNEA
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
          <div className="two-column-grid">
            {/* Columna Izquierda */}
            <div className="form-column">
              <div className="form-section">
                {/* Solo muestra ID en modo edición */}

                <IonItem className="form-item">
                  <IonLabel position="floating">Tipo Documento </IonLabel>
                  <IonSelect
                    value={formData.tipoDocumento}
                    onIonChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoDocumento: e.detail.value,
                      })
                    }
                  >
                    <IonSelectOption value="DNI">DNI</IonSelectOption>
                    <IonSelectOption value="CUIL">CUIL</IonSelectOption>
                    <IonSelectOption value="CUIT">CUIT</IonSelectOption>
                  </IonSelect>
                </IonItem>

                {/* N° Documento */}
                <IonItem className="form-item">
                  <IonLabel position="floating">N° Documento</IonLabel>
                  <IonInput
                    required
                    type="number"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    value={formData.numeroDocumento}
                    onIonChange={handleNumeroDocumentoChange}
                    placeholder={
                      esEdicion && !formData.numeroDocumento
                        ? "Dato obligatorio"
                        : ""
                    }
                    className={
                      esEdicion && !formData.numeroDocumento
                        ? "input-obligatorio"
                        : ""
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">Nombre y Apellido</IonLabel>
                  <IonInput
                    type="text"
                    required
                    value={formData.nombre}
                    onIonChange={(e) =>
                      setFormData({ ...formData, nombre: e.detail.value! })
                    }
                    placeholder={
                      esEdicion && !formData.nombre ? "Dato obligatorio." : ""
                    }
                    className={
                      esEdicion && !formData.nombre ? "input-obligatorio" : ""
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">Localidad </IonLabel>
                  <IonInput
                    value={formData.localidad}
                    onIonChange={(e) =>
                      setFormData({ ...formData, localidad: e.detail.value! })
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">Barrio</IonLabel>
                  <IonInput
                    required
                    value={formData.barrio}
                    onIonChange={(e) =>
                      setFormData({ ...formData, barrio: e.detail.value! })
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">Calle</IonLabel>
                  <IonInput
                    value={formData.calle}
                    onIonChange={(e) =>
                      setFormData({ ...formData, calle: e.detail.value! })
                    }
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
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="form-column">
              <div className="form-section">
                <IonItem className="form-item">
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

                <IonItem className="form-item">
                  <IonLabel position="floating">Domicilio</IonLabel>
                  <IonInput
                    value={formData.domicilio}
                    onIonChange={(e) =>
                      setFormData({ ...formData, domicilio: e.detail.value! })
                    }
                  />
                </IonItem>

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
                  <IonLabel position="floating">CP </IonLabel>
                  <IonInput
                    type="number"
                    value={formData.cp}
                    onIonChange={(e) =>
                      setFormData({ ...formData, cp: e.detail.value! })
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">Teléfono </IonLabel>
                  <IonInput
                    required
                    type="number"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    value={formData.telefono}
                    onIonChange={handleTelefonoChange}
                  />
                </IonItem>

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

          <IonButton expand="block" type="submit" className="guardar-btn">
            {esEdicion ? "Actualizar" : "Guardar"}
          </IonButton>
        </form>
      </IonContent>

      <IonAlert
        isOpen={showAlert}
        message={alertMessage}
        buttons={[{ text: "Aceptar", handler: () => setShowAlert(false) }]}
      />
      <IonAlert
        isOpen={showSuccess}
        message="Actualizacion de cliente exitoso"
        buttons={[
          {
            text: "Aceptar",
            handler: () => history.push("/Clientes"),
          },
        ]}
      />
    </IonPage>
  );
};

export default AltaCliente;
