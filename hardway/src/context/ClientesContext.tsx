import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export interface Cliente {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  domicilio: string;
  calle: string;
  altura: string;
  piso: string;
  numeroDepartamento: string;
  observaciones: string;
  localidad: string;
  barrio: string; // <-- Agregado
  cp: string;
  telefono: string;
  email?: string;
}

interface ClientesContextType {
  clientes: Cliente[];
  agregarCliente: (nuevoCliente: Omit<Cliente, "id">) => void;
  modificarCliente: (clienteActualizado: Cliente) => void;
  eliminarCliente: (id: number) => void;
}

const ClientesContext = createContext<ClientesContextType>({
  clientes: [],
  agregarCliente: () => {},
  modificarCliente: () => {},
  eliminarCliente: () => {},
});

export const ClientesProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Cargar clientes desde el backend
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        console.log('Intentando obtener clientes del backend...');
        const response = await axios.get("/api/clientes");
        console.log('Respuesta del servidor:', response.data);
        setClientes(response.data);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        // Mostrar más detalles del error
        if (axios.isAxiosError(error)) {
          console.error('Status:', error.response?.status);
          console.error('Data:', error.response?.data);
        }
      }
    };

    fetchClientes();
  }, []);

  const agregarCliente = async (nuevoCliente: Omit<Cliente, "id">) => {
    try {
      const response = await axios.post("/api/clientes", nuevoCliente);
      setClientes((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error al agregar cliente:", error);
    }
  };

  const modificarCliente = async (clienteActualizado: Cliente) => {
    try {
      await axios.put(
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

  const eliminarCliente = async (id: number) => {
    try {
      await axios.delete(`/api/clientes/${id}`);
      // Actualiza el estado de clientes aquí si es necesario
    } catch (error) {
      throw error; // <-- Esto es clave para que el catch del componente lo capture
    }
  };

  return (
    <ClientesContext.Provider
      value={{
        clientes,
        agregarCliente,
        modificarCliente,
        eliminarCliente,
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
