import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../config/axios";

export interface Cliente {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  domicilio: string;
  calle: string;
  altura: string;
  piso: string;
  numeroDepartamento: string;
  observaciones: string;
  localidad: string;
  barrio: string;
  cp: string;
  telefono: string;
  email?: string;
  estaActivo?: number; // 1 = activo, 0 = inactivo
}

export interface MotivoBaja {
  idMotivo: number;
  descripcion: string;
}

interface ClientesContextType {
  clientes: Cliente[];
  agregarCliente: (nuevoCliente: Omit<Cliente, "id">) => void;
  modificarCliente: (clienteActualizado: Cliente) => void;
  eliminarCliente: (id: number) => void;
  darDeBajaCliente: (id: number, idMotivo: number, observaciones?: string) => void;
  darDeAltaCliente: (id: number) => void;
  obtenerHistorialCliente: (id: number) => Promise<any>;
  obtenerMotivosBaja: () => Promise<MotivoBaja[]>;
  recargarClientes: () => Promise<void>;
}

const ClientesContext = createContext<ClientesContextType>({
  clientes: [],
  agregarCliente: () => {},
  modificarCliente: () => {},
  eliminarCliente: () => {},
  darDeBajaCliente: () => {},
  darDeAltaCliente: () => {},
  obtenerHistorialCliente: async () => [],
  obtenerMotivosBaja: async () => [],
  recargarClientes: async () => {},
});

export const ClientesProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Función para cargar clientes desde el backend
  const fetchClientes = async () => {
    try {
      console.log('🔄 Cargando clientes desde el backend...');
      const response = await axiosInstance.get("/api/clientes");
      console.log('✅ Clientes obtenidos:', response.data.length);
      
      // Log detallado para depuración
      const activosCount = response.data.filter((c: Cliente) => c.estaActivo === 1).length;
      const inactivosCount = response.data.filter((c: Cliente) => c.estaActivo === 0).length;
      console.log(`📊 Estados: ${activosCount} activos, ${inactivosCount} inactivos`);
      
      // Log de los primeros clientes para verificar estructura
      console.log('📋 Primeros 3 clientes:', response.data.slice(0, 3).map((c: Cliente) => ({
        id: c.id,
        nombre: c.nombre,
        apellido: c.apellido,
        estaActivo: c.estaActivo
      })));
      
      setClientes(response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
      // Mostrar más detalles del error
      if (error instanceof Error) {
        console.error('Status:', (error as any).response?.status);
        console.error('Data:', (error as any).response?.data);
      }
      throw error;
    }
  };

  // Cargar clientes al inicializar
  useEffect(() => {
    fetchClientes();
  }, []);

  const agregarCliente = async (nuevoCliente: Omit<Cliente, "id">) => {
    try {
      const response = await axiosInstance.post("/api/clientes", nuevoCliente);
      setClientes((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error al agregar cliente:", error);
    }
  };

  const modificarCliente = async (clienteActualizado: Cliente) => {
    try {
      await axiosInstance.put(
        `/api/clientes/${clienteActualizado.id}`,
        clienteActualizado
      );
      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === clienteActualizado.id ? clienteActualizado : cliente
        )
      );
    } catch (error) {
      console.error("Error al modificar cliente:", error);
    }
  };

  const obtenerClientes = async () => {
    return await fetchClientes();
  };

  const eliminarCliente = async (id: number) => {
    try {
      await axiosInstance.delete(`/api/clientes/${id}`);
      await fetchClientes(); // Usar la función fetchClientes
    } catch (error) {
      throw error;
    }
  };

  const darDeBajaCliente = async (id: number, idMotivo: number, observaciones?: string) => {
    try {
      console.log(`🔄 Dando de baja cliente ID: ${id}, Motivo: ${idMotivo}`);
      const response = await axiosInstance.put(`/api/clientes/${id}/baja`, { 
        idUsuario: 1, // Usuario temporal
        idMotivo: idMotivo,
        observaciones: observaciones 
      });
      console.log('📝 Respuesta del servidor:', response.data);
      
      // Recargar todos los clientes desde el servidor para asegurar consistencia
      console.log('🔄 Recargando lista de clientes...');
      const clientesActualizados = await fetchClientes();
      
      // Verificar que el cliente específico se haya actualizado
      const clienteActualizado = clientesActualizados.find((c: Cliente) => c.id === id);
      if (clienteActualizado) {
        console.log(`✅ Cliente ${id} actualizado - Estado: ${clienteActualizado.estaActivo === 0 ? 'INACTIVO' : 'ACTIVO'}`);
      } else {
        console.log(`❌ No se encontró el cliente ${id} en la respuesta`);
      }
    } catch (error) {
      console.error("Error al dar de baja cliente:", error);
      throw error;
    }
  };

  const darDeAltaCliente = async (id: number) => {
    try {
      console.log(`🔄 Dando de alta cliente ID: ${id}`);
      const response = await axiosInstance.put(`/api/clientes/${id}/alta`, { idUsuario: 1 }); // Usuario temporal
      console.log('📝 Respuesta del servidor:', response.data);
      
      // Recargar todos los clientes desde el servidor para asegurar consistencia
      console.log('🔄 Recargando lista de clientes...');
      const clientesActualizados = await fetchClientes();
      
      // Verificar que el cliente específico se haya actualizado
      const clienteActualizado = clientesActualizados.find((c: Cliente) => c.id === id);
      if (clienteActualizado) {
        console.log(`✅ Cliente ${id} actualizado - Estado: ${clienteActualizado.estaActivo === 0 ? 'INACTIVO' : 'ACTIVO'}`);
      } else {
        console.log(`❌ No se encontró el cliente ${id} en la respuesta`);
      }
    } catch (error) {
      console.error("Error al dar de alta cliente:", error);
      throw error;
    }
  };

  // Función para obtener historial de un cliente
  const obtenerHistorialCliente = async (id: number) => {
    try {
      console.log(`📊 Obteniendo historial para cliente ID: ${id}`);
      const response = await axiosInstance.get(`/api/clientes/${id}/historial`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener historial de cliente:", error);
      throw error;
    }
  };

  // Función para obtener los motivos de baja
  const obtenerMotivosBaja = async () => {
    try {
      console.log('📋 Obteniendo motivos de baja...');
      const response = await axiosInstance.get('/api/clientes/motivos-baja');
      return response.data;
    } catch (error) {
      console.error("Error al obtener motivos de baja:", error);
      throw error;
    }
  };

  // Función para recargar clientes manualmente
  const recargarClientes = async () => {
    try {
      console.log('🔄 Recargando clientes manualmente...');
      await fetchClientes();
    } catch (error) {
      console.error("Error al recargar clientes:", error);
      throw error;
    }
  };

  return (
    <ClientesContext.Provider
      value={{
        clientes,
        agregarCliente,
        modificarCliente,
        eliminarCliente,
        darDeBajaCliente,
        darDeAltaCliente,
        obtenerHistorialCliente,
        obtenerMotivosBaja,
        recargarClientes,
      }}
    >
      {children}
    </ClientesContext.Provider>
  );
};

export const useClientes = () => {
  const context = useContext(ClientesContext);
  if (!context) {
    throw new Error("useClientes debe usarse dentro de ClientesProvider");
  }
  return context;
};
