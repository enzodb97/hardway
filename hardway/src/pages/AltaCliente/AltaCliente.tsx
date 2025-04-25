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
} from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { useClientes } from "../../context/ClientesContext";
import { Cliente } from "../../context/ClientesContext";
import "./AltaCliente.css";
import zepelin from "../../assets/images/zepelin.png";
import { useEffect, useState } from "react";

const AltaCliente: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { clientes, agregarCliente, editarCliente } = useClientes();
  const history = useHistory();
  const [esEdicion, setEsEdicion] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    tipoDocumento: "DNI",
    numeroDocumento: "",
    nombre: "",
    domicilio: "",
    localidad: "",
    cp: "",
    telefono: "",
    email: "",
  });

  useEffect(() => {
    if (id) {
      const clienteExistente = clientes.find((c) => c.id === Number(id));
      if (clienteExistente) {
        setFormData(clienteExistente);
        setEsEdicion(true);
      }
    }
  }, [id, clientes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (esEdicion) {
      editarCliente(formData as Cliente);
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
          <IonTitle>{esEdicion ? "Editar Cliente" : "Nuevo Cliente"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="alta-cliente-content">
        <form onSubmit={handleSubmit} className="alta-cliente-form">
          <div className="encb">
            <img src={zepelin} alt="Ícono Hardway" className="brand-logo" />
            <h1 className="form-title">
              {esEdicion ? "Editar Cliente" : "Nuevo Cliente"}
            </h1>
          </div>
          <div className="two-column-grid">
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

                <IonItem className="form-item">
                  <IonLabel position="floating">N° Documento </IonLabel>
                  <IonInput
                    required
                    value={formData.numeroDocumento}
                    onIonChange={(e) =>
                      setFormData({
                        ...formData,
                        numeroDocumento: e.detail.value!,
                      })
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">Nombre y Apellido </IonLabel>
                  <IonInput
                    required
                    value={formData.nombre}
                    onIonChange={(e) =>
                      setFormData({ ...formData, nombre: e.detail.value! })
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">Domicilio </IonLabel>
                  <IonInput
                    required
                    value={formData.domicilio}
                    onIonChange={(e) =>
                      setFormData({ ...formData, domicilio: e.detail.value! })
                    }
                  />
                </IonItem>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="form-column">
              <div className="form-section">
                <IonItem className="form-item">
                  <IonLabel position="floating">Localidad </IonLabel>
                  <IonInput
                    required
                    value={formData.localidad}
                    onIonChange={(e) =>
                      setFormData({ ...formData, localidad: e.detail.value! })
                    }
                  />
                </IonItem>

                <IonItem className="form-item">
                  <IonLabel position="floating">CP </IonLabel>
                  <IonInput
                    required
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
                    type="tel"
                    value={formData.telefono}
                    onIonChange={(e) =>
                      setFormData({ ...formData, telefono: e.detail.value! })
                    }
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
    </IonPage>
  );
};

export default AltaCliente;
