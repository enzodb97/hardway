export type TrackingLink = { label: string; url: string };

function normalizeEmpresa(input?: string): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

export function getTrackingUrl(empresa?: string): TrackingLink | null {
  const key = normalizeEmpresa(empresa);
  if (!key) return null;

  if (key.includes("correo")) {
    return { label: "Correo Argentino", url: "https://www.correoargentino.com.ar/formularios/e-commerce" };
  }

  if (key.includes("via") || key.includes("viacargo") || key.includes("via-cargo") || key.includes("via cargo")) {
    return { label: "Via Cargo", url: "https://alpha.viacargo.com.ar/tracking" };
  }

  if (key.includes("andreani")) {
    return { label: "Andreani", url: "https://www.andreani.com/?tab=seguir-envio" };
  }

  if (key.includes("oca")) {
    return { label: "OCA", url: "https://www.oca.com.ar/Busquedas/Envios" };
  }

  // Fallback: common carrier names mapping can be extended here
  return null;
}

export default getTrackingUrl;
