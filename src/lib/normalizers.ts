const MONTHS: Record<string, string> = {
  ene: "01",
  enero: "01",
  feb: "02",
  febrero: "02",
  mar: "03",
  marzo: "03",
  abr: "04",
  abril: "04",
  may: "05",
  mayo: "05",
  jun: "06",
  junio: "06",
  jul: "07",
  julio: "07",
  ago: "08",
  agosto: "08",
  sep: "09",
  sept: "09",
  septiembre: "09",
  oct: "10",
  octubre: "10",
  nov: "11",
  noviembre: "11",
  dic: "12",
  diciembre: "12",
};

export function cleanText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function parseDate(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  const raw = cleanText(value).toLowerCase();
  const monthName = raw.match(/^([a-záéíóúñ]+)\s+(\d{1,2}),\s*(\d{4})$/i);
  if (monthName) {
    const month = MONTHS[monthName[1]];
    if (month) return `${monthName[3]}-${month}-${monthName[2].padStart(2, "0")}`;
  }
  const dotted = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dotted) return `${dotted[3]}-${dotted[2].padStart(2, "0")}-${dotted[1].padStart(2, "0")}`;
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  return undefined;
}

export function normalizeTime(value: unknown): string | undefined {
  const raw = cleanText(value).replace(",", ".");
  if (!raw) return undefined;
  const match = raw.match(/^(\d{1,2})(?:[.:](\d{1,2}))?$/);
  if (!match) return undefined;
  return `${match[1].padStart(2, "0")}:${(match[2] ?? "00").padStart(2, "0")}:00`;
}

function madridOffset(date: string, time = "12:00:00") {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second] = time.split(":").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute, second || 0));
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Madrid",
    timeZoneName: "longOffset",
  }).formatToParts(probe);
  const offset = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+01:00";
  const match = offset.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!match) return "+01:00";
  return `${match[1]}${match[2].padStart(2, "0")}:${match[3] ?? "00"}`;
}

export function toXmlDateTime(date?: string, time?: string): string | undefined {
  if (!date) return undefined;
  const resolvedTime = time ?? "00:00:00";
  return `${date}T${resolvedTime}${madridOffset(date, resolvedTime)}`;
}

export function toXmlDate(date?: string): string | undefined {
  return date ? `${date}${madridOffset(date)}` : undefined;
}

export function normalizeDocumentType(value: unknown): "NIF" | "NIE" | "PAS" | "OTRO" | undefined {
  const raw = cleanText(value).toUpperCase();
  if (!raw) return undefined;
  if (raw === "DNI" || raw === "NIF") return "NIF";
  if (raw === "NIE") return "NIE";
  if (raw === "PASAPORTE" || raw === "PASSPORT" || raw === "PAS") return "PAS";
  return "OTRO";
}

export function normalizeNationality(value: unknown): string | undefined {
  const raw = cleanText(value).toUpperCase();
  if (!raw) return undefined;
  if (["ESPAÑA", "ESPANA", "SPAIN", "ES", "ESP"].includes(raw)) return "ESP";
  if (raw.length === 2) return raw === "DE" ? "DEU" : raw;
  return raw.slice(0, 3);
}

export function normalizePaymentType(value: unknown): string | undefined {
  const raw = cleanText(value).toUpperCase();
  if (!raw) return undefined;
  const numericCatalog: Record<string, string> = {
    "1": "DESTI",
    "2": "EFECT",
    "3": "TARJT",
    "4": "PLATF",
    "5": "TRANS",
    "6": "MOVIL",
    "7": "TREG",
    "8": "OTRO",
  };
  if (numericCatalog[raw]) return numericCatalog[raw];
  if (raw.includes("PLATAFORMA") || raw.includes("PLATFORM")) return "PLATF";
  if (raw.includes("EFECT")) return "EFECT";
  if (raw.includes("TARJ")) return "TARJT";
  if (raw.includes("TRANSFER")) return "TRANS";
  if (raw.includes("MOVIL") || raw.includes("MOBILE")) return "MOVIL";
  return raw;
}

export function normalizePhone(value: unknown): string | undefined {
  const raw = cleanText(value).replace(/[^\d+]/g, "");
  return raw || undefined;
}

export function extractPostalCode(value: unknown): string | undefined {
  return cleanText(value).match(/\b\d{5}\b/)?.[0];
}

export function extractResidencePostalCode(value: unknown, countryIso3?: string): string | undefined {
  const raw = cleanText(value).toUpperCase();
  if (!raw) return undefined;
  if (countryIso3 === "ESP") return extractPostalCode(raw);

  const segments = raw.split(",").map((segment) => segment.trim()).filter(Boolean).reverse();
  const patterns = [
    /\b\d{4}-\d{3}\b/,
    /\b\d{3}\s\d{2}\b/,
    /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/,
    /\b\d{4,6}\b/,
  ];

  for (const segment of segments) {
    for (const pattern of patterns) {
      const match = segment.match(pattern)?.[0];
      if (match) return match;
    }
  }
  return undefined;
}

export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "archivo";
  return base.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 120);
}
