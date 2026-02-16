import { Cliente } from "../context/ClientesContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Validar unicidad de cliente
export function validarUnicidadCliente(
  cliente: Partial<Cliente>,
  clientes: Cliente[]
): string | null {
  const { numeroDocumento, email, telefono, id } = cliente;
  
  // Convertir a string para comparación consistente
  const numeroDocumentoStr = String(numeroDocumento || '').trim();
  const telefonoStr = String(telefono || '').trim();
  const emailStr = String(email || '').trim().toLowerCase();
  
  if (numeroDocumentoStr) {
    const existeDNI = clientes.find(
      (c) => String(c.numeroDocumento || '').trim() === numeroDocumentoStr && c.id !== id
    );
    if (existeDNI)
      return `Ya existe un cliente con el N° de Documento: ${numeroDocumentoStr}`;
  }
  if (emailStr) {
    const existeEmail = clientes.find(
      (c) => String(c.email || '').trim().toLowerCase() === emailStr && c.id !== id
    );
    if (existeEmail) return `Ya existe un cliente con el Email: ${emailStr}`;
  }
  if (telefonoStr) {
    const existeTel = clientes.find(
      (c) => String(c.telefono || '').trim() === telefonoStr && c.id !== id
    );
    if (existeTel) return `Ya existe un cliente con el Teléfono: ${telefonoStr}`;
  }
  return null;
}

// Validar campos obligatorios y mínimos
export function validarCamposCliente(
  formData: Partial<Cliente>
): string | null {
  // 1. Validar número de documento (obligatorio)
  const numeroDocumentoStr = String(formData.numeroDocumento || '').trim();
  if (!numeroDocumentoStr || numeroDocumentoStr.length === 0) {
    return "El N° de Documento es obligatorio.";
  }
  
  // Validar formato según tipo de documento
  if (formData.tipoDocumento === 'CUIL' || formData.tipoDocumento === 'CUIT') {
    const errorCUILCUIT = validarCUILCUIT(
      numeroDocumentoStr, 
      formData.tipoDocumento
    );
    if (errorCUILCUIT) return errorCUILCUIT;
  } else if (formData.tipoDocumento === 'DNI') {
    // Validar que el DNI tenga exactamente 7 u 8 dígitos
    if (numeroDocumentoStr.length < 7) {
      return "El DNI debe tener al menos 7 dígitos.";
    }
    if (numeroDocumentoStr.length > 8) {
      return "El DNI no puede superar los 8 dígitos.";
    }
  } else if (numeroDocumentoStr.length < 8) {
    return "El N° de Documento debe tener al menos 8 caracteres.";
  }
  
  // 2. Validar nombre (obligatorio)
  const nombreStr = String(formData.nombre || '').trim();
  if (!nombreStr || nombreStr.length === 0) {
    return formData.tipoDocumento === 'CUIT' 
      ? "El nombre de la empresa es obligatorio."
      : "El nombre es obligatorio.";
  }
  if (nombreStr.length < 3) {
    return formData.tipoDocumento === 'CUIT'
      ? "El nombre de la empresa debe tener al menos 3 caracteres."
      : "El nombre debe tener al menos 3 caracteres.";
  }
  
  // 3. Validar apellido (obligatorio solo si NO es CUIT)
  if (formData.tipoDocumento !== 'CUIT') {
    const apellidoStr = String(formData.apellido || '').trim();
    if (!apellidoStr || apellidoStr.length === 0) {
      return "El apellido es obligatorio.";
    }
    if (apellidoStr.length < 3) {
      return "El apellido debe tener al menos 3 caracteres.";
    }
  }
  
  // 4. Validar localidad (obligatorio)
  const localidadStr = String(formData.localidad || '').trim();
  if (!localidadStr || localidadStr.length === 0) {
    return "La localidad es obligatoria.";
  }
  if (localidadStr.length < 3) {
    return "La localidad debe tener al menos 3 caracteres.";
  }
  
  // 5. Validar barrio (obligatorio)
  const barrioStr = String(formData.barrio || '').trim();
  if (!barrioStr || barrioStr.length === 0) {
    return "El barrio es obligatorio.";
  }
  if (barrioStr.length < 3) {
    return "El barrio debe tener al menos 3 caracteres.";
  }
  
  // 6. Validar teléfono (obligatorio)
  const telefonoStr = String(formData.telefono || '').trim();
  if (!telefonoStr || telefonoStr.length === 0) {
    return "El teléfono es obligatorio.";
  }
  if (telefonoStr.length < 7) {
    return "El teléfono debe tener al menos 7 caracteres.";
  }

  return null;
}

// Solo permite números en los campos
export function soloNumeros(value: string, previous: string): string {
  return /^\d*$/.test(value) ? value : previous;
}

// Validar formato CUIL/CUIT: 11 dígitos numéricos (XX-XXXXXXXX-X)
export function validarCUILCUIT(valor: string, tipo: string): string | null {
  // Remover guiones si existen
  const valorLimpio = valor.replace(/-/g, '');
  
  // Verificar que tenga exactamente 11 dígitos
  if (valorLimpio.length !== 11) {
    return `El ${tipo} debe tener exactamente 11 dígitos numéricos.`;
  }
  
  // Verificar que solo contenga números
  if (!/^\d{11}$/.test(valorLimpio)) {
    return `El ${tipo} solo debe contener números.`;
  }
  
  return null;
}

// Exportar listado de clientes a PDF
export const exportarClientesPDF = (clientes: Cliente[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const title = "Lista de Clientes";
  const textWidth = doc.getTextWidth(title);
  const x = (pageWidth - textWidth) / 2;
  const logoBase64 =
    "data:image/png;base64,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";
  doc.addImage(logoBase64, "PNG", 10, 8, 15, 15);
  doc.text(title, x, 18);
  // Ordenar clientes por nombre
  const clientesOrdenados = [...clientes].sort((a, b) => {
    const nombreA = a.nombre?.toLowerCase() || "";
    const nombreB = b.nombre?.toLowerCase() || "";
    return nombreA.localeCompare(nombreB);
  });

  autoTable(doc, {
    head: [
      ["ID", "CUIT/DNI", "Nombre y Apellido", "Localidad", "Teléfono", "Email"],
    ],
    body: clientesOrdenados.map((cliente) => [
      cliente.id || "",
      `${cliente.tipoDocumento || "DNI"}: ${cliente.numeroDocumento || ""}`,
      `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim(),
      cliente.localidad || "",
      cliente.telefono || "",
      cliente.email || "",
    ]),
    startY: 28,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [254, 175, 0] },
  });
  doc.save("Listado_Clientes_Hardway.pdf");
};

// Dar de baja a un cliente (cambiar estaActivo a 0)
export const darDeBajaCliente = async (idCliente: number): Promise<void> => {
  const response = await fetch(`/api/clientes/${idCliente}/baja`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al dar de baja el cliente");
  }
};

// Dar de alta a un cliente (cambiar estaActivo a 1)
export const darDeAltaCliente = async (idCliente: number): Promise<void> => {
  const response = await fetch(`/api/clientes/${idCliente}/alta`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al dar de alta el cliente");
  }
};
