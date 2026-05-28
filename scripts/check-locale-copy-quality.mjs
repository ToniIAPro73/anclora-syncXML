import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const i18nFile = path.join(repoRoot, "src/lib/i18n.ts");

const literalisms = [
  { severity: "high", pattern: "Damos la bienvenida a tus preguntas" },
  { severity: "high", pattern: "siéntete libre de" },
  { severity: "high", pattern: "no dudes en contactarnos" },
  { severity: "high", pattern: "Wir begrüßen Ihre Fragen" },
  { severity: "high", pattern: "fühlen Sie sich frei" },
  { severity: "high", pattern: "zögern Sie nicht" },
  { severity: "medium", pattern: "feel free to" },
  { severity: "medium", pattern: "do not hesitate" },
];

const legalPatterns = ["privacy", "terms", "consent", "gdpr", "ses", "certificate", "disclaimer"];

const findings = [];
const legalFindings = [];

if (fs.existsSync(i18nFile)) {
  const lines = fs.readFileSync(i18nFile, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const rule of literalisms) {
      if (line.toLowerCase().includes(rule.pattern.toLowerCase())) {
        findings.push({ ...rule, file: "src/lib/i18n.ts", line: index + 1, text: line.trim() });
      }
    }
    for (const pat of legalPatterns) {
      if (line.toLowerCase().includes(pat) && line.includes(":")) {
        legalFindings.push({ pattern: pat, line: index + 1, text: line.trim().slice(0, 120) });
      }
    }
  });
}

const reportDir = path.join(repoRoot, "reports", "locale-copy");
fs.mkdirSync(reportDir, { recursive: true });

const report = [
  "# SyncXML Locale Copy Quality Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Literalism Checks",
  "",
  findings.length
    ? findings.map(f => `- ${f.severity.toUpperCase()} ${f.file}:${f.line} \`${f.pattern}\` — ${f.text}`).join("\n")
    : "No literalism risks detected.",
  "",
  "## Legal / Sensitive Keys (LEGAL_REVIEW_REQUIRED)",
  "",
  `${legalFindings.length} keys with legal-sensitive content detected. All translations of privacy, terms, SES and consent copy must be reviewed by legal counsel before production.`,
  "",
].join("\n");

fs.writeFileSync(path.join(reportDir, "copy-quality-report.md"), report);

if (findings.some(f => f.severity === "high")) {
  console.warn(`Quality check completed with ${findings.length} high-risk finding(s).`);
  process.exit(1);
} else {
  console.log("Locale copy quality check passed.");
}
