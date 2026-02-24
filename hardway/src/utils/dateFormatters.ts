/**
 * Utilidades centralizadas para formateo de fechas y horas
 * Todas las funciones usan el locale "es-AR" y formato de 12 horas con AM/PM
 */

/**
 * Formatea una fecha con hora en formato completo
 * @param date - Fecha a formatear (Date, string o timestamp)
 * @returns String en formato: "24 de febrero de 2026, 02:30 PM"
 * @example formatFechaHoraCompleta(new Date()) // "24 de febrero de 2026, 02:30 PM"
 */
export const formatFechaHoraCompleta = (date: Date | string | number = new Date()): string => {
  const fecha = date instanceof Date ? date : new Date(date);
  
  return fecha.toLocaleString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Formatea una fecha con hora en formato corto/conciso
 * @param date - Fecha a formatear (Date, string o timestamp)
 * @returns String en formato: "24/2/2026 2:30 PM"
 * @example formatFechaHoraCorta(new Date()) // "24/2/2026 2:30 PM"
 */
export const formatFechaHoraCorta = (date: Date | string | number = new Date()): string => {
  const fecha = date instanceof Date ? date : new Date(date);
  
  return fecha.toLocaleString("es-AR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Formatea solo la fecha sin hora
 * @param date - Fecha a formatear (Date, string o timestamp)
 * @returns String en formato: "24/2/2026"
 * @example formatFechaSola(new Date()) // "24/2/2026"
 */
export const formatFechaSola = (date: Date | string | number = new Date()): string => {
  const fecha = date instanceof Date ? date : new Date(date);
  
  return fecha.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

/**
 * Formatea solo la hora con AM/PM
 * @param date - Fecha a formatear (Date, string o timestamp)
 * @returns String en formato: "2:30 PM"
 * @example formatHoraSola(new Date()) // "2:30 PM"
 */
export const formatHoraSola = (date: Date | string | number = new Date()): string => {
  const fecha = date instanceof Date ? date : new Date(date);
  
  return fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Formatea una fecha con hora para nombres de archivos (sin caracteres especiales)
 * @param date - Fecha a formatear (Date, string o timestamp)
 * @returns String en formato: "2026-02-24_14-30"
 * @example formatFechaArchivo(new Date()) // "2026-02-24_14-30"
 */
export const formatFechaArchivo = (date: Date | string | number = new Date()): string => {
  const fecha = date instanceof Date ? date : new Date(date);
  
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const hours = String(fecha.getHours()).padStart(2, '0');
  const minutes = String(fecha.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}`;
};
