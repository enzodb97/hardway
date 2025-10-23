import axiosInstance from "../config/axios";

export interface Usuario {
  id: number;
  username: string;
  password?: string;
  rol: string;
}

export const rolesDisponibles = ["admin", "vendedor", "consulta"];

// Validación de campos de usuario
export function validarCamposUsuario(usuario: Partial<Usuario>): string | null {
  if (!usuario.username || usuario.username.trim().length < 3) {
    return "El nombre de usuario debe tener al menos 3 caracteres.";
  }
  if (!usuario.rol) {
    return "El rol es obligatorio.";
  }
  
  // Validación de contraseña con criterios de seguridad
  if (usuario.password !== undefined && usuario.password !== null) {
    const password = usuario.password.trim();
    
    // Mínimo 8 caracteres
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }
    
    // Al menos 1 número
    if (!/\d/.test(password)) {
      return "La contraseña debe contener al menos 1 número.";
    }
    
    // Al menos 1 letra
    if (!/[a-zA-Z]/.test(password)) {
      return "La contraseña debe contener al menos 1 letra.";
    }
    
    // Al menos 1 carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "La contraseña debe contener al menos 1 carácter especial (!@#$%^&*()_+-=[]{}etc.).";
    }
  }
  
  return null;
}

// Validación de unicidad de usuario
export function validarUnicidadUsuario(
  usuario: Partial<Usuario>,
  usuarios: Usuario[]
): string | null {
  const { username, id } = usuario;
  if (username) {
    const existe = usuarios.find((u) => u.username === username && u.id !== id);
    if (existe) return `Ya existe un usuario con el nombre: ${username}`;
  }
  return null;
}

// Obtener usuarios
export const cargarUsuarios = async (): Promise<Usuario[]> => {
  const res = await axiosInstance.get("/api/usuarios");
  return res.data;
};

// Crear usuario
export const crearUsuario = async (nuevoUsuario: Omit<Usuario, "id">) => {
  return await axiosInstance.post("/api/usuarios", nuevoUsuario);
};

// Eliminar usuario
export const eliminarUsuario = async (id: number) => {
  return await axiosInstance.delete(`/api/usuarios/${id}`);
};

// Editar usuario
export const editarUsuario = async (usuario: Usuario) => {
  return await axiosInstance.put(`/api/usuarios/${usuario.id}`, {
    username: usuario.username,
    rol: usuario.rol,
  });
};

// Cambiar contraseña
export async function cambiarPassword(id: number, password: string) {
  // Validar que la nueva contraseña cumpla con los criterios de seguridad
  const passwordTrimmed = password.trim();
  
  if (passwordTrimmed.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }
  
  if (!/\d/.test(passwordTrimmed)) {
    throw new Error("La contraseña debe contener al menos 1 número.");
  }
  
  if (!/[a-zA-Z]/.test(passwordTrimmed)) {
    throw new Error("La contraseña debe contener al menos 1 letra.");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordTrimmed)) {
    throw new Error("La contraseña debe contener al menos 1 carácter especial.");
  }
  
  await axiosInstance.put(`/api/usuarios/${id}/password`, { password: passwordTrimmed });
}
