import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LANGS = {
  es: {
    input: "manual-usuario.md",
    output: "anclora-syncxml-manual-usuario-es.pdf",
    htmlOutput: "anclora-syncxml-manual-usuario-es.html",
    title: "Anclora SyncXML - Manual de Usuario",
    lang: "es",
  },
  en: {
    input: "manual-usuario.en.md",
    output: "anclora-syncxml-user-manual-en.pdf",
    htmlOutput: "anclora-syncxml-user-manual-en.html",
    title: "Anclora SyncXML - User Manual",
    lang: "en",
  },
  de: {
    input: "manual-usuario.de.md",
    output: "anclora-syncxml-benutzerhandbuch-de.pdf",
    htmlOutput: "anclora-syncxml-benutzerhandbuch-de.html",
    title: "Anclora SyncXML - Benutzerhandbuch",
    lang: "de",
  },
};

const arg = process.argv.find((item) => item.startsWith("--lang="))?.split("=")[1] ?? "all";
const requested = arg === "all" ? Object.keys(LANGS) : [arg];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const manualDir = path.join(root, "docs", "manual");
const outputDir = path.join(root, "public", "manuals");
const chrome = [
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].find((candidate) => existsSync(candidate));

if (!chrome) throw new Error("No Chrome/Chromium binary found for PDF rendering.");
mkdirSync(outputDir, { recursive: true });

for (const lang of requested) {
  const config = LANGS[lang];
  if (!config) throw new Error(`Unsupported language: ${lang}`);

  const markdownPath = path.join(manualDir, config.input);
  const htmlPath = path.join(outputDir, config.htmlOutput);
  const pdfPath = path.join(outputDir, config.output);

  const markdown = readFileSync(markdownPath, "utf8");
  writeFileSync(htmlPath, buildHtml(markdown, config), "utf8");
  execFileSync(chrome, [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--print-to-pdf-no-header",
    "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`,
    `file://${htmlPath}`,
  ], { stdio: "pipe" });
  console.log(`Generated ${path.relative(root, pdfPath)}`);
  console.log(`Generated ${path.relative(root, htmlPath)}`);
}

function buildHtml(markdown, config) {
  return `<!doctype html>
<html lang="${config.lang}">
<head>
<meta charset="utf-8" />
<base href="file://${manualDir}/" />
<title>${escapeHtml(config.title)}</title>
<style>${styles()}</style>
</head>
<body>
${markdownToHtml(markdown)}
</body>
</html>`;
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  let html = "";
  let i = 0;
  let sectionOpen = false;
  let justRenderedCover = false;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed === "---") {
      i += 1;
      continue;
    }

    if (trimmed === '<div class="cover-page">') {
      const block = [];
      while (i < lines.length) {
        block.push(lines[i]);
        if (lines[i].trim() === "</div>" && block.some((item) => item.includes("cover-disclaimer"))) break;
        i += 1;
      }
      i += 1;
      html += block.join("\n");
      justRenderedCover = true;
      continue;
    }

    if (trimmed === '<div class="page-break"></div>') {
      if (justRenderedCover) {
        justRenderedCover = false;
        i += 1;
        continue;
      }
      html += '<div class="page-break"></div>';
      i += 1;
      continue;
    }

    justRenderedCover = false;

    if (trimmed.startsWith('<div class="footer-brand">')) {
      html += trimmed;
      i += 1;
      continue;
    }

    if (trimmed === '<nav class="toc-grid">') {
      const block = [];
      while (i < lines.length) {
        block.push(lines[i]);
        if (lines[i].trim() === "</nav>") break;
        i += 1;
      }
      i += 1;
      html += block.join("\n");
      continue;
    }

    const image = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (image) {
      const alt = image[1];
      const src = image[2];
      html += `<figure><img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" /><figcaption>${escapeHtml(alt)}</figcaption></figure>`;
      i += 1;
      continue;
    }

    if (/^##\s+/.test(trimmed)) {
      if (sectionOpen) html += "</section>";
      html += `<section class="manual-section"><h2>${inline(trimmed.replace(/^##\s+/, ""))}</h2>`;
      sectionOpen = true;
      i += 1;
      continue;
    }

    if (/^###\s+/.test(trimmed)) {
      html += `<h3>${inline(trimmed.replace(/^###\s+/, ""))}</h3>`;
      i += 1;
      continue;
    }

    if (/^>\s+/.test(trimmed)) {
      const quote = [];
      while (i < lines.length && /^>\s+/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s+/, ""));
        i += 1;
      }
      html += `<blockquote>${quote.map(inline).join("<br>")}</blockquote>`;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^[-*]\s+/, ""))}</li>`);
        i += 1;
      }
      html += `<ul>${items.join("")}</ul>`;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^\d+\.\s+/, ""))}</li>`);
        i += 1;
      }
      html += `<ol>${items.join("")}</ol>`;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].trim());
        i += 1;
      }
      html += tableToHtml(rows);
      continue;
    }

    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i].trim())) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    html += `<p>${inline(paragraph.join(" "))}</p>`;
  }

  if (sectionOpen) html += "</section>";
  return html;
}

function isBlockStart(line) {
  return /^##\s+/.test(line)
    || /^###\s+/.test(line)
    || /^!\[/.test(line)
    || /^[-*]\s+/.test(line)
    || /^\d+\.\s+/.test(line)
    || /^>\s+/.test(line)
    || line.startsWith("|")
    || line === "---"
    || line === '<div class="page-break"></div>'
    || line === '<nav class="toc-grid">'
    || line.startsWith('<div class="footer-brand">');
}

function tableToHtml(lines) {
  const rows = lines
    .filter((line) => !/^\|\s*:?-+/.test(line))
    .map((line) => line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
  if (!rows.length) return "";
  const [head, ...body] = rows;
  return `<table><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function inline(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function styles() {
  return `
@page { size: A4; margin: 20mm 16mm 21mm; }
@page cover { size: A4; margin: 0; }
* { box-sizing: border-box; }
body {
  margin: 0;
  color: #101828;
  background: #ffffff;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 10.2pt;
  line-height: 1.46;
}
a { color: inherit; }
code {
  padding: 0.6mm 1.2mm;
  border-radius: 1mm;
  color: #16324a;
  background: #f2eadb;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 8.8pt;
}
.cover-page {
  page: cover;
  width: 210mm;
  height: 297mm;
  padding: 27mm 29mm 25mm;
  color: #f7f3ea;
  background:
    radial-gradient(ellipse 90% 58% at 50% 33%, rgba(209, 174, 92, 0.18) 0%, transparent 62%),
    repeating-linear-gradient(112deg, rgba(214, 181, 97, 0.06) 0, rgba(214, 181, 97, 0.06) 1px, transparent 1px, transparent 13px),
    linear-gradient(148deg, #050810 0%, #0b1322 42%, #101a2b 100%);
  position: relative;
  overflow: hidden;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cover-page::before {
  content: "";
  position: absolute;
  inset: 14mm;
  border: 1px solid rgba(214, 181, 97, 0.62);
  border-radius: 2mm;
}
.cover-page::after {
  content: "";
  position: absolute;
  left: -26mm;
  bottom: -30mm;
  width: 115mm;
  height: 115mm;
  border: 1px solid rgba(214, 181, 97, 0.18);
  border-radius: 50%;
}
.cover-logo, .cover-brand, .cover-title, .cover-subtitle, .cover-meta, .cover-disclaimer { position: relative; z-index: 2; }
.cover-logo img {
  width: 43mm;
  height: auto;
  margin-bottom: 12mm;
  filter: drop-shadow(0 5mm 14mm rgba(214, 181, 97, 0.22)) drop-shadow(0 7mm 18mm rgba(0, 0, 0, 0.55));
}
.cover-brand {
  color: #d6b561;
  font-size: 12.2pt;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.cover-brand::after {
  content: "";
  display: block;
  width: 44mm;
  height: 1px;
  margin: 4.6mm auto 0;
  background: linear-gradient(90deg, transparent, rgba(214, 181, 97, 0.76), transparent);
}
.cover-title {
  margin: 7mm auto 0;
  max-width: 150mm;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 43pt;
  line-height: 1;
  font-weight: 600;
  text-shadow: 0 3mm 10mm rgba(0, 0, 0, 0.4);
}
.cover-subtitle {
  margin: 8mm auto 0;
  max-width: 126mm;
  color: rgba(227, 232, 240, 0.86);
  font-size: 14pt;
  line-height: 1.32;
}
.cover-meta {
  display: flex;
  justify-content: center;
  gap: 7mm;
  margin-top: 15mm;
  color: #111827;
  font-size: 9.3pt;
  font-weight: 800;
}
.cover-meta div {
  min-width: 43mm;
  padding: 3mm 6mm;
  border-radius: 999px;
  background: linear-gradient(135deg, #e2c779, #bb9340);
  box-shadow: 0 2mm 8mm rgba(0, 0, 0, 0.32);
}
.cover-disclaimer {
  position: absolute;
  left: 27mm;
  right: 27mm;
  bottom: 25mm;
  color: rgba(202, 211, 224, 0.78);
  font-size: 8.2pt;
  line-height: 1.4;
}
.page-break { page-break-after: always; }
.manual-section {
  page-break-before: always;
}
.manual-section:first-of-type {
  page-break-before: auto;
}
h2 {
  margin: 0 0 7mm;
  padding-bottom: 3.8mm;
  color: #101828;
  border-bottom: 1px solid #c7a451;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 24pt;
  line-height: 1.08;
  font-weight: 600;
}
h3 {
  margin: 7mm 0 3mm;
  color: #26364b;
  font-size: 13.2pt;
  line-height: 1.2;
}
p { margin: 0 0 3.5mm; }
strong { color: #101828; font-weight: 800; }
ul, ol { margin: 1mm 0 4mm 6mm; padding-left: 4mm; }
li { margin: 1.35mm 0; }
table {
  width: 100%;
  margin: 4mm 0 6mm;
  border-collapse: collapse;
  page-break-inside: avoid;
  font-size: 9pt;
}
th {
  color: #101828;
  background: #f2eadb;
  border-top: 1px solid #c7a451;
  border-bottom: 1px solid #c7a451;
  font-weight: 800;
}
td, th {
  padding: 2.5mm 2.8mm;
  border-bottom: 1px solid #dfe5eb;
  vertical-align: top;
}
td:first-child, th:first-child { border-left: 1px solid #e5eaf0; }
td:last-child, th:last-child { border-right: 1px solid #e5eaf0; }
blockquote {
  margin: 5mm 0;
  padding: 4mm 5mm;
  color: #253244;
  background: #f7f3ea;
  border-left: 2mm solid #c7a451;
  page-break-inside: avoid;
}
.toc-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3.5mm;
  margin: 2mm 0 8mm;
}
.toc-item {
  display: grid;
  grid-template-columns: 12mm 1fr;
  gap: 3mm;
  min-height: 21mm;
  padding: 4mm;
  border: 1px solid #d7dfeb;
  border-left: 1.6mm solid #c7a451;
  border-radius: 2mm;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  page-break-inside: avoid;
}
.toc-num {
  color: #9f7b2e;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 18pt;
  line-height: 1;
  font-weight: 700;
}
.toc-title {
  display: block;
  color: #101828;
  font-size: 10.4pt;
  line-height: 1.2;
  font-weight: 800;
}
.toc-note {
  display: block;
  margin-top: 1.2mm;
  color: #667085;
  font-size: 8.4pt;
  line-height: 1.35;
}
figure {
  margin: 5mm 0 7mm;
  page-break-inside: avoid;
}
figure img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 2mm;
  border: 1.5px solid rgba(199, 164, 81, 0.68);
  box-shadow: 0 3mm 13mm rgba(0, 0, 0, 0.18), 0 1mm 4mm rgba(0, 0, 0, 0.10);
}
figcaption {
  margin-top: 1.8mm;
  padding: 0 1mm;
  color: #667085;
  font-size: 8pt;
  line-height: 1.35;
}
.footer-brand {
  margin-top: 12mm;
  padding-top: 5mm;
  border-top: 1px solid #c7a451;
  color: #667085;
  text-align: center;
}
`;
}
