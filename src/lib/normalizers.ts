const MONTHS: Record<string, string> = {
  'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
  'jul': '07', 'ago': '08', 'sep': '09', 'sept': '09', 'oct': '10', 'nov': '11', 'dic': '12'
};

export const parseSpanishDate = (dateStr: string | any): string | null => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr.toISOString().split('T')[0];
  
  const str = String(dateStr).toLowerCase().trim();
  
  // Format: "abr 27, 2026"
  const match = str.match(/([a-z]+)\s+(\d+),\s+(\d{4})/);
  if (match) {
    const month = MONTHS[match[1]];
    if (month) {
      const day = match[2].padStart(2, '0');
      const year = match[3];
      return `${year}-${month}-${day}`;
    }
  }

  // ISO format or simple YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.split('T')[0];
  }

  return null;
};

export const normalizeDocumentType = (type: string): 'NIF' | 'NIE' | 'PAS' | 'OTRO' => {
  const t = type.toUpperCase().trim();
  if (t === 'DNI' || t === 'NIF') return 'NIF';
  if (t === 'NIE') return 'NIE';
  if (t === 'PASAPORTE' || t === 'PAS') return 'PAS';
  return 'OTRO';
};

export const normalizeNationality = (nat: string): string => {
  const n = nat.toUpperCase().trim();
  if (n === 'ESPAÑA' || n === 'SPAIN' || n === 'ES' || n === 'ESP') return 'ESP';
  return n;
};

export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  // Remove everything except digits and +
  return String(phone).replace(/[^\d+]/g, '');
};

export const extractPostalCode = (address: string): string | undefined => {
  if (!address) return undefined;
  const match = address.match(/\b\d{5}\b/);
  return match ? match[0] : undefined;
};
