import { createContext, useContext, useState } from "react";

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  celular: string;
  numeroCliente: string;
  localidad: string;
}

interface ClientesContextType {
  clientes: Cliente[];
  agregarCliente: (nuevoCliente: Omit<Cliente, "id">) => void;
  editarCliente: (clienteActualizado: Cliente) => void;
}

const ClientesContext = createContext<ClientesContextType>({
  clientes: [],
  agregarCliente: () => {},
  editarCliente: () => {},
});

export const ClientesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: 1,
      nombre: "Enzo Bertolusso",
      email: "enzober@gmail.com",
      celular: "123456789",
      numeroCliente: "123",
      localidad: "Rosario, Santa Fe",
    },
  ]);

  const agregarCliente = (nuevoCliente: Omit<Cliente, "id">) => {
    setClientes((prev) => [...prev, { ...nuevoCliente, id: Date.now() }]);
  };

  const editarCliente = (clienteActualizado: Cliente) => {
    setClientes((prev) =>
      prev.map((cliente) =>
        cliente.id === clienteActualizado.id ? clienteActualizado : cliente
      )
    );
  };

  return (
    <ClientesContext.Provider
      value={{ clientes, agregarCliente, editarCliente }}
    >
      {children}
    </ClientesContext.Provider>
  );
};

export const useClientes = () => useContext(ClientesContext);
