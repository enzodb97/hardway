// Servicio para gestionar la recuperación de contraseñas
import axiosInstance from "../config/axios";

// =====================================
// ENDPOINTS PÚBLICOS (Sin autenticación)
// =====================================

/**
 * Obtiene el catálogo de motivos para solicitar recuperación de contraseña
 */
export const obtenerMotivosRecuperacion = async () => {
  const response = await axiosInstance.get("/api/recuperacion-password/motivos");
  return response.data;
};

/**
 * Solicita la recuperación de contraseña para un usuario
 * @param nombreUsuario - Nombre de usuario que solicita recuperación
 * @param idMotivo - ID del motivo seleccionado del catálogo (opcional)
 * @param motivoSolicitud - Motivo en texto libre si no se seleccionó del catálogo (opcional)
 */
export const solicitarRecuperacion = async (
  nombreUsuario: string,
  idMotivo?: number,
  motivoSolicitud?: string
) => {
  const response = await axiosInstance.post("/api/recuperacion-password/solicitar", {
    nombreUsuario,
    idMotivo,
    motivoSolicitud,
  });
  return response.data;
};

/**
 * Restablece la contraseña usando el código de 4 dígitos
 * @param nombreUsuario - Nombre de usuario
 * @param codigo - Código de 4 dígitos proporcionado por el administrador
 * @param nuevaPassword - Nueva contraseña (mínimo 8 caracteres, 1 número, 1 letra, 1 especial)
 */
export const restablecerPassword = async (
  nombreUsuario: string,
  codigo: string,
  nuevaPassword: string
) => {
  const response = await axiosInstance.post("/api/recuperacion-password/restablecer", {
    nombreUsuario,
    codigo,
    nuevaPassword,
  });
  return response.data;
};

/**
 * Verifica el código de recuperación sin cambiar la contraseña
 * @param nombreUsuario - Nombre de usuario
 * @param codigo - Código de 4 dígitos
 * @returns Respuesta indicando si el código es válido
 */
export const verificarCodigoRecuperacion = async (
  nombreUsuario: string,
  codigo: string
) => {
  const response = await axiosInstance.post("/api/recuperacion-password/verificar-codigo", {
    nombreUsuario,
    codigo,
  });
  return response.data;
};

// =====================================
// ENDPOINTS DE ADMINISTRACIÓN (Requieren autenticación)
// =====================================

/**
 * Obtiene todas las solicitudes de recuperación (solo administradores)
 * @param incluirFinalizadas - Si incluir solicitudes finalizadas en el historial
 * @param incluirRechazadas - Si incluir solicitudes rechazadas en el historial
 */
export const obtenerSolicitudesPendientes = async (
  incluirFinalizadas: boolean = false,
  incluirRechazadas: boolean = false
) => {
  const params = new URLSearchParams();
  if (incluirFinalizadas) params.append('incluirFinalizadas', 'true');
  if (incluirRechazadas) params.append('incluirRechazadas', 'true');
  
  const url = `/api/usuarios/solicitudes-recuperacion${params.toString() ? '?' + params.toString() : ''}`;
  const response = await axiosInstance.get(url);
  return response.data;
};

/**
 * Aprueba una solicitud y genera un código de 4 dígitos (solo administradores)
 * @param idSolicitud - ID de la solicitud a aprobar
 */
export const aprobarSolicitud = async (idSolicitud: number) => {
  const response = await axiosInstance.post(
    `/api/usuarios/aprobar-recuperacion/${idSolicitud}`
  );
  return response.data;
};

/**
 * Rechaza una solicitud de recuperación (solo administradores)
 * @param idSolicitud - ID de la solicitud a rechazar
 * @param motivo - Motivo del rechazo (opcional)
 */
export const rechazarSolicitud = async (idSolicitud: number, motivo?: string) => {
  const response = await axiosInstance.post(
    `/api/usuarios/rechazar-recuperacion/${idSolicitud}`,
    { motivo }
  );
  return response.data;
};
