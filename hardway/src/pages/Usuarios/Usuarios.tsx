import React, { useEffect, useState, useMemo } from "react";
import { formatFechaSola } from "../../utils/dateFormatters";
import {
  cargarUsuarios,
  crearUsuario,
  eliminarUsuario,
  editarUsuario,
  cambiarPassword,
  validarCamposUsuario,
  validarUnicidadUsuario,
  Usuario,
  obtenerPedidosActivos,
  obtenerRolesUsuario,
  obtenerUsuariosPorRoles,
  inactivarUsuarioDirecto,
  reasignarYInactivar,
  reactivarUsuario,
  obtenerMotivosInactivacion,
  PedidoActivo,
  UsuarioPorRol,
  MotivoInactivacion,
} from "../../utils/usuariosUtils";
import { 
  obtenerSolicitudesPendientes, 
  aprobarSolicitud, 
  rechazarSolicitud 
} from "../../services/recuperacionPasswordService";
import { obtenerClaseDeEstado } from "../../utils/pedidosUtils";
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
  IonToggle,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonTextarea,
  useIonViewWillEnter,
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
  close,
  pencilOutline,
  trashOutline,
  searchOutline,
  chevronBackOutline,
  chevronForwardOutline,
  eyeOutline,
  eyeOffOutline,
  toggleOutline,
  powerOutline,
  refreshOutline,
  swapHorizontalOutline,
  personRemoveOutline,
  alertCircleOutline,
  time,
} from 'ionicons/icons';
import "./Usuarios.css";
import { useAuth } from "../../context/AuthContext";
import zepelin from "../../assets/images/zepelin.png";
import axiosInstance from "../../config/axios";
import HistorialUsuario from "./HistorialUsuario";

// ✅ Función helper para formatear fecha a 12hs am/pm
const formatearFecha12h = (fecha: string | Date): string => {
  const date = new Date(fecha);
  const dia = date.getDate().toString().padStart(2, '0');
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const anio = date.getFullYear();
  
  let horas = date.getHours();
  const minutos = date.getMinutes().toString().padStart(2, '0');
  const segundos = date.getSeconds().toString().padStart(2, '0');
  const periodo = horas >= 12 ? 'PM' : 'AM';
  
  horas = horas % 12;
  horas = horas ? horas : 12; // 0 debe ser 12
  const horasStr = horas.toString().padStart(2, '0');
  
  return `${dia}/${mes}/${anio}, ${horasStr}:${minutos}:${segundos} ${periodo}`;
};

const Usuarios: React.FC = () => {
  const { roles, hasRole, userId } = useAuth(); // ✅ Usar roles, hasRole y userId
  
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
  const [mostrarInactivos, setMostrarInactivos] = useState(false); // ✅ NUEVO
  const [showInactivarModal, setShowInactivarModal] = useState(false); // ✅ NUEVO
  const [usuarioAInactivar, setUsuarioAInactivar] = useState<Usuario | null>(null); // ✅ NUEVO
  const [pedidosActivos, setPedidosActivos] = useState<PedidoActivo[]>([]); // ✅ NUEVO
  const [usuariosParaReasignar, setUsuariosParaReasignar] = useState<UsuarioPorRol[]>([]); // ✅ NUEVO
  const [usuarioDestinoId, setUsuarioDestinoId] = useState<number | null>(null); // ✅ NUEVO
  const [motivosInactivacion, setMotivosInactivacion] = useState<MotivoInactivacion[]>([]); // ✅ NUEVO
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<number | null>(null); // ✅ NUEVO
  const [observacionInactivacion, setObservacionInactivacion] = useState<string>(''); // ✅ NUEVO
  
  // ✅ NUEVO: Estados para historial de usuario
  const [showHistorial, setShowHistorial] = useState(false);
  const [usuarioHistorial, setUsuarioHistorial] = useState<{
    id: number;
    username: string;
  } | null>(null);

  // ✅ NUEVO: Estados para recuperación de contraseña
  const [solicitudesRecuperacion, setSolicitudesRecuperacion] = useState<any[]>([]);
  const [showCodigoModal, setShowCodigoModal] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState<string>("");
  const [nombreUsuarioCodigo, setNombreUsuarioCodigo] = useState<string>("");
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [showAprobarAlert, setShowAprobarAlert] = useState(false);
  const [solicitudAprobar, setSolicitudAprobar] = useState<number | null>(null);
  const [mostrarSolicitudes, setMostrarSolicitudes] = useState(false);
  const [mostrarFinalizadas, setMostrarFinalizadas] = useState(false);
  const [mostrarRechazadas, setMostrarRechazadas] = useState(false);

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

  // Cargar tipos de rol al montar (solo una vez)
  useEffect(() => {
    if (!hasRole("Administrador")) {
      return;
    }
    
    // Cargar tipos de rol desde el backend
    axiosInstance.get("/api/usuarios/tipos-rol")
      .then((res: any) => {
        setRolesDisponibles(res.data);
      })
      .catch((error) => {
        console.error("Usuarios.tsx: Error al cargar tipos de rol:", error);
        setAlertMsg("Error al cargar roles disponibles");
        setShowAlert(true);
      });

    // Cargar motivos de inactivación
    obtenerMotivosInactivacion()
      .then((motivos) => {
        setMotivosInactivacion(motivos);
      })
      .catch((error) => {
        console.error("Usuarios.tsx: Error al cargar motivos:", error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar, hasRole es estable
  
  // Cargar usuarios cuando cambia el filtro de inactivos
  useEffect(() => {
    if (!hasRole("Administrador")) {
      return;
    }
    
    cargarUsuarios(mostrarInactivos).then((usuariosData) => {
      setUsuarios(usuariosData);
    }).catch((error) => {
      console.error("Usuarios.tsx: Error al cargar usuarios:", error);
      setAlertMsg("Error al cargar usuarios");
      setShowAlert(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarInactivos]); // Solo cuando cambia mostrarInactivos, hasRole es estable

  // Recargar usuarios cada vez que la vista entra (para sincronización automática)
  useIonViewWillEnter(() => {
    if (!hasRole("Administrador")) {
      return;
    }
    
    cargarUsuarios(mostrarInactivos).then((usuariosData) => {
      setUsuarios(usuariosData);
    }).catch((error) => {
      console.error("Usuarios.tsx: Error al cargar usuarios:", error);
    });

    // Cargar solicitudes de recuperación pendientes
    cargarSolicitudesRecuperacion();
  });

  // Recargar solicitudes cuando cambien los toggles de filtrado
  useEffect(() => {
    if (hasRole("Administrador")) {
      cargarSolicitudesRecuperacion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarFinalizadas, mostrarRechazadas]);

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
      cargarUsuarios(mostrarInactivos).then(setUsuarios);
    } catch {
      setAlertMsg("Error al crear usuario");
      setShowAlert(true);
    }
  };

  // ✅ NUEVO: Inactivar/Reactivar usuario
  const handleInactivarReactivar = async (usuario: Usuario) => {
    // ✅ VALIDAR: No puede inactivarse a sí mismo
    if (userId && usuario.id === userId) {
      setAlertMsg("No puede inactivarse a sí mismo. Solicite a otro administrador que realice esta acción.");
      setShowAlert(true);
      return;
    }

    // Si está inactivo, reactivar directamente
    if (usuario.estaActivo === false) {
      try {
        await reactivarUsuario(usuario.id);
        setAlertMsg(`Usuario ${usuario.username} reactivado correctamente`);
        setShowAlert(true);
        cargarUsuarios(mostrarInactivos).then(setUsuarios);
      } catch (error: any) {
        setAlertMsg(error.response?.data?.error || "Error al reactivar usuario");
        setShowAlert(true);
      }
      return;
    }

    // Si está activo, verificar pedidos
    try {
      const resultado = await obtenerPedidosActivos(usuario.id);
      console.log('Resultado de obtenerPedidosActivos:', resultado);
      
      const { count, pedidos } = resultado;
      
      // Validar que pedidos sea un array
      if (!Array.isArray(pedidos)) {
        console.error('pedidos no es un array:', pedidos);
        setAlertMsg("Error: formato de datos inválido");
        setShowAlert(true);
        return;
      }
      
      console.log(`Usuario ${usuario.username} tiene ${count} pedidos activos`);
      
      // ✅ SIEMPRE abrir modal para solicitar motivo, con o sin pedidos
      setPedidosActivos(pedidos);
      setUsuarioAInactivar(usuario);
      
      if (count > 0 && pedidos.length > 0) {
        // Tiene pedidos activos, obtener usuarios para reasignación
        try {
          console.log('Obteniendo roles del usuario...');
          const rolesResult = await obtenerRolesUsuario(usuario.id);
          console.log('Roles obtenidos:', rolesResult);
          
          const { rolesIds } = rolesResult;
          console.log('Buscando usuarios compatibles con roles:', rolesIds);
          
          const usuariosCompatibles = await obtenerUsuariosPorRoles(rolesIds, usuario.id);
          console.log('Usuarios compatibles encontrados:', usuariosCompatibles);
          
          setUsuariosParaReasignar(usuariosCompatibles);
        } catch (errorRoles: any) {
          console.error('Error al obtener usuarios para reasignación:', errorRoles);
          setAlertMsg(errorRoles.response?.data?.error || "Error al obtener usuarios para reasignación");
          setShowAlert(true);
          return;
        }
      } else {
        // No tiene pedidos, pero igual necesita motivo
        setUsuariosParaReasignar([]);
      }
      
      // Abrir modal con motivo obligatorio
      setShowInactivarModal(true);

    } catch (error: any) {
      console.error('Error en handleInactivarReactivar:', error);
      setAlertMsg(error.response?.data?.error || "Error al verificar pedidos");
      setShowAlert(true);
    }
  };

  // ✅ NUEVO: Confirmar reasignación e inactivación
  const handleConfirmarReasignacion = async () => {
    if (!usuarioAInactivar || !usuarioDestinoId) {
      setAlertMsg("Debe seleccionar un usuario para reasignar los pedidos");
      setShowAlert(true);
      return;
    }

    if (!motivoSeleccionado) {
      setAlertMsg("Debe seleccionar un motivo de inactivación");
      setShowAlert(true);
      return;
    }

    try {
      const response = await reasignarYInactivar(
        usuarioAInactivar.id,
        usuarioDestinoId,
        motivoSeleccionado,
        observacionInactivacion || undefined
      );
      setAlertMsg(
        `${response.data.pedidosReasignados} pedidos reasignados de ${response.data.usuarioOrigen} a ${response.data.usuarioDestino}. Usuario inactivado correctamente.`
      );
      setShowAlert(true);
      setShowInactivarModal(false);
      setUsuarioAInactivar(null);
      setUsuarioDestinoId(null);
      setPedidosActivos([]);
      setUsuariosParaReasignar([]);
      setMotivoSeleccionado(null);
      setObservacionInactivacion('');
      cargarUsuarios(mostrarInactivos).then(setUsuarios);
    } catch (error: any) {
      setAlertMsg(error.response?.data?.error || "Error al reasignar pedidos e inactivar usuario");
      setShowAlert(true);
    }
  };

  // ✅ NUEVO: Mostrar historial de usuario
  const mostrarHistorial = (usuario: Usuario) => {
    setUsuarioHistorial({
      id: usuario.id,
      username: usuario.username,
    });
    setShowHistorial(true);
  };

  const cerrarHistorial = () => {
    setShowHistorial(false);
    setUsuarioHistorial(null);
  };

  // Eliminar usuario - OBSOLETO
  const handleEliminar = (id: number) => {
    setAlertMsg("La eliminación directa de usuarios no está permitida. Use inactivar en su lugar.");
    setShowAlert(true);
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
      cargarUsuarios(mostrarInactivos).then(setUsuarios);
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

  // ✅ NUEVO: Funciones para recuperación de contraseña
  const cargarSolicitudesRecuperacion = async () => {
    setLoadingSolicitudes(true);
    try {
      const solicitudes = await obtenerSolicitudesPendientes(
        mostrarFinalizadas,
        mostrarRechazadas
      );
      setSolicitudesRecuperacion(solicitudes);
    } catch (error) {
      console.error('Error al cargar solicitudes de recuperación:', error);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  const handleAprobarSolicitud = (idSolicitud: number) => {
    setSolicitudAprobar(idSolicitud);
    setShowAprobarAlert(true);
  };

  const confirmAprobarSolicitud = async () => {
    if (!solicitudAprobar) return;
    
    try {
      const resultado = await aprobarSolicitud(solicitudAprobar);
      setCodigoGenerado(resultado.codigo);
      setNombreUsuarioCodigo(resultado.nombreUsuario);
      setShowCodigoModal(true);
      setShowAprobarAlert(false);
      setSolicitudAprobar(null);
      
      // Recargar solicitudes
      cargarSolicitudesRecuperacion();
    } catch (error: any) {
      console.error('Error al aprobar solicitud:', error);
      setAlertMsg(error.response?.data?.error || 'Error al aprobar solicitud');
      setShowAlert(true);
      setShowAprobarAlert(false);
      setSolicitudAprobar(null);
    }
  };

  const handleRechazarSolicitud = async (idSolicitud: number) => {
    try {
      await rechazarSolicitud(idSolicitud, 'Rechazada por el administrador');
      setAlertMsg('Solicitud rechazada correctamente');
      setShowAlert(true);
      
      // Recargar solicitudes
      cargarSolicitudesRecuperacion();
    } catch (error: any) {
      console.error('Error al rechazar solicitud:', error);
      setAlertMsg(error.response?.data?.error || 'Error al rechazar solicitud');
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

          {/* ✅ NUEVA SECCIÓN: Solicitudes de recuperación de contraseña */}
            <div className="usuarios-section usuarios-recuperacion-section">
              <div className="encb">
                <h2 className="usuarios-section-title">
                  <IonIcon 
                    icon={keyOutline} 
                    style={{ 
                      marginRight: '10px',
                      fontSize: '1.5rem',
                      verticalAlign: 'middle'
                    }}
                  />
                  Historial de Recuperación de Contraseñas
                  <IonChip color="warning" style={{ marginLeft: '10px' }}>
                    <IonLabel>{solicitudesRecuperacion.length}</IonLabel>
                  </IonChip>
                </h2>
              </div>
              
              <IonButton
                expand="block"
                onClick={() => setMostrarSolicitudes(!mostrarSolicitudes)}
                className="ver-usuarios-btn"
                color={mostrarSolicitudes ? "medium" : "warning"}
              >
                <IonIcon 
                  slot="start" 
                  icon={mostrarSolicitudes ? closeCircleOutline : keyOutline} 
                />
                {mostrarSolicitudes ? "Ocultar Solicitudes" : "Ver Solicitudes"}
              </IonButton>

              {mostrarSolicitudes && (
                <>
                  {/* Toggles para filtrar historial */}
                  <div className="recuperacion-filtros-historial">
                    <IonItem lines="none" className="recuperacion-toggle-item">
                      <IonIcon icon={checkmarkCircle} slot="start" color="success" />
                      <IonLabel>Mostrar Finalizadas</IonLabel>
                      <IonToggle
                        checked={mostrarFinalizadas}
                        onIonChange={(e) => setMostrarFinalizadas(e.detail.checked)}
                        color="success"
                      />
                    </IonItem>
                    <IonItem lines="none" className="recuperacion-toggle-item">
                      <IonIcon icon={closeCircleOutline} slot="start" color="danger" />
                      <IonLabel>Mostrar Rechazadas</IonLabel>
                      <IonToggle
                        checked={mostrarRechazadas}
                        onIonChange={(e) => setMostrarRechazadas(e.detail.checked)}
                        color="danger"
                      />
                    </IonItem>
                  </div>

                  <IonList className="usuarios-list usuarios-list-animate" lines="none">
                  {solicitudesRecuperacion.map((solicitud) => {
                    // Función helper para obtener color del badge según estado
                    const getBadgeColor = () => {
                      switch (solicitud.estado) {
                        case 'PENDIENTE': return 'warning';
                        case 'APROBADA': return 'primary';
                        case 'FINALIZADA': return 'success';
                        case 'RECHAZADA': return 'danger';
                        default: return 'medium';
                      }
                    };

                    // Función helper para obtener icono del badge
                    const getBadgeIcon = () => {
                      switch (solicitud.estado) {
                        case 'PENDIENTE': return time;
                        case 'APROBADA': return keyOutline;
                        case 'FINALIZADA': return checkmarkCircle;
                        case 'RECHAZADA': return closeCircleOutline;
                        default: return time;
                      }
                    };

                    // Función helper para obtener texto del badge
                    const getBadgeText = () => {
                      switch (solicitud.estado) {
                        case 'PENDIENTE': return 'Pendiente';
                        case 'APROBADA': return 'Código Generado';
                        case 'FINALIZADA': return 'Finalizada';
                        case 'RECHAZADA': return 'Rechazada';
                        default: return solicitud.estado;
                      }
                    };

                    return (
                    <IonItem key={solicitud.idSolicitud} className="recuperacion-solicitud-item" lines="none">
                      <div className={`recuperacion-solicitud-card recuperacion-solicitud-card--${solicitud.estado.toLowerCase()}`}>
                        <div className="recuperacion-solicitud-header">
                          <div className="recuperacion-solicitud-usuario">
                            <IonIcon 
                              icon={personCircleOutline} 
                              className="recuperacion-solicitud-usuario-icon"
                            />
                            <h3 className="recuperacion-solicitud-usuario-nombre">
                              {solicitud.Usuario?.nombreUsuario || 'Usuario desconocido'}
                            </h3>
                          </div>
                          <IonChip 
                            className="recuperacion-solicitud-badge"
                            color={getBadgeColor()}
                          >
                            <IonIcon icon={getBadgeIcon()} />
                            <IonLabel>{getBadgeText()}</IonLabel>
                          </IonChip>
                        </div>
                        
                        {/* Motivo de la solicitud */}
                        {(solicitud.motivoSolicitud || solicitud.Motivo) && (
                          <div className="recuperacion-solicitud-motivo">
                            <IonIcon icon={alertCircleOutline} className="recuperacion-solicitud-motivo-icon" />
                            <span className="recuperacion-solicitud-motivo-label">Motivo:</span>
                            <span className="recuperacion-solicitud-motivo-valor">
                              {solicitud.Motivo?.descripcion || solicitud.motivoSolicitud}
                            </span>
                          </div>
                        )}

                        <div className="recuperacion-solicitud-info">
                          <div className="recuperacion-solicitud-fecha">
                            <IonIcon icon={time} className="recuperacion-solicitud-fecha-icon" />
                            <span className="recuperacion-solicitud-fecha-label">Solicitado:</span>
                            <span className="recuperacion-solicitud-fecha-valor">
                              {formatearFecha12h(solicitud.fechaSolicitud)}
                            </span>
                          </div>
                          {solicitud.estado === 'APROBADA' && solicitud.codigo && (
                            <div className="recuperacion-solicitud-fecha" style={{ marginTop: '0.5rem' }}>
                              <IonIcon icon={keyOutline} className="recuperacion-solicitud-fecha-icon" />
                              <span className="recuperacion-solicitud-fecha-label">Código:</span>
                              <span className="recuperacion-solicitud-fecha-valor" style={{ 
                                fontWeight: 'bold', 
                                fontSize: '1.1rem',
                                letterSpacing: '3px',
                                color: 'var(--ion-color-primary)'
                              }}>
                                {solicitud.codigo}
                              </span>
                            </div>
                          )}
                          {solicitud.estado === 'FINALIZADA' && solicitud.fechaFinalizacion && (
                            <div className="recuperacion-solicitud-fecha" style={{ marginTop: '0.5rem' }}>
                              <IonIcon icon={checkmarkCircle} className="recuperacion-solicitud-fecha-icon" />
                              <span className="recuperacion-solicitud-fecha-label">Finalizada:</span>
                              <span className="recuperacion-solicitud-fecha-valor">
                                {formatearFecha12h(solicitud.fechaFinalizacion)}
                              </span>
                            </div>
                          )}
                          {solicitud.estado === 'RECHAZADA' && solicitud.motivoRechazo && (
                            <div className="recuperacion-solicitud-fecha" style={{ marginTop: '0.5rem' }}>
                              <IonIcon icon={closeCircleOutline} className="recuperacion-solicitud-fecha-icon" />
                              <span className="recuperacion-solicitud-fecha-label">Motivo rechazo:</span>
                              <span className="recuperacion-solicitud-fecha-valor" style={{ color: 'var(--ion-color-danger)' }}>
                                {solicitud.motivoRechazo}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="recuperacion-solicitud-actions">
                          {solicitud.estado === 'PENDIENTE' ? (
                            <>
                              <IonButton
                                size="default"
                                className="recuperacion-btn-aprobar"
                                onClick={() => handleAprobarSolicitud(solicitud.idSolicitud)}
                              >
                                <IonIcon icon={checkmarkCircle} slot="start" />
                                Aprobar y Generar Código
                              </IonButton>
                              <IonButton
                                size="default"
                                className="recuperacion-btn-rechazar"
                                fill="outline"
                                onClick={() => handleRechazarSolicitud(solicitud.idSolicitud)}
                              >
                                <IonIcon icon={closeCircleOutline} slot="start" />
                                Rechazar
                              </IonButton>
                            </>
                          ) : solicitud.estado === 'APROBADA' ? (
                            <IonText color="primary">
                              <p style={{ margin: 0, fontWeight: 500 }}>
                                <IonIcon icon={keyOutline} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                Esperando que el usuario use el código para restablecer su contraseña
                              </p>
                            </IonText>
                          ) : solicitud.estado === 'FINALIZADA' ? (
                            <IonText color="success">
                              <p style={{ margin: 0, fontWeight: 500 }}>
                                <IonIcon icon={checkmarkCircle} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                Contraseña restablecida exitosamente
                              </p>
                            </IonText>
                          ) : solicitud.estado === 'RECHAZADA' ? (
                            <IonText color="danger">
                              <p style={{ margin: 0, fontWeight: 500 }}>
                                <IonIcon icon={closeCircleOutline} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                Solicitud rechazada por el administrador
                              </p>
                            </IonText>
                          ) : null}
                        </div>
                      </div>
                    </IonItem>
                    );
                  })}
                </IonList>
                </>
              )}
            </div>

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
                  
                  {/* ✅ NUEVO: Toggle para mostrar inactivos */}
                  <IonItem lines="none">
                    <IonIcon slot="start" icon={toggleOutline} color="medium" />
                    <IonLabel>Mostrar usuarios inactivos</IonLabel>
                    <IonToggle
                      checked={mostrarInactivos}
                      onIonChange={(e) => {
                        setMostrarInactivos(e.detail.checked);
                        setCurrentPage(1);
                      }}
                      color="primary"
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong>{usuario.username}</strong>
                        {/* ✅ NUEVO: Chip de estado */}
                        <IonChip 
                          color={usuario.estaActivo !== false ? "success" : "medium"} 
                          style={{ fontSize: '0.75rem', height: '20px' }}
                        >
                          <IonIcon icon={usuario.estaActivo !== false ? checkmarkCircle : closeCircleOutline} />
                          <IonLabel>{usuario.estaActivo !== false ? "Activo" : "Inactivo"}</IonLabel>
                        </IonChip>
                      </div>
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
                      disabled={usuario.estaActivo === false}
                    >
                      <IonIcon slot="icon-only" icon={pencilOutline} className="boton" />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      color="tertiary"
                      onClick={() => handleCambiarPassword(usuario.id)}
                      disabled={usuario.estaActivo === false}
                    >
                      <IonIcon slot="icon-only" icon={keyOutline} className="boton" />
                    </IonButton>
                    {/* ✅ NUEVO: Botón Historial */}
                    <IonButton
                      fill="clear"
                      color="medium"
                      onClick={() => mostrarHistorial(usuario)}
                    >
                      <IonIcon slot="icon-only" icon={time} className="boton" />
                    </IonButton>
                    {/* ✅ MODIFICADO: Botón Inactivar/Reactivar */}
                    <IonButton
                      fill="clear"
                      color={usuario.estaActivo !== false ? "danger" : "success"}
                      onClick={() => handleInactivarReactivar(usuario)}
                    >
                      <IonIcon 
                        slot="icon-only" 
                        icon={usuario.estaActivo !== false ? powerOutline : refreshOutline} 
                        className="boton" 
                      />
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
          
          {/* Alert de confirmación para aprobar solicitud de recuperación */}
          <IonAlert
            isOpen={showAprobarAlert}
            header="⚠️ Confirmar Aprobación"
            message="IMPORTANTE: Al aprobar esta solicitud, la contraseña actual del usuario será ELIMINADA inmediatamente. El usuario NO podrá acceder al sistema hasta que use el código de 4 dígitos para establecer una nueva contraseña. ¿Desea continuar?"
            buttons={[
              {
                text: 'Cancelar',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                  setShowAprobarAlert(false);
                  setSolicitudAprobar(null);
                }
              },
              {
                text: 'Aprobar y Generar Código',
                cssClass: 'primary',
                handler: () => confirmAprobarSolicitud()
              }
            ]}
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
          
          {/* ✅ NUEVO: Modal de reasignación de pedidos */}
          <IonModal 
            isOpen={showInactivarModal} 
            onDidDismiss={() => {
              setShowInactivarModal(false);
              setUsuarioAInactivar(null);
              setUsuarioDestinoId(null);
              setPedidosActivos([]);
              setUsuariosParaReasignar([]);
            }}
            className="modal-inactivar"
          >
            <IonHeader>
              <IonToolbar color="danger">
                <IonTitle>
                  <IonIcon icon={personRemoveOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Inactivar Usuario
                </IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => {
                    setShowInactivarModal(false);
                    setMotivoSeleccionado(null);
                    setObservacionInactivacion('');
                  }}>
                    <IonIcon icon={closeCircleOutline} />
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              {/* SECCIÓN OBLIGATORIA: Motivo de Inactivación */}
              <IonCard className="motivo-inactivacion-card">
                <IonCardHeader>
                  <IonCardTitle color="danger">
                    📋 Motivo de Inactivación (Obligatorio)
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonIcon icon={alertCircleOutline} slot="start" color="danger" />
                    <IonLabel position="floating">Seleccione el motivo *</IonLabel>
                    <IonSelect
                      value={motivoSeleccionado}
                      placeholder="Seleccione un motivo"
                      onIonChange={(e) => setMotivoSeleccionado(e.detail.value)}
                      interface="alert"
                    >
                      {motivosInactivacion.map((motivo) => (
                        <IonSelectOption key={motivo.idMotivo} value={motivo.idMotivo}>
                          {motivo.descripcion}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <IonItem style={{ marginTop: '15px' }}>
                    <IonLabel position="floating">Observaciones adicionales (opcional)</IonLabel>
                    <IonTextarea
                      value={observacionInactivacion}
                      placeholder="Agregue cualquier detalle relevante sobre la inactivación..."
                      onIonChange={(e) => setObservacionInactivacion(e.detail.value || '')}
                      rows={3}
                      maxlength={500}
                    />
                  </IonItem>
                </IonCardContent>
              </IonCard>

              {/* SECCIÓN CONDICIONAL: Solo si tiene pedidos activos */}
              {pedidosActivos.length > 0 && (
                <>
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle color="warning">
                        ⚠️ El usuario tiene pedidos activos
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>
                        El usuario <strong>{usuarioAInactivar?.username}</strong> tiene{' '}
                        <strong>{pedidosActivos.length}</strong> pedido(s) activo(s).
                      </p>
                      <p>
                        Debe reasignar estos pedidos a otro usuario con los mismos roles antes de inactivarlo.
                      </p>
                    </IonCardContent>
                  </IonCard>

                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>
                        📦 Pedidos Activos ({pedidosActivos.length})
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        {pedidosActivos.map((pedido, index) => (
                          <IonItem key={index} lines="full">
                            <IonLabel>
                              <h3>{pedido.numeroPedido}</h3>
                              <p>Cliente: {pedido.nombreCliente}</p>
                              <p>Fecha: {formatFechaSola(pedido.fechaPedido)}</p>
                            </IonLabel>
                            <div slot="end" className={`pedido-estado-badge ${obtenerClaseDeEstado(pedido.nombreEstado || '')}`}>
                              {pedido.nombreEstado || `Estado ${pedido.idEstado}`}
                            </div>
                          </IonItem>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>

                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>
                        👤 Seleccionar Usuario Destino
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {usuariosParaReasignar.length > 0 ? (
                        <>
                          <IonItem>
                            <IonIcon icon={personCircleOutline} slot="start" color="primary" />
                            <IonLabel position="floating">Usuario para reasignar pedidos *</IonLabel>
                            <IonSelect
                              value={usuarioDestinoId}
                              placeholder="Seleccione un usuario"
                              onIonChange={(e) => setUsuarioDestinoId(e.detail.value)}
                              interface="alert"
                            >
                              {usuariosParaReasignar.map((u) => (
                                <IonSelectOption key={u.id} value={u.id}>
                                  {u.username} - {u.roles}
                                </IonSelectOption>
                              ))}
                            </IonSelect>
                          </IonItem>

                          <IonButton
                            expand="block"
                            color="warning"
                            onClick={handleConfirmarReasignacion}
                            disabled={!usuarioDestinoId || !motivoSeleccionado}
                            style={{ marginTop: '20px' }}
                          >
                            <IonIcon icon={swapHorizontalOutline} slot="start" />
                            Reasignar e Inactivar Usuario
                          </IonButton>
                        </>
                      ) : (
                        <IonText color="danger">
                          <p>
                            ⚠️ No hay usuarios activos con los mismos roles disponibles para reasignar.
                            No se puede inactivar este usuario.
                          </p>
                        </IonText>
                      )}
                    </IonCardContent>
                  </IonCard>
                </>
              )}

              {/* SECCIÓN: Inactivación directa (sin pedidos) */}
              {pedidosActivos.length === 0 && (
                <IonCard>
                  <IonCardContent>
                    <IonText>
                      <p>
                        El usuario <strong>{usuarioAInactivar?.username}</strong> no tiene pedidos activos.
                        Puede inactivarlo directamente.
                      </p>
                    </IonText>

                    <IonButton
                      expand="block"
                      color="danger"
                      onClick={async () => {
                        if (!motivoSeleccionado) {
                          setAlertMsg("Debe seleccionar un motivo de inactivación");
                          setShowAlert(true);
                          return;
                        }

                        try {
                          await inactivarUsuarioDirecto(
                            usuarioAInactivar!.id,
                            motivoSeleccionado,
                            observacionInactivacion || undefined
                          );
                          setAlertMsg(`Usuario ${usuarioAInactivar?.username} inactivado correctamente`);
                          setShowAlert(true);
                          setShowInactivarModal(false);
                          setMotivoSeleccionado(null);
                          setObservacionInactivacion('');
                          cargarUsuarios(mostrarInactivos).then(setUsuarios);
                        } catch (error: any) {
                          setAlertMsg(error.response?.data?.message || "Error al inactivar usuario");
                          setShowAlert(true);
                        }
                      }}
                      disabled={!motivoSeleccionado}
                      style={{ marginTop: '20px' }}
                    >
                      <IonIcon icon={personRemoveOutline} slot="start" />
                      Inactivar Usuario
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              )}

              {/* Botón Cancelar */}
              <IonButton
                expand="block"
                color="medium"
                fill="outline"
                onClick={() => {
                  setShowInactivarModal(false);
                  setMotivoSeleccionado(null);
                  setObservacionInactivacion('');
                }}
                style={{ marginTop: '10px' }}
              >
                <IonIcon icon={closeCircleOutline} slot="start" />
                Cancelar
              </IonButton>
            </IonContent>
          </IonModal>

          {/* ✅ NUEVO: Modal de historial */}
          {usuarioHistorial && (
            <HistorialUsuario
              isOpen={showHistorial}
              onDidDismiss={cerrarHistorial}
              usuarioId={usuarioHistorial.id}
              usuarioNombre={usuarioHistorial.username}
            />
          )}

          {/* ✅ NUEVO: Modal para mostrar código generado */}
          <IonModal isOpen={showCodigoModal} onDidDismiss={() => setShowCodigoModal(false)} className="modal-codigo-recuperacion">
            <IonHeader>
              <IonToolbar color="success">
                <IonTitle>Código de Recuperación Generado</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => setShowCodigoModal(false)}>
                    <IonIcon icon={close} />
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="modal-codigo-content">
              <IonCard className="modal-codigo-card">
                <IonCardContent className="modal-codigo-card-content">
                  <div className="modal-codigo-body">
                    <IonIcon 
                      icon={checkmarkCircle} 
                      className="modal-codigo-icon-success"
                    />
                    <h2 className="modal-codigo-title">Solicitud Aprobada</h2>
                    <p className="modal-codigo-usuario">
                      Usuario: <strong>{nombreUsuarioCodigo}</strong>
                    </p>
                    
                    <div className="modal-codigo-box">
                      <p className="modal-codigo-label">
                        Código de 4 dígitos:
                      </p>
                      <h1 className="modal-codigo-numero">
                        {codigoGenerado}
                      </h1>
                    </div>
                    
                    <div className="modal-codigo-warning">
                      <IonIcon icon={alertCircleOutline} className="modal-codigo-warning-icon" />
                      <p className="modal-codigo-warning-text">
                        Este código debe ser comunicado al usuario. 
                        Expira en 24 horas y tiene un máximo de 5 intentos.
                      </p>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
              
              <IonButton 
                expand="block" 
                onClick={() => setShowCodigoModal(false)}
                className="modal-codigo-btn"
                color="success"
              >
                Entendido
              </IonButton>
            </IonContent>
          </IonModal>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Usuarios;
