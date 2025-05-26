import axios from "axios";

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
  // Si es creación, la contraseña es obligatoria
  if (usuario.password !== undefined && usuario.password.trim().length < 4) {
    return "La contraseña debe tener al menos 4 caracteres.";
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
  const res = await axios.get("/api/usuarios");
  return res.data;
};

// Crear usuario
export const crearUsuario = async (nuevoUsuario: Omit<Usuario, "id">) => {
  return await axios.post("/api/usuarios", nuevoUsuario);
};

// Eliminar usuario
export const eliminarUsuario = async (id: number) => {
  return await axios.delete(`/api/usuarios/${id}`);
};

// Editar usuario
export const editarUsuario = async (usuario: Usuario) => {
  return await axios.put(`/api/usuarios/${usuario.id}`, {
    username: usuario.username,
    rol: usuario.rol,
  });
};

// Cambiar contraseña
export const cambiarPassword = async (id: number, password: string) => {
  return await axios.put(`/api/usuarios/${id}/password`, { password });
};
