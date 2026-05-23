const SPANISH_POSTAL_CODE = /^\d{5}$/;

export function normalizeMunicipioName(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[()'`´]/g, " ")
    .replace(/[^a-z0-9/]+/g, " ")
    .replace(/\bdel\b/g, "de")
    .replace(/\bde el\b/g, "de")
    .replace(/\s+/g, " ")
    .trim();
}

export function municipioNameVariants(value?: string) {
  const normalized = normalizeMunicipioName(value);
  if (!normalized) return [];
  return normalized
    .split("/")
    .map((item) => normalizeMunicipioName(item))
    .filter(Boolean)
    .filter((item, index, all) => all.indexOf(item) === index);
}

export function provinceCodeFromPostalCode(postalCode?: string) {
  const cleaned = (postalCode ?? "").trim();
  if (!SPANISH_POSTAL_CODE.test(cleaned)) return null;
  const province = Number.parseInt(cleaned.slice(0, 2), 10);
  if (province < 1 || province > 52) return null;
  return cleaned.slice(0, 2);
}

export function isSpanishPostalCode(postalCode?: string) {
  return provinceCodeFromPostalCode(postalCode) !== null;
}
