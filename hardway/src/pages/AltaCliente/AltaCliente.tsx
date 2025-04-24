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
} from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { useClientes } from "../../context/ClientesContext";
import { Cliente } from "../../context/ClientesContext"; // Importación añadida
import "./AltaCliente.css";
import { useEffect, useState } from "react";

const AltaCliente: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { clientes, agregarCliente, editarCliente } = useClientes();
  const history = useHistory();
  const [esEdicion, setEsEdicion] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nombre: "",
    email: "",
    celular: "",
    numeroCliente: "",
    localidad: "",
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
          <IonItem>
            <IonLabel position="floating">Nombre completo</IonLabel>
            <IonInput
              required
              value={formData.nombre}
              onIonChange={(e) =>
                setFormData({ ...formData, nombre: e.detail.value! })
              }
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              type="email"
              required
              value={formData.email}
              onIonChange={(e) =>
                setFormData({ ...formData, email: e.detail.value! })
              }
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Celular</IonLabel>
            <IonInput
              type="tel"
              required
              value={formData.celular}
              onIonChange={(e) =>
                setFormData({ ...formData, celular: e.detail.value! })
              }
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">N° Cliente</IonLabel>
            <IonInput
              type="number"
              required
              value={formData.numeroCliente}
              onIonChange={(e) =>
                setFormData({ ...formData, numeroCliente: e.detail.value! })
              }
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Localidad</IonLabel>
            <IonInput
              required
              value={formData.localidad}
              onIonChange={(e) =>
                setFormData({ ...formData, localidad: e.detail.value! })
              }
            />
          </IonItem>

          <IonButton expand="block" type="submit" className="guardar-btn">
            {esEdicion ? "Actualizar" : "Guardar"}
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default AltaCliente;
