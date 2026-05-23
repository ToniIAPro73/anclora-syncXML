function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateParts(year: string | number, month: string | number, day: string | number) {
  return `${pad2(Number(day))}/${pad2(Number(month))}/${year}`;
}

export function formatDashboardDateTime(date?: string | Date | null, time?: string | null) {
  if (!date) return undefined;
  const cleanTime = time?.trim();
  const dateText = date instanceof Date ? date.toISOString() : String(date);
  const dateOnly = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    return cleanTime ? `${formatDateParts(dateOnly[1], dateOnly[2], dateOnly[3])} ${cleanTime}` : formatDateParts(dateOnly[1], dateOnly[2], dateOnly[3]);
  }

  const iso = dateText.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (iso) {
    const formatted = formatDateParts(iso[1], iso[2], iso[3]);
    const isoTime = `${iso[4]}:${iso[5]}:${iso[6]}`;
    if (cleanTime) return `${formatted} ${cleanTime}`;
    return isoTime === "00:00:00" ? formatted : `${formatted} ${isoTime}`;
  }

  return dateText;
}
