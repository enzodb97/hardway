// pickingUtils.ts
import axiosInstance from "../config/axios";

export const cargarTareasPicking = async (rol: string, username: string) => {
  try {
    if (rol === "Administrador") {
      // Para administradores, usar endpoint especial que no requiere legajo
      const res = await axiosInstance.get("/api/picking/tareas-admin");
      return res.data;
    } else {
      // Para pickers, el legajo se extrae automáticamente del token
      const res = await axiosInstance.get("/api/picking/tareas");
      return res.data;
    }
  } catch (error) {
    console.error("Error en cargarTareasPicking:", error);
    throw error;
  }
};

export const verPickingList = async (numeroPedido: string) => {
  try {
    const res = await axiosInstance.get(`/api/picking/tareas/${numeroPedido}`);
    return res.data;
  } catch (error) {
    console.error("Error en verPickingList:", error);
    throw error;
  }
};

export const completarTareaPicking = async (
  idAsignacion: number,
  numeroPedido: string
) => {
  try {
    // Asegurarnos de que idAsignacion sea un número
    const idAsignacionNum = Number(idAsignacion);
    
    console.log('Completando tarea:', { 
      idAsignacion: idAsignacionNum, 
      idAsignacionOriginal: idAsignacion,
      tipoOriginal: typeof idAsignacion,
      tipoConvertido: typeof idAsignacionNum,
      numeroPedido 
    });
    
    const res = await axiosInstance.post(`/api/picking/tareas/${numeroPedido}/completar`, {
      idAsignacion: idAsignacionNum,
      observaciones: 'Tarea completada desde frontend'
    });
    
    console.log('Respuesta completar tarea:', res.data);
    return res.data;
  } catch (error: any) {
    console.error("Error en completarTareaPicking:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    console.error("Request URL:", error.config?.url);
    throw error;
  }
};
