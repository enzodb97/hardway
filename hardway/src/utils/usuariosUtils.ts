import axios from "axios";

export interface Usuario {
  id: number;
  username: string;
  password?: string;
  rol: string;
}

export const rolesDisponibles = ["admin", "vendedor", "consulta"];

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
