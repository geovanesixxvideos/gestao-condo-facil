type Row = Record<string, string | number | null | undefined>;

function escapeCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

/** Exporta linhas para um arquivo CSV compatível com Excel (pt-BR). */
export function exportToCsv(filename: string, rows: Row[]) {
  if (rows.length === 0) return false;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(escapeCell).join(";"),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(";")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export const formatDateBR = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("pt-BR") : "";
