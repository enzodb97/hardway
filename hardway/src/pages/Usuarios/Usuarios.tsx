import React, { useEffect, useState } from "react";
import {
  cargarUsuarios,
  crearUsuario,
  eliminarUsuario,
  editarUsuario,
  cambiarPassword,
  validarCamposUsuario,
  validarUnicidadUsuario,
  Usuario,
} from "../../utils/usuariosUtils";
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
  IonList,
  IonAlert,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonMenuButton,
} from "@ionic/react";
import "./Usuarios.css";
import { useAuth } from "../../context/AuthContext";
import zepelin from "../../assets/images/zepelin.png";
import axiosInstance from "../../config/axios";

const Usuarios: React.FC = () => {
  const { rol } = useAuth();
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nuevoUsuario, setNuevoUsuario] = useState<Omit<Usuario, "id">>({
    username: "",
    password: "",
    rol: "vendedor",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  const [usuarioPasswordId, setUsuarioPasswordId] = useState<number | null>(
    null
  );
  const [rolesDisponibles, setRolesDisponibles] = useState<string[]>([]);

  // TEMPORALMENTE COMENTAMOS LA VALIDACIÓN DE ROL PARA DEBUGGEAR
  // Solo admin puede ver esta página
  if (rol !== "Administrador" && rol !== null) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonMenuButton slot="start" />
            <IonTitle>Usuarios</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <h2 style={{ color: "red", textAlign: "center" }}>
            No tienes acceso a esta sección
          </h2>
          <p style={{ textAlign: "center" }}>
            Tu rol actual: {rol || "No definido"}
          </p>
          <p style={{ textAlign: "center" }}>
            Rol requerido: Administrador
          </p>
        </IonContent>
      </IonPage>
    );
  }

  // Si rol es null, mostrar cargando
  if (rol === null) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonMenuButton slot="start" />
            <IonTitle>Usuarios</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <p>Verificando permisos...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Cargar usuarios y roles al montar
  useEffect(() => {
    if (rol !== "Administrador") {
      return;
    }
    
    cargarUsuarios().then((usuariosData) => {
      setUsuarios(usuariosData);
    }).catch((error) => {
      console.error("Usuarios.tsx: Error al cargar usuarios:", error);
      setAlertMsg("Error al cargar usuarios");
      setShowAlert(true);
    });
    
    // Cargar roles desde el backend
    axiosInstance.get("/api/tiporoles")
      .then((res: any) => {
        const roles = res.data.map((r: any) => r.tipoRol);
        setRolesDisponibles(roles);
      })
      .catch((error) => {
        console.error("Usuarios.tsx: Error al cargar roles:", error);
        setAlertMsg("Error al cargar roles disponibles");
        setShowAlert(true);
      });
  }, [rol]); // Agregar rol como dependencia

  // Crear usuario
  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorCampos = validarCamposUsuario(nuevoUsuario);
    if (errorCampos) {
      setAlertMsg(errorCampos);
      setShowAlert(true);
      return;
    }
    const errorUnicidad = validarUnicidadUsuario(nuevoUsuario, usuarios);
    if (errorUnicidad) {
      setAlertMsg(errorUnicidad);
      setShowAlert(true);
      return;
    }
    try {
      await crearUsuario(nuevoUsuario);
      setAlertMsg("Usuario creado correctamente");
      setShowAlert(true);
      setNuevoUsuario({ username: "", password: "", rol: "vendedor" });
      cargarUsuarios().then(setUsuarios);
    } catch {
      setAlertMsg("Error al crear usuario");
      setShowAlert(true);
    }
  };

  // Eliminar usuario
  const handleEliminar = async (id: number) => {
    if (window.confirm("¿Eliminar este usuario?")) {
      await eliminarUsuario(id);
      setUsuarios(usuarios.filter((u) => u.id !== id));
    }
  };

  // Editar usuario
  const handleEditar = (usuario: Usuario) => {
    setEditando(usuario);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    const errorCampos = validarCamposUsuario(editando);
    if (errorCampos) {
      setAlertMsg(errorCampos);
      setShowAlert(true);
      return;
    }
    const errorUnicidad = validarUnicidadUsuario(editando, usuarios);
    if (errorUnicidad) {
      setAlertMsg(errorUnicidad);
      setShowAlert(true);
      return;
    }
    try {
      await editarUsuario(editando);
      setAlertMsg("Usuario actualizado correctamente");
      setShowAlert(true);
      setEditando(null);
      cargarUsuarios().then(setUsuarios);
    } catch {
      setAlertMsg("Error al actualizar usuario");
      setShowAlert(true);
    }
  };

  // Cambiar contraseña
  const handleCambiarPassword = (id: number) => {
    setUsuarioPasswordId(id);
    setNuevaPassword("");
    setShowPasswordAlert(true);
  };

  const handleGuardarPassword = async (password: string) => {
    if (!usuarioPasswordId || !password) return;
    try {
      await cambiarPassword(usuarioPasswordId, password);
      setAlertMsg("Contraseña actualizada correctamente");
      setShowAlert(true);
      setShowPasswordAlert(false);
    } catch {
      setAlertMsg("Error al actualizar contraseña");
      setShowAlert(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Gestión de Usuarios</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding usuarios-content">
        <div className="usuarios-columna">
          {!editando && (
            <div className="usuarios-section usuarios-form-section">
              {/* Formulario de creación */}
              <div className="encb">
                <img src={zepelin} alt="Ícono Hardway" className="brand-logo" />
                <h2 className="usuarios-section-title">Crear nuevo usuario</h2>
              </div>
              <form onSubmit={handleCrear} className="usuarios-form">
                <IonItem className="usuarios-form-item">
                  <IonLabel position="floating">Usuario</IonLabel>
                  <IonInput
                    value={nuevoUsuario.username}
                    onIonChange={(e) =>
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        username: e.detail.value!,
                      })
                    }
                    required
                  />
                </IonItem>
                <IonItem className="usuarios-form-item">
                  <IonLabel position="floating">Contraseña</IonLabel>
                  <IonInput
                    type="password"
                    value={nuevoUsuario.password}
                    onIonChange={(e) =>
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        password: e.detail.value!,
                      })
                    }
                    required
                  />
                </IonItem>
                <IonItem className="usuarios-form-item">
                  <IonLabel position="floating">Rol</IonLabel>
                  <IonSelect
                    value={nuevoUsuario.rol}
                    onIonChange={(e) =>
                      setNuevoUsuario({ ...nuevoUsuario, rol: e.detail.value! })
                    }
                    required
                  >
                    {rolesDisponibles.map((rol) => (
                      <IonSelectOption key={rol} value={rol}>
                        {rol}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonButton
                  expand="block"
                  type="submit"
                  className="usuarios-btn"
                >
                  Crear Usuario
                </IonButton>
              </form>
            </div>
          )}
          <div className="usuarios-section usuarios-list-section">
            {/* Lista de usuarios */}
            <div className="encb">
              <img src={zepelin} alt="Ícono Hardway" className="brand-logo" />
              <h2 className="usuarios-section-title">Lista de usuarios</h2>
            </div>
            <IonList className="usuarios-list">
              {usuarios.map((usuario) =>
                editando && editando.id === usuario.id ? (
                  <form
                    key={usuario.id}
                    onSubmit={handleGuardarEdicion}
                    className="usuarios-edit-form"
                  >
                    <IonItem className="usuarios-form-item">
                      <IonLabel position="floating">Usuario</IonLabel>
                      <IonInput
                        value={editando.username}
                        onIonChange={(e) =>
                          setEditando({
                            ...editando,
                            username: e.detail.value!,
                          })
                        }
                        required
                      />
                    </IonItem>
                    <IonItem className="usuarios-form-item">
                      <IonLabel position="floating">Rol</IonLabel>
                      <IonSelect
                        value={editando.rol}
                        onIonChange={(e) =>
                          setEditando({ ...editando, rol: e.detail.value! })
                        }
                        required
                      >
                        {rolesDisponibles.map((rol) => (
                          <IonSelectOption key={rol} value={rol}>
                            {rol}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonButton
                      type="submit"
                      color="success"
                      expand="block"
                      className="usuarios-btn"
                    >
                      Guardar
                    </IonButton>
                    <IonButton
                      color="medium"
                      expand="block"
                      className="usuarios-btn"
                      onClick={() => setEditando(null)}
                    >
                      Cancelar
                    </IonButton>
                  </form>
                ) : (
                  <IonItem key={usuario.id} className="usuarios-list-item">
                    <IonLabel>
                      <strong>{usuario.username}</strong> - {usuario.rol}
                    </IonLabel>
                    <IonButton
                      color="warning"
                      slot="end"
                      className="usuarios-btn"
                      onClick={() => handleEditar(usuario)}
                    >
                      Editar
                    </IonButton>
                    <IonButton
                      color="tertiary"
                      slot="end"
                      className="usuarios-btn"
                      onClick={() => handleCambiarPassword(usuario.id)}
                    >
                      Cambiar Contraseña
                    </IonButton>
                    <IonButton
                      color="danger"
                      slot="end"
                      className="usuarios-btn"
                      onClick={() => handleEliminar(usuario.id)}
                    >
                      Eliminar
                    </IonButton>
                  </IonItem>
                )
              )}
            </IonList>
          </div>
          {/* Alertas */}
          <IonAlert
            isOpen={showAlert}
            message={alertMsg}
            buttons={["OK"]}
            onDidDismiss={() => setShowAlert(false)}
          />
          {/* Modal para cambiar contraseña */}
          <IonAlert
            isOpen={showPasswordAlert}
            header="Cambiar Contraseña"
            inputs={[
              {
                name: "password",
                type: "password",
                placeholder: "Nueva contraseña",
                value: nuevaPassword,
                attributes: { minLength: 4 },
              },
            ]}
            buttons={[
              {
                text: "Cancelar",
                role: "cancel",
                handler: () => setShowPasswordAlert(false),
              },
              {
                text: "Guardar",
                handler: (data) => {
                  handleGuardarPassword(data.password);
                },
              },
            ]}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Usuarios;
