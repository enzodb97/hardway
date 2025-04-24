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
}

const ClientesContext = createContext<ClientesContextType>({
  clientes: [],
  agregarCliente: () => {},
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

  return (
    <ClientesContext.Provider value={{ clientes, agregarCliente }}>
      {children}
    </ClientesContext.Provider>
  );
};

export const useClientes = () => useContext(ClientesContext);
