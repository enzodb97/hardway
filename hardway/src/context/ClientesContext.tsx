import { createContext, useContext, useState } from "react";

export interface Cliente {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  domicilio: string;
  localidad: string;
  cp: string;
  telefono: string;
  email?: string;
}

interface ClientesContextType {
  clientes: Cliente[];
  agregarCliente: (nuevoCliente: Omit<Cliente, "id">) => void;
  editarCliente: (clienteActualizado: Cliente) => void;
  eliminarCliente: (id: number) => void;
}

const ClientesContext = createContext<ClientesContextType>({
  clientes: [],
  agregarCliente: () => {},
  editarCliente: () => {},
  eliminarCliente: () => {},
});

export const ClientesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ultimoId, setUltimoId] = useState(0);

  const obtenerNuevoId = () => {
    const nuevoId = ultimoId + 1;
    setUltimoId(nuevoId);
    return nuevoId;
  };

  const agregarCliente = (nuevoCliente: Omit<Cliente, "id">) => {
    setClientes((prev) => [...prev, { ...nuevoCliente, id: obtenerNuevoId() }]);
  };

  const editarCliente = (clienteActualizado: Cliente) => {
    setClientes((prev) =>
      prev.map((cliente) =>
        cliente.id === clienteActualizado.id ? clienteActualizado : cliente
      )
    );
  };

  const eliminarCliente = (id: number) => {
    setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
  };

  return (
    <ClientesContext.Provider
      value={{
        clientes,
        agregarCliente,
        editarCliente: editarCliente,
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
