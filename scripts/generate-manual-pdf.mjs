/**
 * Usage:
 *   node scripts/generate-manual-pdf.mjs [--lang es|en|de]
 *
 * Defaults to --lang es when no argument is provided.
 *
 * Outputs:
 *   public/manuals/anclora-syncxml-manual-usuario-es.pdf
 *   public/manuals/anclora-syncxml-user-manual-en.pdf
 *   public/manuals/anclora-syncxml-benutzerhandbuch-de.pdf
 *
 * Requires: Chrome/Chromium + poppler (pdfinfo, pdftotext) + pdf-lib.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// ─── CLI argument ──────────────────────────────────────────────────────────────
const langArg = process.argv.find((a) => a.startsWith('--lang='))?.split('=')[1]
  ?? process.argv[process.argv.indexOf('--lang') + 1]
  ?? 'es';

const SUPPORTED_LANGS = ['es', 'en', 'de'];
if (!SUPPORTED_LANGS.includes(langArg)) {
  throw new Error(`Unsupported language "${langArg}". Supported: ${SUPPORTED_LANGS.join(', ')}`);
}

// ─── Language configuration ────────────────────────────────────────────────────
const LANG_CONFIG = {
  es: {
    inputFile: 'manual-usuario.md',
    outputFile: 'anclora-syncxml-manual-usuario-es.pdf',
    htmlLang: 'es',
    tocHeading: '## Indice',
    kicker: 'Manual de Usuario',
    tocH1: 'Índice',
    tocIntro: 'Una guía ordenada para transformar un Excel de reserva en XML validado y listo para el flujo operativo de SES.HOSPEDAJES.',
  },
  en: {
    inputFile: 'manual-usuario.en.md',
    outputFile: 'anclora-syncxml-user-manual-en.pdf',
    htmlLang: 'en',
    tocHeading: '## Table of contents',
    kicker: 'User Manual',
    tocH1: 'Table of contents',
    tocIntro: 'An ordered guide to transform a booking Excel into validated XML ready for the SES.HOSPEDAJES operational workflow.',
  },
  de: {
    inputFile: 'manual-usuario.de.md',
    outputFile: 'anclora-syncxml-benutzerhandbuch-de.pdf',
    htmlLang: 'de',
    tocHeading: '## Inhaltsverzeichnis',
    kicker: 'Benutzerhandbuch',
    tocH1: 'Inhaltsverzeichnis',
    tocIntro: 'Ein geordneter Leitfaden, um eine Buchungs-Excel in validiertes XML für den SES.HOSPEDAJES-Betriebsablauf umzuwandeln.',
  },
};

const config = LANG_CONFIG[langArg];

// ─── Paths ─────────────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const manualDir = path.join(root, 'docs', 'manual');
const manualsOutDir = path.join(root, 'public', 'manuals');
const inputPath = path.join(manualDir, config.inputFile);
const outputPath = path.join(manualsOutDir, config.outputFile);
const tmpDir = path.join(root, 'tmp', 'manual-pdf');
const htmlPath = path.join(tmpDir, `manual-${langArg}.html`);
const passPdfPath = path.join(tmpDir, `manual-${langArg}-pass.pdf`);

// ─── Chrome detection ──────────────────────────────────────────────────────────
const chrome = [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((candidate) => existsSync(candidate));

if (!chrome) {
  throw new Error('No Chrome/Chromium binary found for PDF rendering.');
}

if (!existsSync(inputPath)) {
  throw new Error(`Input file not found: ${inputPath}`);
}

mkdirSync(tmpDir, { recursive: true });
mkdirSync(manualsOutDir, { recursive: true });

const source = readFileSync(inputPath, 'utf8');
const sections = extractSections(source);

await renderPdf();
const firstPassPages = extractSectionPages(sections);
await renderPdf(firstPassPages);
await stampPageNumbers(passPdfPath, outputPath);

console.log(`Manual generated [${langArg.toUpperCase()}]: ${path.relative(root, outputPath)}`);

// ─── Section extraction ────────────────────────────────────────────────────────
function extractSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const coverEnd = lines.findIndex((line) => line.trim() === '<div class="page-break"></div>');
  if (coverEnd === -1) throw new Error('Cover page break not found.');

  const cover = lines.slice(0, coverEnd).join('\n');
  const afterCover = lines.slice(coverEnd + 1);
  const tocIndex = afterCover.findIndex((line) => line.trim() === config.tocHeading);
  if (tocIndex === -1) throw new Error(`ToC heading not found: "${config.tocHeading}"`);

  const afterToc = afterCover.slice(tocIndex + 1);
  const contentStart = afterToc.findIndex((line) => line.trim() === '<div class="page-break"></div>');
  if (contentStart === -1) throw new Error('Content page break after ToC not found.');

  const contentLines = afterToc.slice(contentStart + 1);
  const result = [];
  let current = null;

  for (const line of contentLines) {
    const match = line.match(/^##\s+(\d+)\.\s+(.+)$/);
    if (match) {
      if (current) result.push(current);
      current = {
        number: match[1],
        title: match[2].trim(),
        heading: line,
        lines: [],
      };
      continue;
    }
    if (current) current.lines.push(line);
  }
  if (current) result.push(current);

  return { cover, sections: result };
}

// ─── PDF rendering ─────────────────────────────────────────────────────────────
async function renderPdf(sectionPages = {}) {
  writeFileSync(htmlPath, buildHtml(sectionPages), 'utf8');
  execFileSync(chrome, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--print-to-pdf-no-header',
    '--no-pdf-header-footer',
    `--print-to-pdf=${passPdfPath}`,
    `file://${htmlPath}`,
  ], { stdio: 'pipe' });
}

function extractSectionPages(manual) {
  const info = execFileSync('pdfinfo', [passPdfPath], { encoding: 'utf8' });
  const pages = Number(info.match(/Pages:\s+(\d+)/)?.[1] ?? 0);
  const map = {};

  for (let page = 1; page <= pages; page += 1) {
    const pageText = execFileSync('pdftotext', ['-f', String(page), '-l', String(page), passPdfPath, '-'], { encoding: 'utf8' })
      .replace(/\s+/g, ' ');
    for (const section of manual.sections) {
      const marker = `${section.number}. ${section.title}`;
      if (!map[section.number] && pageText.includes(marker)) {
        map[section.number] = page;
      }
    }
  }

  return map;
}

// ─── Page number stamping ──────────────────────────────────────────────────────
async function stampPageNumbers(input, output) {
  const bytes = readFileSync(input);
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();
  const navy = rgb(0.02, 0.09, 0.16);

  pages.forEach((page, index) => {
    if (index === 0) return;
    const { width } = page.getSize();
    const label = `${index + 1}`;
    page.drawText('Anclora SyncXML', {
      x: 54,
      y: 20,
      size: 7.5,
      font: bold,
      color: navy,
      opacity: 0.78,
    });
    page.drawText(label, {
      x: width - 54 - font.widthOfTextAtSize(label, 8),
      y: 20,
      size: 8,
      font,
      color: navy,
      opacity: 0.78,
    });
  });

  writeFileSync(output, await pdf.save());
}

// ─── HTML builder ──────────────────────────────────────────────────────────────
function buildHtml(sectionPages) {
  const toc = sections.sections.map((section) => {
    const page = sectionPages[section.number] ?? '';
    return `<a class="toc-row" href="#section-${section.number}">
      <span class="toc-num">${section.number.padStart(2, '0')}</span>
      <span class="toc-title">${escapeHtml(section.title)}</span>
      <span class="toc-rule"></span>
      <span class="toc-pageno">${page}</span>
    </a>`;
  }).join('\n');

  const body = sections.sections.map((section) => `
    <section id="section-${section.number}" class="manual-section">
      <h2>${section.number}. ${escapeHtml(section.title)}</h2>
      ${markdownToHtml(section.lines.join('\n'))}
    </section>
  `).join('\n');

  const cover = injectCoverVisual(sections.cover);

  return `<!doctype html>
<html lang="${config.htmlLang}">
<head>
<meta charset="utf-8" />
<base href="file://${manualDir}/" />
<title>Anclora SyncXML - ${escapeHtml(config.tocH1)}</title>
<style>
${styles()}
</style>
</head>
<body>
${cover}
<section class="toc-page">
  <p class="kicker">${escapeHtml(config.kicker)}</p>
  <h1>${escapeHtml(config.tocH1)}</h1>
  <p class="toc-intro">${escapeHtml(config.tocIntro)}</p>
  <nav class="toc-list">${toc}</nav>
</section>
${body}
</body>
</html>`;
}

// ─── Cover visual injection ────────────────────────────────────────────────────
function injectCoverVisual(coverHtml) {
  const xmlLines = [
    { indent: 0, tag: '&lt;solicitud&gt;', color: '#c7a451' },
    { indent: 1, tag: '&lt;establecimiento&gt;', color: '#9ecfed' },
    { indent: 2, tag: '&lt;codigo&gt;12345&lt;/codigo&gt;', color: '#b8d9a7' },
    { indent: 1, tag: '&lt;/establecimiento&gt;', color: '#9ecfed' },
    { indent: 1, tag: '&lt;contrato&gt;', color: '#9ecfed' },
    { indent: 2, tag: '&lt;referencia&gt;ABC-001&lt;/referencia&gt;', color: '#b8d9a7' },
    { indent: 2, tag: '&lt;fechaEntrada&gt;2024-06-01&lt;/fechaEntrada&gt;', color: '#b8d9a7' },
    { indent: 1, tag: '&lt;/contrato&gt;', color: '#9ecfed' },
    { indent: 1, tag: '&lt;personas&gt; ···· &lt;/personas&gt;', color: '#9ecfed' },
    { indent: 0, tag: '&lt;/solicitud&gt;', color: '#c7a451' },
  ].map(({ indent, tag, color }) =>
    `<div class="xml-line"><span class="xml-indent" style="width:${indent * 5}mm;"></span><span class="xml-tag" style="color:${color};">${tag}</span></div>`
  ).join('');

  const xmlWidget = `
<div class="cover-xml" aria-hidden="true">
  <div class="xml-card">
    <div class="xml-head">SES · altaParteHospedaje v3</div>
    <div class="xml-body">${xmlLines}</div>
  </div>
</div>`;

  return coverHtml.replace('<div class="cover-disclaimer">', `${xmlWidget}\n<div class="cover-disclaimer">`);
}

// ─── Markdown to HTML ──────────────────────────────────────────────────────────
function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  let html = '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed === '---' || trimmed === '<div class="page-break"></div>') {
      i += 1;
      continue;
    }

    if (trimmed.startsWith('<div class="footer-brand">')) {
      while (i < lines.length) {
        if (lines[i].trim() === '</div>') break;
        i += 1;
      }
      i += 1;
      continue;
    }

    const image = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (image) {
      const src = image[2];
      const alt = image[1];
      const isDark = /dark/i.test(src) || /dark/i.test(alt);
      const isLight = /light/i.test(src) || /light/i.test(alt);
      const isMobile = /mobile/i.test(src) || /mobile/i.test(alt);
      const cls = [isDark ? 'img-dark' : isLight ? 'img-light' : '', isMobile ? 'img-mobile' : ''].filter(Boolean).join(' ');
      html += `<figure${cls ? ` class="${cls}"` : ''}><img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" /><figcaption>${escapeHtml(alt)}</figcaption></figure>`;
      i += 1;
      continue;
    }

    if (/^###\s+/.test(trimmed)) {
      const h3Html = `<h3>${inline(trimmed.replace(/^###\s+/, ''))}</h3>`;
      i += 1;
      let j = i;
      while (j < lines.length && !lines[j].trim()) j++;
      const nextTrimmed = lines[j]?.trim() ?? '';
      const nextImage = nextTrimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (nextImage) {
        const src = nextImage[2];
        const alt = nextImage[1];
        const isDark = /dark/i.test(src) || /dark/i.test(alt);
        const isLight = /light/i.test(src) || /light/i.test(alt);
        const isMobile = /mobile/i.test(src) || /mobile/i.test(alt);
        const cls = [isDark ? 'img-dark' : isLight ? 'img-light' : '', isMobile ? 'img-mobile' : ''].filter(Boolean).join(' ');
        html += `<div class="heading-figure">${h3Html}<figure${cls ? ` class="${cls}"` : ''}><img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" /><figcaption>${escapeHtml(alt)}</figcaption></figure></div>`;
        i = j + 1;
      } else {
        html += h3Html;
      }
      continue;
    }

    if (/^>\s+/.test(trimmed)) {
      const quote = [];
      while (i < lines.length && /^>\s+/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s+/, ''));
        i += 1;
      }
      html += `<blockquote>${quote.map(inline).join('<br>')}</blockquote>`;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^[-*]\s+/, ''))}</li>`);
        i += 1;
      }
      html += `<ul>${items.join('')}</ul>`;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^\d+\.\s+/, ''))}</li>`);
        i += 1;
      }
      html += `<ol>${items.join('')}</ol>`;
      continue;
    }

    if (trimmed.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      html += tableToHtml(tableLines);
      continue;
    }

    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i].trim())) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    html += `<p>${inline(paragraph.join(' '))}</p>`;
  }

  return html;
}

function isBlockStart(line) {
  return /^###\s+/.test(line)
    || /^!\[/.test(line)
    || /^[-*]\s+/.test(line)
    || /^\d+\.\s+/.test(line)
    || /^>\s+/.test(line)
    || line.startsWith('|')
    || line === '---'
    || line === '<div class="page-break"></div>'
    || line.startsWith('<div class="footer-brand">');
}

function tableToHtml(lines) {
  const rows = lines
    .filter((line) => !/^\|\s*-+/.test(line))
    .map((line) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()));
  if (rows.length === 0) return '';
  const [head, ...body] = rows;
  return `<table><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function inline(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

// ─── Styles ────────────────────────────────────────────────────────────────────
function styles() {
  return `
@page { size: A4; margin: 24mm 18mm 27mm; }
@page cover { size: A4; margin: 0; }
* { box-sizing: border-box; }
body {
  margin: 0;
  color: #071726;
  background: #fff;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 10.3pt;
  line-height: 1.48;
}
a { color: inherit; text-decoration: none; }

/* ─── PORTADA ─────────────────────────────────────────────────────────────── */
.cover-page {
  page: cover;
  width: 210mm;
  height: 297mm;
  margin: 0;
  padding: 28mm 30mm 26mm;
  color: #f7f2e7;
  background:
    radial-gradient(ellipse 90% 60% at 50% 36%, rgba(8, 52, 84, 0.60) 0%, transparent 68%),
    repeating-linear-gradient(112deg, rgba(216, 184, 107, 0.058) 0, rgba(216, 184, 107, 0.058) 1px, transparent 1px, transparent 13px),
    repeating-linear-gradient(22deg, rgba(255, 255, 255, 0.028) 0, rgba(255, 255, 255, 0.028) 1px, transparent 1px, transparent 19px),
    linear-gradient(148deg, #020e18 0%, #07202f 45%, #0d2c2e 100%);
  page-break-after: always;
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
  inset: 14mm 14mm;
  border: 1px solid rgba(212, 178, 95, 0.62);
  border-radius: 1.5mm;
  pointer-events: none;
  z-index: 1;
}
.cover-page::after {
  content: "";
  position: absolute;
  right: -22mm;
  bottom: -28mm;
  width: 115mm;
  height: 115mm;
  border: 1px solid rgba(158, 207, 237, 0.18);
  border-radius: 50%;
  z-index: 0;
}
.cover-logo,
.cover-brand,
.cover-title,
.cover-subtitle,
.cover-meta,
.cover-xml,
.cover-disclaimer {
  position: relative;
  z-index: 2;
}
.cover-logo {
  display: flex;
  justify-content: center;
}
.cover-logo img {
  width: 50mm;
  height: auto;
  margin-bottom: 12mm;
  filter:
    drop-shadow(0 4mm 14mm rgba(199, 164, 81, 0.28))
    drop-shadow(0 6mm 14mm rgba(0, 0, 0, 0.50));
}
.cover-brand {
  color: #d8b86b;
  font-size: 12.5pt;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.cover-brand::after {
  content: "";
  display: block;
  width: 42mm;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(216, 184, 107, 0.70), transparent);
  margin: 4.5mm auto 0;
}
.cover-title {
  margin: 4mm auto 0;
  max-width: 148mm;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 46pt;
  line-height: 0.97;
  font-weight: 600;
  text-shadow: 0 3mm 10mm rgba(0, 0, 0, 0.35);
}
.cover-subtitle {
  margin: 7mm auto 0;
  max-width: 128mm;
  color: rgba(220, 235, 240, 0.84);
  font-size: 15pt;
  line-height: 1.32;
}
.cover-meta {
  display: flex;
  justify-content: center;
  gap: 7mm;
  margin-top: 14mm;
  color: #071726;
  font-size: 9.5pt;
  font-weight: 700;
}
.cover-meta div {
  min-width: 43mm;
  padding: 3mm 6mm;
  background: linear-gradient(135deg, #e0c472, #c7a451);
  border-radius: 999px;
  box-shadow: 0 2mm 8mm rgba(0, 0, 0, 0.32);
  letter-spacing: 0.03em;
}
.cover-xml {
  margin: 9mm auto 0;
  width: 82mm;
  padding: 5mm 6mm;
  border-radius: 3mm;
  background: rgba(4, 13, 22, 0.68);
  border: 1px solid rgba(216, 184, 107, 0.28);
  box-shadow: 0 6mm 22mm rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  opacity: 0.88;
}
.xml-card { width: 100%; text-align: left; }
.xml-head {
  margin: 0 0 3.5mm;
  color: rgba(244, 232, 200, 0.70);
  font-family: "Courier New", Courier, monospace;
  font-size: 6.8pt;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
}
.xml-body { display: flex; flex-direction: column; gap: 1.1mm; }
.xml-line {
  display: flex;
  align-items: baseline;
  gap: 0;
}
.xml-indent { display: inline-block; flex-shrink: 0; }
.xml-tag {
  font-family: "Courier New", Courier, monospace;
  font-size: 7.2pt;
  line-height: 1.35;
  white-space: nowrap;
}
.cover-disclaimer {
  position: absolute;
  left: 28mm;
  right: 28mm;
  bottom: 26mm;
  color: rgba(191, 204, 209, 0.75);
  font-size: 8.2pt;
  text-align: center;
  line-height: 1.4;
}

/* ─── ÍNDICE ──────────────────────────────────────────────────────────────── */
.toc-page {
  page: auto;
  page-break-after: always;
  min-height: auto;
  padding: 0;
}
.kicker {
  color: #9a7a31;
  font-size: 8pt;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.toc-page h1 {
  margin: 0 0 5mm;
  color: #071726;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 34pt;
  font-weight: 600;
}
.toc-intro {
  width: 126mm;
  margin-bottom: 12mm;
  color: #4c5f6b;
  font-size: 10.4pt;
}
.toc-list { border-top: 1px solid #c7a451; }
.toc-row {
  display: grid;
  grid-template-columns: 13mm auto 1fr 12mm;
  align-items: baseline;
  gap: 3mm;
  min-height: 11.7mm;
  padding: 3.3mm 0;
  border-bottom: 1px solid #e4ddd1;
  color: #071726;
}
.toc-num {
  color: #9a7a31;
  font-size: 8pt;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.toc-title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 12.8pt;
}
.toc-rule {
  border-bottom: 1px dotted #b8c0c5;
  transform: translateY(-1.5mm);
}
.toc-pageno {
  color: #071726;
  font-weight: 800;
  text-align: right;
}

/* ─── SECCIONES ───────────────────────────────────────────────────────────── */
.manual-section {
  page: auto;
  page-break-before: always;
  min-height: auto;
  padding: 0;
}
.manual-section h2 {
  margin: 0 0 8mm;
  padding: 0 0 4mm;
  color: #071726;
  border-bottom: 1px solid #c7a451;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 25pt;
  line-height: 1.08;
  font-weight: 600;
}
h3 {
  margin: 7mm 0 3mm;
  color: #0a3854;
  font-size: 13.5pt;
  line-height: 1.2;
}
p { margin: 0 0 3.6mm; }
strong { color: #071726; font-weight: 800; }
ul, ol { margin: 1mm 0 4mm 6mm; padding-left: 4mm; }
li { margin: 1.4mm 0; }
table {
  width: 100%;
  margin: 4mm 0 6mm;
  border-collapse: collapse;
  page-break-inside: avoid;
  font-size: 9pt;
}
th {
  color: #071726;
  background: #f3ead8;
  border-top: 1px solid #c7a451;
  border-bottom: 1px solid #c7a451;
  font-weight: 800;
}
td, th {
  padding: 2.6mm 3mm;
  border-bottom: 1px solid #dfe5e8;
  vertical-align: top;
}
td:first-child, th:first-child { border-left: 1px solid #e7ecef; }
td:last-child, th:last-child { border-right: 1px solid #e7ecef; }
blockquote {
  margin: 5mm 0;
  padding: 4mm 5mm;
  color: #263b49;
  background: #f7f4ee;
  border-left: 2mm solid #c7a451;
  page-break-inside: avoid;
}

/* ─── IMÁGENES ────────────────────────────────────────────────────────────── */
.heading-figure {
  page-break-inside: avoid;
}
.heading-figure h3 {
  margin-top: 0;
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
  border: 1.5px solid #cfd9e0;
  box-shadow: 0 3mm 10mm rgba(0, 0, 0, 0.11), 0 1mm 3mm rgba(0, 0, 0, 0.07);
}
figure.img-dark img {
  border-color: rgba(199, 164, 81, 0.52);
  box-shadow: 0 4mm 16mm rgba(0, 0, 0, 0.38), 0 1mm 4mm rgba(0, 0, 0, 0.22);
}
figure.img-light img {
  border-color: rgba(199, 164, 81, 0.62);
  box-shadow: 0 3mm 12mm rgba(0, 0, 0, 0.13), 0 1mm 4mm rgba(0, 0, 0, 0.08);
}
figure.img-mobile {
  display: flex;
  justify-content: center;
}
figure.img-mobile img {
  width: 52%;
}
figcaption {
  margin-top: 1.8mm;
  padding: 0 1mm;
  color: #60727c;
  font-size: 8pt;
  line-height: 1.35;
}

/* ─── PIE ─────────────────────────────────────────────────────────────────── */
.footer-brand {
  margin-top: 14mm;
  padding-top: 5mm;
  border-top: 1px solid #c7a451;
  color: #51646f;
  text-align: center;
}
`;
}
