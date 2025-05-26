import { Cliente } from "../context/ClientesContext";

// Validar unicidad de cliente
export function validarUnicidadCliente(
  cliente: Partial<Cliente>,
  clientes: Cliente[]
): string | null {
  const { numeroDocumento, email, telefono, id } = cliente;
  if (numeroDocumento) {
    const existeDNI = clientes.find(
      (c) => c.numeroDocumento === numeroDocumento && c.id !== id
    );
    if (existeDNI)
      return `Ya existe un cliente con el N° de Documento: ${numeroDocumento}`;
  }
  if (email) {
    const existeEmail = clientes.find((c) => c.email === email && c.id !== id);
    if (existeEmail) return `Ya existe un cliente con el Email: ${email}`;
  }
  if (telefono) {
    const existeTel = clientes.find(
      (c) => c.telefono === telefono && c.id !== id
    );
    if (existeTel) return `Ya existe un cliente con el Teléfono: ${telefono}`;
  }
  return null;
}

// Validar campos obligatorios y mínimos
export function validarCamposCliente(
  formData: Partial<Cliente>
): string | null {
  if (formData.numeroDocumento && formData.numeroDocumento.trim().length < 3) {
    return "El N° de Documento debe tener al menos 3 caracteres.";
  }
  if (formData.nombre && formData.nombre.trim().length < 3) {
    return "El nombre y apellido deben tener al menos 3 caracteres.";
  }
  if (!formData.barrio || formData.barrio.trim().length < 2) {
    return "El campo Barrio es obligatorio.";
  }
  return null;
}

// Solo permite números en los campos
export function soloNumeros(value: string, previous: string): string {
  return /^\d*$/.test(value) ? value : previous;
}
