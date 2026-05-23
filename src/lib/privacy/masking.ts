export function maskDocument(value?: string) {
  const clean = (value ?? "").trim();
  if (!clean) return "-";
  const visible = clean.slice(-5);
  return `${"*".repeat(Math.max(4, clean.length - visible.length))}${visible}`;
}

export function maskEmail(value?: string) {
  const clean = (value ?? "").trim();
  if (!clean) return "-";
  const [local, domain] = clean.split("@");
  if (!local || !domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}

export function maskPhone(value?: string) {
  const clean = (value ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return "-";
  const digits = clean.replace(/\D/g, "");
  return `*** *** ${digits.slice(-3) || "***"}`;
}

export function maskAddress(value?: string) {
  const clean = (value ?? "").trim();
  if (!clean) return "-";
  const parts = clean.split(/\s+/);
  return parts.length <= 2 ? "********" : `${parts.slice(0, 2).join(" ")} ...`;
}

export function maskPayment(value?: string) {
  if (!value) return "-";
  return "****";
}
