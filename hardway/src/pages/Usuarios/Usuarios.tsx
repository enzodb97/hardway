import React, { useEffect, useState, useMemo } from "react";
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
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import "./Usuarios.css";
import { useAuth } from "../../context/AuthContext";
import zepelin from "../../assets/images/zepelin.png";
import axiosInstance from "../../config/axios";

const Usuarios: React.FC = () => {
  const { roles, hasRole } = useAuth(); // ✅ Usar roles y hasRole
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nuevoUsuario, setNuevoUsuario] = useState<Omit<Usuario, "id">>({
    username: "",
    password: "",
    rol: "", // @deprecated - mantener por compatibilidad
    roles: [], // ✅ NUEVO: Array de nombres de roles
    rolesIds: [], // ✅ Array de IDs de roles seleccionados
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
  const [rolesDisponibles, setRolesDisponibles] = useState<{idTipoRol: number, tipoRol: string}[]>([]); // ✅ MODIFICADO
  const [mostrarListaUsuarios, setMostrarListaUsuarios] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const usersPerPage = 3;
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarPasswordModal, setMostrarPasswordModal] = useState(false);

  // Validar si el formulario de nuevo usuario es válido
  const esFormularioValido = useMemo(() => {
    const username = nuevoUsuario.username?.trim() || "";
    const password = nuevoUsuario.password?.trim() || "";
    const rolesIds = nuevoUsuario.rolesIds || [];

    // Validar nombre de usuario
    if (username.length < 3) return false;
    if (/\s/.test(username)) return false; // No espacios
    if (/\d/.test(username)) return false; // No números

    // Validar contraseña
    if (password.length < 8) return false;
    if (!/\d/.test(password)) return false; // Al menos 1 número
    if (!/[a-zA-Z]/.test(password)) return false; // Al menos 1 letra
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false; // Al menos 1 carácter especial

    // Validar que tenga al menos un rol
    if (rolesIds.length === 0) return false;

    return true;
  }, [nuevoUsuario]);

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
  // ✅ ACTUALIZADO: Verificar si tiene rol de Administrador
  if (!hasRole("Administrador") && roles.length > 0) {
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
            Tus roles actuales: {roles.join(", ")}
          </p>
          <p style={{ textAlign: "center" }}>
            Rol requerido: Administrador
          </p>
        </IonContent>
      </IonPage>
    );
  }

  // Si roles está vacío, mostrar cargando
  if (roles.length === 0) {
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
    if (!hasRole("Administrador")) {
      return;
    }
    
    cargarUsuarios().then((usuariosData) => {
      setUsuarios(usuariosData);
    }).catch((error) => {
      console.error("Usuarios.tsx: Error al cargar usuarios:", error);
      setAlertMsg("Error al cargar usuarios");
      setShowAlert(true);
    });
    
    // ✅ Cargar tipos de rol desde el backend
    axiosInstance.get("/api/usuarios/tipos-rol")
      .then((res: any) => {
        setRolesDisponibles(res.data); // Array de {idTipoRol, tipoRol, descripcionRol}
      })
      .catch((error) => {
        console.error("Usuarios.tsx: Error al cargar tipos de rol:", error);
        setAlertMsg("Error al cargar roles disponibles");
        setShowAlert(true);
      });
  }, [roles, hasRole]); // ✅ Actualizar dependencias

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
      setNuevoUsuario({ username: "", password: "", rol: "", roles: [], rolesIds: [] }); // ✅ Resetear también roles
      setMostrarPassword(false); // Resetear visibilidad de contraseña
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
                    type={mostrarPassword ? "text" : "password"}
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
                  <IonButton
                    slot="end"
                    fill="clear"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                  >
                    <IonIcon
                      slot="icon-only"
                      icon={mostrarPassword ? eyeOffOutline : eyeOutline}
                      color="medium"
                    />
                  </IonButton>
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
                  <IonLabel position="floating">Roles</IonLabel>
                  <IonSelect
                    value={nuevoUsuario.rolesIds || []}
                    multiple={true}
                    cancelText="Cancelar"
                    okText="Aceptar"
                    onIonChange={(e) => {
                      const selectedIds = e.detail.value as number[];
                      const selectedRoles = rolesDisponibles
                        .filter(rol => selectedIds.includes(rol.idTipoRol))
                        .map(rol => rol.tipoRol);
                      
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        rolesIds: selectedIds,
                        roles: selectedRoles,
                        rol: selectedRoles[0] || "" // mantener compatibilidad
                      });
                    }}
                    interface="alert"
                    placeholder="Seleccione uno o más roles"
                  >
                    {rolesDisponibles.map((rol) => (
                      <IonSelectOption key={rol.idTipoRol} value={rol.idTipoRol}>
                        {rol.tipoRol}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonButton
                  expand="block"
                  type="submit"
                  className="usuarios-btn"
                  strong={true}
                  disabled={!esFormularioValido}
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
                      <IonLabel position="floating">Roles</IonLabel>
                      <IonSelect
                        value={editando.rolesIds || []}
                        multiple={true}
                        cancelText="Cancelar"
                        okText="Aceptar"
                        onIonChange={(e) => {
                          const selectedIds = e.detail.value as number[];
                          const selectedRoles = rolesDisponibles
                            .filter(rol => selectedIds.includes(rol.idTipoRol))
                            .map(rol => rol.tipoRol);
                          
                          setEditando({
                            ...editando,
                            rolesIds: selectedIds,
                            roles: selectedRoles,
                            rol: selectedRoles[0] || "" // mantener compatibilidad
                          });
                        }}
                        interface="alert"
                        placeholder="Seleccione uno o más roles"
                      >
                        {rolesDisponibles.map((rol) => (
                          <IonSelectOption key={rol.idTipoRol} value={rol.idTipoRol}>
                            {rol.tipoRol}
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
                      <div>
                        {usuario.roles && usuario.roles.length > 0 ? (
                          usuario.roles.map((rol, index) => (
                            <IonChip key={index} color="primary" outline={true}>
                              <IonIcon icon={ribbonOutline} />
                              <IonLabel>{rol}</IonLabel>
                            </IonChip>
                          ))
                        ) : (
                          <IonChip color="medium" outline={true}>
                            <IonIcon icon={ribbonOutline} />
                            <IonLabel>{usuario.rol || "Sin rol"}</IonLabel>
                          </IonChip>
                        )}
                      </div>
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
                type: mostrarPasswordModal ? "text" : "password",
                placeholder: "Nueva contraseña",
                value: nuevaPassword,
                attributes: { minLength: 8 },
              },
            ]}
            buttons={[
              {
                text: mostrarPasswordModal ? "Ocultar" : "Mostrar",
                handler: () => {
                  setMostrarPasswordModal(!mostrarPasswordModal);
                  return false; // No cerrar el alert
                },
              },
              {
                text: "Cancelar",
                role: "cancel",
                handler: () => {
                  setShowPasswordAlert(false);
                  setNuevaPassword("");
                  setMostrarPasswordModal(false);
                },
              },
              {
                text: "Guardar",
                handler: (data) => {
                  handleGuardarPassword(data.password);
                  setMostrarPasswordModal(false);
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
