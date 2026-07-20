<p align="center">
  <img src="public/brand/logo-anclora-syncxml-email.png" alt="Anclora SyncXML" width="112" />
</p>

<h1 align="center">Anclora SyncXML</h1>

<p align="center">
  Datenschutzorientiertes Werkzeug zum Pruefen von Reservierungstabellen und zum
  Vorbereiten von SES.HOSPEDAJES-XML in einem kontrollierten Piloten.
</p>

<p align="center">
  <a href="README.md">Español</a> ·
  <a href="README.en.md">English</a> ·
  <strong>Deutsch</strong>
</p>

<p align="center">
  <a href="#status">Status</a> ·
  <a href="#was-es-macht">Produkt</a> ·
  <a href="#kontrollen">Kontrollen</a> ·
  <a href="#handbuecher">Handbuecher</a> ·
  <a href="#schnellstart">Schnellstart</a> ·
  <a href="#qualitaetskontrollen">Qualitaet</a>
</p>

<p align="center">
  <img alt="Projektstatus" src="https://img.shields.io/badge/status-kontrollierter%20Pilot-orange" />
  <img alt="Lizenz" src="https://img.shields.io/badge/lizenz-MIT-yellow" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-blue" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-Vitest%20171%20passing-brightgreen" />
  <img alt="Datenschutz" src="https://img.shields.io/badge/datenschutz-minimierung%20zuerst-brightgreen" />
</p>

---

## Status

Anclora SyncXML ist ein Open-Source-Projekt unter der MIT-Lizenz. Das Repository
ist oeffentlich, damit Produkt, Datenschutzmodell und betriebliche Kontrollen
geprueft und verbessert werden koennen.

Das Produkt befindet sich derzeit in **Pre-MVP / kontrollierter Validierung**.
Es muss vorsichtig beschrieben werden:

- Keine Rechtsberatung.
- Keine Garantie fuer regulatorische Compliance.
- Kein automatisches SES.HOSPEDAJES-Produktionssystem.
- Kein Ort fuer echte Gaestedaten ohne freigegebene Sicherheits-, Aufbewahrungs-
  und Zugriffskontrollen.

## Was Es Macht

SyncXML hilft Betreibern, Reservierungstabellen in einen pruefbaren XML-Workflow
zu ueberfuehren und dabei die Exposition sensibler Daten gering zu halten.

| Faehigkeit | Aktuelles Verhalten |
| --- | --- |
| Tabellenimport | Liest `.xlsx`-Buchungsdateien mit defensivem Parsing ueber ExcelJS. |
| Intelligente Validierung | Erkennt fehlende oder riskante Felder zu Buchung, Reisenden, Adresse, Dokument und Zahlung. |
| Gefuehrte Pruefung | Erlaubt Korrekturen blockierender Probleme vor der XML-Erzeugung. |
| XML-Vorbereitung | Erzeugt visuelle und technische XML-Ansichten vor dem Download. |
| SES-Unterstuetzung | Unterstuetzt lokale Validierung und kontrollierte Vorproduktionsaktionen, wenn konfiguriert. |
| Reservierungshistorie | Optionale Persistenz mit benutzergebundenem Reservierungszugriff. |
| Pilotzugang | E-Mail/Passwort fuer freigegebene Nutzer, temporaere Passwortaenderung und Admin-Provisionierung. |
| Feedback-Schleife | Pilotfeedback in der App, ohne Gaestedaten anzufordern. |

## Kontrollen

Die Anwendung basiert auf betrieblichen Schutzplanken, nicht auf breiten
Versprechen.

| Kontrolle | Zweck |
| --- | --- |
| Kontrollierter Zugang | `/app` und `/dashboard` verlangen eine freigegebene Sitzung, ausser im lokalen Demo-Modus. |
| Rollenpruefungen | SES-Sendeaktionen sind durch Rolle und Umgebungskonfiguration begrenzt. |
| Fail-closed Auth | Produktion erlaubt keinen lokalen Auth-Bypass-Flag. |
| Eigentuemer-Isolation | Persistierte Reservierungen sind dem authentifizierten Nutzer zugeordnet. |
| PII-Minimierung | Gaestedaten werden standardmaessig maskiert; Dokumentbilder werden nicht gespeichert. |
| Upload-Beschraenkungen | Dateityp, Groesse und Payload-Form werden vor Verarbeitung validiert. |
| Vorsichtiger SES-Umfang | Produktions-SES bleibt blockiert, ausser Konfiguration, Tests und Freigabe sind explizit erfolgt. |
| Disziplin im oeffentlichen Text | Produkttexte vermeiden absolute Compliance- oder Rechtsgarantien. |

## Produktoberflaeche

| Bereich | Route oder Artefakt |
| --- | --- |
| Oeffentliche Landingpage | `/` |
| Pilotanfrage | `/piloto` |
| Pilot-Login | `/login` |
| Admin-Login | `/admin/login` |
| Anwendungsworkflow | `/app` |
| Reservierungsdashboard | `/dashboard` |
| Test-Pre-Check-in | `/precheckin/[token]` |
| Veroeffentlichte Handbuecher | `public/manuals/` |

## Architektur

| Ebene | Stack |
| --- | --- |
| Webanwendung | Next.js App Router, React 19, TypeScript |
| API-Routen | Next.js Server-Routen mit Zod-Validierung |
| Persistenz | Prisma, optionale datenbankgestuetzte Speicherung |
| Tabellenverarbeitung | ExcelJS |
| XML | `fast-xml-parser` plus lokale SES-Validierungshelfer |
| E-Mail | Versandhelfer mit Resend, wenn konfiguriert |
| Tests | Vitest, React Testing Library und fokussierte Routen-/Unit-Abdeckung |
| Handbuecher | Markdown-Quellen als HTML/PDF ueber Chromium gerendert |

## Schnellstart

### Anforderungen

- Node.js 22 empfohlen.
- npm 10+ empfohlen.
- Chrome oder Chromium nur zum erneuten Erzeugen der PDF-Handbuecher.

### Lokale Entwicklung

```bash
cp .env.example .env
npm install
npm run dev
```

Fuer eine lokale Demo ohne echte Daten:

```bash
SYNCXML_LOCAL_DEMO=true npm run dev
```

Fuer kontrollierte Zugangsablaeufe in local oder staging, `.env` sorgfaeltig
konfigurieren und synthetische oder anonymisierte Daten nutzen, ausser ein Pilot
mit echten Daten wurde freigegeben.

## Umgebung

Haeufige Variablen in der Entwicklung:

| Variable | Nutzung |
| --- | --- |
| `SESSION_SECRET` | Secret fuer Session-Signatur. |
| `SYNCXML_ADMIN_PASSWORD` | Kontrollierter Admin-Fallback. |
| `DATABASE_URL` / `DIRECT_URL` | Prisma-Datenbankverbindung. |
| `SYNCXML_ENABLE_PERSISTENT_STORAGE` | Aktiviert optionale Reservierungspersistenz. |
| `SYNCXML_LOCAL_DEMO` | Erlaubt lokalen Demo-Modus ausserhalb der Produktion. |
| `RESEND_API_KEY` | Aktiviert E-Mail-Versand, wenn benoetigt. |

Mehr Details:

- [.env.example](.env.example)
- [docs/env-syncxml-pilot.md](docs/env-syncxml-pilot.md)
- [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)

## Handbuecher

Die neuesten veroeffentlichten Benutzerhandbuecher liegen in einem kanonischen
Ordner: [public/manuals](public/manuals).

| Sprache | PDF | HTML |
| --- | --- | --- |
| Spanisch | [PDF](public/manuals/anclora-syncxml-manual-usuario-es.pdf) | [HTML](public/manuals/anclora-syncxml-manual-usuario-es.html) |
| Englisch | [PDF](public/manuals/anclora-syncxml-user-manual-en.pdf) | [HTML](public/manuals/anclora-syncxml-user-manual-en.html) |
| Deutsch | [PDF](public/manuals/anclora-syncxml-benutzerhandbuch-de.pdf) | [HTML](public/manuals/anclora-syncxml-benutzerhandbuch-de.html) |

Editierbare Quellen liegen in [docs/manual](docs/manual). Veroeffentlichte
Handbuecher neu erzeugen mit:

```bash
node scripts/generate-syncxml-manual-pdf.mjs --lang=all
```

## Qualitaetskontrollen

Lokale Qualitaetskontrolle vor Uebergabe einer Branch ausfuehren:

```bash
npm run check:public-docs
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --omit=dev --audit-level=high
```

## Sicherheitserwartungen

- Keine echten Gaestedaten, exportierten XML-Dateien oder Tabellen mit PII committen.
- Keine Namen, Ausweisnummern, Telefonnummern, E-Mails, Adressen, Zahlungen oder
  vollstaendige XML-Payloads loggen.
- Synthetische oder anonymisierte Daten fuer Tests, Screenshots, Demos und Bugreports nutzen.
- Produktionsgeheimnisse nicht zwischen Umgebungen kopieren.
- Vorproduktionsnachweise nutzen, bevor ein SES-Produktionsworkflow erwogen wird.

Responsible Disclosure und Sicherheitsablaeufe: [SECURITY.md](SECURITY.md).

## Dokumentationskarte

| Thema | Dokument |
| --- | --- |
| Dokumentationsindex | [docs/README.md](docs/README.md) |
| Zugangsmodell | [docs/ACCESS_MODEL.md](docs/ACCESS_MODEL.md) |
| Datenschutzmodell | [docs/PRIVACY_MODEL.md](docs/PRIVACY_MODEL.md) |
| SES-Zugangskontrolle | [docs/SES_ACCESS_CONTROL.md](docs/SES_ACCESS_CONTROL.md) |
| Pilotablauf | [docs/pilot/SYNCXML_CONTROLLED_PILOT_FLOW.md](docs/pilot/SYNCXML_CONTROLLED_PILOT_FLOW.md) |
| Umgebungseinrichtung | [docs/ENVIRONMENT_SETUP_SYNCXML_PILOT.md](docs/ENVIRONMENT_SETUP_SYNCXML_PILOT.md) |
| Roadmap | [ROADMAP.md](ROADMAP.md) |
| Governance | [GOVERNANCE.md](GOVERNANCE.md) |

## Beitragen

Beitraege sind willkommen, wenn sie die Grenzen von Datenschutz durch Design und
kontrolliertem Piloten respektieren.

Startpunkte:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [docs/community/INITIAL_ISSUES.md](docs/community/INITIAL_ISSUES.md)
- [docs/devops/AGENT_GIT_WORKFLOW_CONTRACT.md](docs/devops/AGENT_GIT_WORKFLOW_CONTRACT.md)

## Lizenz

MIT. Siehe [LICENSE](LICENSE).
