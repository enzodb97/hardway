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

  useEffect(() => {
    if (id) {
      const clienteExistente = clientes.find((c) => c.id === Number(id));
      if (clienteExistente) {
        setFormData(clienteExistente);
        setEsEdicion(true);
        setPreviousNumeroDocumento(clienteExistente.numeroDocumento || "");
        setPreviousTelefono(clienteExistente.telefono || "");
      }
    }
  }, [id, clientes]);

  const validarUnicidad = (cliente: Partial<Cliente>): string | null => {
    const { numeroDocumento, email, telefono } = cliente;
    const clienteExistenteDNI = clientes.find(
      (c) => c.numeroDocumento === numeroDocumento && c.id !== formData.id // Excluir el cliente actual en modo edición
    );
    if (clienteExistenteDNI) {
      return `Ya existe un cliente con el N° de Documento: ${numeroDocumento}`;
    }

    const clienteExistenteEmail = clientes.find(
      (c) => c.email === email && c.id !== formData.id
    );
    if (clienteExistenteEmail) {
      return `Ya existe un cliente con el Email: ${email}`;
    }

    const clienteExistenteTelefono = clientes.find(
      (c) => c.telefono === telefono && c.id !== formData.id
    );
    if (clienteExistenteTelefono) {
      return `Ya existe un cliente con el Teléfono: ${telefono}`;
    }

    return null;
  };

  const handleNumeroDocumentoChange = (e: any) => {
    const value = e.detail.value;
    if (/^\d*$/.test(value)) {
      setFormData({ ...formData, numeroDocumento: value });
      setPreviousNumeroDocumento(value);
    } else {
      setFormData({ ...formData, numeroDocumento: previousNumeroDocumento });
    }
  };

  const handleTelefonoChange = (e: any) => {
    const value = e.detail.value;
    if (/^\d*$/.test(value)) {
      setFormData({ ...formData, telefono: value });
      setPreviousTelefono(value);
    } else {
      setFormData({ ...formData, telefono: previousTelefono });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.numeroDocumento &&
      formData.numeroDocumento.trim().length < 3
    ) {
      setAlertMessage("El N° de Documento debe tener al menos 3 caracteres.");
      setShowAlert(true);
      return;
    }

    if (formData.nombre && formData.nombre.trim().length < 3) {
      setAlertMessage(
        "El nombre y apellido deben tener al menos 3 caracteres."
      );
      setShowAlert(true);
      return;
    }

    if (!formData.barrio || formData.barrio.trim().length < 2) {
      setAlertMessage("El campo Barrio es obligatorio.");
      setShowAlert(true);
      return;
    }

    const errorUnicidad = validarUnicidad(formData);
    if (errorUnicidad) {
      setAlertMessage(errorUnicidad);
      setShowAlert(true);
      return;
    }

    if (esEdicion) {
      modificarCliente(formData as Cliente);
    } else {
      agregarCliente(formData as Omit<Cliente, "id">);
    }
    history.push("/Clientes");
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
          <div className="two-column-grid">
            {/* Columna Izquierda */}
            <div className="form-column">
              <div className="form-section">
                {/* Solo muestra ID en modo edición */}
                {esEdicion && (
                  <div className="id-display">
                    <strong>ID Cliente:</strong> {formData.id}
                  </div>
                )}

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
                  <IonLabel position="floating">N° Documento </IonLabel>
                  <IonInput
                    required
                    type="number"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    value={formData.numeroDocumento}
                    onIonChange={handleNumeroDocumentoChange}
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">Nombre y Apellido </IonLabel>
                  <IonInput
                    type="text"
                    required
                    value={formData.nombre}
                    onIonChange={(e) =>
                      setFormData({ ...formData, nombre: e.detail.value! })
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

                {/* Altura */}
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

                {/* Teléfono */}
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
    </IonPage>
  );
};

export default AltaCliente;
