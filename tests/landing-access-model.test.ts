import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { dictionaries } from "@/lib/i18n";

const root = fileURLToPath(new URL("..", import.meta.url));
const landingDir = `${root}/src/components/landing`;

function landingSource(): string {
  return readdirSync(landingDir)
    .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))
    .map((file) => readFileSync(`${landingDir}/${file}`, "utf8"))
    .join("\n");
}

const PROHIBITED_CLAIMS = [
  "cumplimiento garantizado",
  "evita sanciones",
  "integración oficial con SES",
  "envío automático al ministerio",
  "xml aceptado por SES",
  "xml oficial",
  "listo para producción",
  "sustituye tu PMS",
  "sustituye tu gestoría",
  "solución legal completa",
  "sube tus datos reales",
];

describe("landing access model v0.2", () => {
  const source = landingSource();
  const lower = source.toLowerCase();

  it("aligns /login copy with the controlled pilot auth contract", () => {
    const authCard = readFileSync(`${root}/src/components/auth/AncloraAuthCard.tsx`, "utf8");
    const loginContractSource = `${source}\n${authCard}`;
    expect(loginContractSource).toContain("Anclora SyncXML");
    expect(loginContractSource).toContain("Clave de acceso al piloto");
    expect(loginContractSource).toContain("Solicitar piloto controlado");
    expect(loginContractSource).toContain("No subas datos reales de huéspedes");
    expect(loginContractSource).toContain("/terms");
    expect(loginContractSource).toContain("/privacy");
  });

  it("does not expose Dashboard in the public landing", () => {
    expect(lower).not.toContain("dashboard");
  });

  it("uses 'Solicitar piloto controlado' as primary CTA", () => {
    expect(source).toContain("Solicitar piloto controlado");
  });

  it("offers 'Ver cómo funciona' and 'Iniciar sesión'", () => {
    expect(source).toContain("Ver cómo funciona");
    expect(source).toContain("Iniciar sesión");
  });

  it("does not use 'Abrir app' / 'Abrir aplicación' as a landing CTA", () => {
    expect(source).not.toContain("Abrir app");
    expect(source).not.toContain("Abrir aplicación");
  });

  it("contains no prohibited marketing claims", () => {
    for (const claim of PROHIBITED_CLAIMS) {
      // Allow prudent negations such as "no evita sanciones".
      const negated = new RegExp(`no\\s+${claim}`, "i");
      const bare = new RegExp(claim, "i");
      if (bare.test(source)) {
        expect(negated.test(source)).toBe(true);
      }
    }
  });
});

describe("validation-controlled copy", () => {
  it("ships reviewable-XML and validation banner copy in every locale", () => {
    for (const [locale, dict] of Object.entries(dictionaries)) {
      const d = dict as Record<string, string>;
      expect(d.validationBanner, `validationBanner missing for ${locale}`).toBeTruthy();
      expect(d.xmlReviewableNotice, `xmlReviewableNotice missing for ${locale}`).toBeTruthy();
      expect(d.downloadXml, `downloadXml missing for ${locale}`).toBeTruthy();
    }
  });

  it("does not label XML as official or SES-accepted in app copy", () => {
    const workflow = readFileSync(`${root}/src/components/SyncXmlWorkflow.tsx`, "utf8").toLowerCase();
    expect(workflow).not.toContain("xml oficial");
    expect(workflow).not.toContain("aceptado por ses");
  });
});

describe("app routing guards", () => {
  it("keeps /app and /dashboard behind AuthGate via AppShell", () => {
    const shell = readFileSync(`${root}/src/components/AppShell.tsx`, "utf8");
    // Landing and login render without the app shell; everything else (incl.
    // /app and /dashboard) goes through AuthGate.
    expect(shell).toContain("AuthGate");
    expect(shell).toContain('pathname === "/login"');
    expect(shell).toMatch(/isLandingPage \|\| isLoginPage/);
  });

  it("uses the contractual shared-key card in AuthGate", () => {
    const gate = readFileSync(`${root}/src/components/AuthGate.tsx`, "utf8");
    expect(gate).toContain("AncloraAuthCard");
    expect(gate).toContain("Clave de acceso al piloto");
    expect(gate).toContain("Entrar a la aplicación");
    expect(gate).toContain("Solicitar piloto controlado");
    expect(gate).not.toContain("Abrir app");
  });

  it("keeps logout limited to clearing the SyncXML session cookie", () => {
    const logout = readFileSync(`${root}/src/app/api/auth/logout/route.ts`, "utf8");
    expect(logout).toContain("clearSessionCookie");
    expect(logout).toContain("{ ok: true }");
  });

  it("sends pilot requests through the server-side Resend route, not mailto", () => {
    const pilotForm = readFileSync(`${root}/src/components/landing/PilotRequestForm.tsx`, "utf8");
    const pilotRoute = readFileSync(`${root}/src/app/api/pilot/request/route.ts`, "utf8");
    expect(pilotForm).toContain('fetch("/api/pilot/request"');
    expect(pilotForm).not.toContain("window.location.href = buildMailto");
    expect(pilotRoute).toContain("new Resend");
    expect(pilotRoute).toContain("RESEND_API_KEY");
    expect(pilotRoute).toContain("SYNCXML_PILOT_REQUEST_TO");
  });
});
