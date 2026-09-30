// src/lib/exportCsv.js
// Utilidad para exportar arrays de objetos a CSV descargable

/**
 * Escapa una celda de CSV:
 * - Maneja null/undefined → ""
 * - Si contiene coma, comilla o salto de línea → envuelve en comillas dobles
 * - Duplica comillas internas (" → "")
 */
function escapeCell(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);

  // Si tiene caracteres especiales → envolver en comillas
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Descarga un CSV a partir de un array de filas.
 *
 * @param {string} filename - Nombre del archivo (ej: "nook-mensajes-2026-09-29.csv")
 * @param {Array} rows - Array de objetos
 * @param {Array<{label: string, getValue: (row:any)=>any}>} headers - Definición de columnas
 */
export function exportToCsv(filename, rows, headers) {
  if (!rows || rows.length === 0) {
    throw new Error("No hay datos para exportar");
  }

  // Fila de cabeceras
  const headerRow = headers.map((h) => escapeCell(h.label)).join(",");

  // Filas de datos
  const dataRows = rows.map((row) =>
    headers.map((h) => escapeCell(h.getValue(row))).join(","),
  );

  // BOM UTF-8 al inicio → Excel lo abre con acentos correctos (ñ, á, etc.)
  const csv = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");

  // Crear Blob y forzar descarga
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Genera un nombre de archivo con fecha: "nook-mensajes-2026-09-29.csv"
 */
export function buildFilename(prefix, extra = "") {
  const today = new Date().toISOString().slice(0, 10);
  const suffix = extra ? `-${extra}` : "";
  return `${prefix}-${today}${suffix}.csv`;
}
