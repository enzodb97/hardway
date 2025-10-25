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
  IonIcon,
  IonItemDivider,
  IonText,
  IonChip,
} from "@ionic/react";
import {
  personAddOutline,
  peopleOutline,
  lockClosedOutline,
  keyOutline,
  personCircleOutline,
  ribbonOutline,
  checkmarkCircle,
  closeCircleOutline,
  pencilOutline,
  trashOutline,
  searchOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
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
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  const [usuarioPasswordId, setUsuarioPasswordId] = useState<number | null>(
    null
  );
  const [rolesDisponibles, setRolesDisponibles] = useState<string[]>([]);
  const [mostrarListaUsuarios, setMostrarListaUsuarios] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const usersPerPage = 3;

  // Filtrar usuarios por búsqueda
  const filteredUsers = usuarios.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular páginas totales
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Obtener usuarios de la página actual
  const getCurrentUsers = () => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  };

  // Cambiar de página
  const handlePageChange = (newPage: number, event?: React.MouseEvent) => {
    // Prevenir el comportamiento por defecto que causa el scroll
    event?.preventDefault();
    
    // Obtener la referencia del contenedor de la lista
    const listContainer = document.querySelector('.usuarios-list-container');
    const currentScroll = listContainer?.getBoundingClientRect().top;
    
    setCurrentPage(newPage);

    // Mantener la posición del scroll después de que se actualice el estado
    if (currentScroll) {
      setTimeout(() => {
        listContainer?.scrollIntoView({ behavior: 'auto' });
      }, 0);
    }
  };

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
  const handleEliminar = (id: number) => {
    setUserToDelete(id);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await eliminarUsuario(userToDelete);
        setUsuarios(usuarios.filter((u) => u.id !== userToDelete));
        setAlertMsg("Usuario eliminado correctamente");
        setShowAlert(true);
      } catch (error) {
        setAlertMsg("Error al eliminar el usuario");
        setShowAlert(true);
      }
      setShowDeleteAlert(false);
      setUserToDelete(null);
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
      setNuevaPassword("");
    } catch (error: any) {
      setAlertMsg(error.message || "Error al actualizar contraseña");
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
              <div className="encb">
                <img src={zepelin} alt="Ícono Hardway" className="brand-logo" />
                <h2 className="usuarios-section-title">
                  <IonIcon 
                    icon={personAddOutline} 
                    style={{ 
                      marginRight: '10px',
                      fontSize: '1.5rem',
                      verticalAlign: 'middle'
                    }}
                  />
                  Crear nuevo usuario
                </h2>
              </div>
              <form onSubmit={handleCrear} className="usuarios-form">
                <IonItem className="usuarios-form-item">
                  <IonIcon icon={personCircleOutline} slot="start" color="medium" />
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
                    clearInput
                  />
                </IonItem>
                <IonItem className="usuarios-form-item">
                  <IonIcon icon={lockClosedOutline} slot="start" color="medium" />
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
                    clearInput
                  />
                </IonItem>
                <div className="password-requirements">
                  <IonText color="medium">
                    <small>
                      <strong>Requisitos de seguridad:</strong> Mínimo 8 caracteres, 1 número, 1 letra y 1 carácter especial
                    </small>
                  </IonText>
                </div>
                <IonItem className="usuarios-form-item">
                  <IonIcon icon={ribbonOutline} slot="start" color="medium" />
                  <IonLabel position="floating">Rol</IonLabel>
                  <IonSelect
                    value={nuevoUsuario.rol}
                    onIonChange={(e) =>
                      setNuevoUsuario({ ...nuevoUsuario, rol: e.detail.value! })
                    }
                    required
                    interface="popover"
                    interfaceOptions={{
                      cssClass: 'roles-select-popover',
                      alignment: 'end',
                      side: 'end'
                    }}
                    style={{ textAlign: 'right', paddingRight: '16px' }}
                    placeholder="Seleccione un rol"
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
                  strong={true}
                >
                  <IonIcon icon={personAddOutline} slot="start" />
                  Crear Usuario
                </IonButton>
              </form>
            </div>
          )}
          <div className="usuarios-section usuarios-list-section">
            <div className="encb">
              <img src={zepelin} alt="Ícono Hardway" className="brand-logo" />
              <h2 className="usuarios-section-title">
                <IonIcon 
                  icon={peopleOutline} 
                  style={{ 
                    marginRight: '10px',
                    fontSize: '1.5rem',
                    verticalAlign: 'middle'
                  }}
                />
                Lista de usuarios
              </h2>
            </div>
            
            <IonButton
              expand="block"
              onClick={() => {
                setMostrarListaUsuarios(!mostrarListaUsuarios);
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className="ver-usuarios-btn"
              color={mostrarListaUsuarios ? "medium" : "primary"}
            >
              <IonIcon 
                slot="start" 
                icon={mostrarListaUsuarios ? closeCircleOutline : peopleOutline} 
              />
              {mostrarListaUsuarios ? "Ocultar Usuarios" : "Ver Usuarios"}
            </IonButton>

            {mostrarListaUsuarios && (
              <div className="usuarios-list-container">
                <div className="usuarios-search-container">
                  <IonItem className="usuarios-search-bar">
                    <IonIcon slot="start" icon={searchOutline} color="medium" />
                    <IonInput
                      placeholder="Buscar usuario..."
                      value={searchTerm}
                      onIonChange={e => {
                        setSearchTerm(e.detail.value || "");
                        setCurrentPage(1);
                      }}
                      clearInput
                    />
                  </IonItem>
                </div>

                <IonList className="usuarios-list usuarios-list-animate">
              {getCurrentUsers().map((usuario) =>
                editando && editando.id === usuario.id ? (
                  <form
                    key={usuario.id}
                    onSubmit={handleGuardarEdicion}
                    className="usuarios-edit-form"
                  >
                    <IonItem className="usuarios-form-item">
                      <IonIcon icon={personCircleOutline} slot="start" color="medium" />
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
                        clearInput
                      />
                    </IonItem>
                    <IonItem className="usuarios-form-item">
                      <IonIcon icon={ribbonOutline} slot="start" color="medium" />
                      <IonLabel position="floating">Rol</IonLabel>
                      <IonSelect
                        value={editando.rol}
                        onIonChange={(e) =>
                          setEditando({ ...editando, rol: e.detail.value! })
                        }
                        required
                        interface="popover"
                        interfaceOptions={{
                          cssClass: 'roles-select-popover'
                        }}
                      >
                        {rolesDisponibles.map((rol) => (
                          <IonSelectOption key={rol} value={rol}>
                            {rol}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <div className="usuarios-button-group">
                      <IonButton
                        type="submit"
                        color="success"
                        expand="block"
                        className="usuarios-btn"
                        strong={true}
                      >
                        <IonIcon slot="start" icon={checkmarkCircle} />
                        Guardar
                      </IonButton>
                      <IonButton
                        color="medium"
                        expand="block"
                        className="usuarios-btn"
                        onClick={() => setEditando(null)}
                        fill="outline"
                      >
                        <IonIcon slot="start" icon={closeCircleOutline} />
                        Cancelar
                      </IonButton>
                    </div>
                  </form>
                ) : (
                  <IonItem key={usuario.id} className="usuarios-list-item">
                    <IonIcon icon={personCircleOutline} slot="start" color="medium" />
                    <IonLabel>
                      <strong>{usuario.username}</strong>
                      <IonChip color="primary" outline={true}>
                        <IonIcon icon={ribbonOutline} />
                        <IonLabel>{usuario.rol}</IonLabel>
                      </IonChip>
                    </IonLabel>
                    <IonButton
                      fill="clear"
                      color="warning"
                      onClick={() => handleEditar(usuario)}
                    >
                      <IonIcon slot="icon-only" icon={pencilOutline} className="boton" />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      color="tertiary"
                      onClick={() => handleCambiarPassword(usuario.id)}
                    >
                      <IonIcon slot="icon-only" icon={keyOutline} className="boton" />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={() => handleEliminar(usuario.id)}
                    >
                      <IonIcon slot="icon-only" icon={trashOutline} className="boton" />
                    </IonButton>
                  </IonItem>
                )
              )}
            </IonList>

            {filteredUsers.length > 0 ? (
              <div className="pagination-controls">
                <IonButton
                  fill="clear"
                  disabled={currentPage === 1}
                  onClick={(e) => handlePageChange(currentPage - 1, e)}
                >
                  <IonIcon slot="icon-only" icon={chevronBackOutline} />
                </IonButton>
                
                <span className="page-info">
                  Página {currentPage} de {totalPages}
                </span>

                <IonButton
                  fill="clear"
                  disabled={currentPage === totalPages}
                  onClick={(e) => handlePageChange(currentPage + 1, e)}
                >
                  <IonIcon slot="icon-only" icon={chevronForwardOutline} />
                </IonButton>
              </div>
            ) : (
              <div className="no-results">
                <IonIcon icon={searchOutline} color="medium" />
                <p>No se encontraron usuarios</p>
              </div>
            )}
            </div>
            )}
          </div>
          {/* Alertas */}
          <IonAlert
            isOpen={showAlert}
            message={alertMsg}
            buttons={["OK"]}
            onDidDismiss={() => setShowAlert(false)}
          />
          
          {/* Alert de confirmación para eliminar usuario */}
          <IonAlert
            isOpen={showDeleteAlert}
            header="Confirmar eliminación"
            message="¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer."
            buttons={[
              {
                text: 'Cancelar',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                  setShowDeleteAlert(false);
                  setUserToDelete(null);
                }
              },
              {
                text: 'Eliminar',
                cssClass: 'danger',
                handler: () => confirmDelete()
              }
            ]}
            cssClass="delete-alert"
          />
          {/* Modal para cambiar contraseña */}
          <IonAlert
            isOpen={showPasswordAlert}
            header="Cambiar Contraseña"
            subHeader="Requisitos de seguridad:"
            message="            -Mínimo 8 caracteres 
            -Al menos 1 número 
            -Al menos 1 letra 
            -Al menos 1 carácter especial (!@#$%^&*)"
            inputs={[
              {
                name: "password",
                type: "password",
                placeholder: "Nueva contraseña",
                value: nuevaPassword,
                attributes: { minLength: 8 },
              },
            ]}
            buttons={[
              {
                text: "Cancelar",
                role: "cancel",
                handler: () => {
                  setShowPasswordAlert(false);
                  setNuevaPassword("");
                },
              },
              {
                text: "Guardar",
                handler: (data) => {
                  handleGuardarPassword(data.password);
                },
              },
            ]}
            cssClass="password-alert"
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Usuarios;
