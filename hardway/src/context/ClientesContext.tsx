import { createContext, useContext, useState, useEffect } from "react";

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
  const STORAGE_KEY = "hardwayClientes";
  const storedClientes = localStorage.getItem(STORAGE_KEY);
  const initialClientes = storedClientes
    ? (JSON.parse(storedClientes) as Cliente[])
    : [];
  const initialMaxId = initialClientes.reduce(
    (max: number, cliente: Cliente) => Math.max(max, cliente.id),
    0
  );

  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [ultimoId, setUltimoId] = useState(initialMaxId);

  useEffect(() => {
    console.log(
      "ClientesContext.tsx: Guardando clientes en localStorage:",
      clientes
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
  }, [clientes]);

  const obtenerNuevoId = () => {
    const nuevoId = ultimoId + 1;
    setUltimoId(nuevoId);
    return nuevoId;
  };

  const agregarCliente = (nuevoCliente: Omit<Cliente, "id">) => {
    const nuevoClienteConId = { ...nuevoCliente, id: obtenerNuevoId() };
    setClientes((prev) => [...prev, nuevoClienteConId]);
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
