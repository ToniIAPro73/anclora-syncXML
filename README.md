<p align="center">
  <img src="public/brand/logo-anclora-syncxml-email.png" alt="Anclora SyncXML" width="112" />
</p>

<h1 align="center">Anclora SyncXML</h1>

<p align="center">
  Privacy-first tooling for reviewing reservation spreadsheets and preparing SES.HOSPEDAJES XML in a controlled pilot.
</p>

<p align="center">
  <a href="#status">Status</a> ·
  <a href="#what-it-does">Product</a> ·
  <a href="#controls">Controls</a> ·
  <a href="#manuals">Manuals</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#quality-gates">Quality</a>
</p>

<p align="center">
  <img alt="Project status" src="https://img.shields.io/badge/status-controlled%20pilot-orange" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-yellow" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-blue" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-Vitest%20171%20passing-brightgreen" />
  <img alt="Privacy" src="https://img.shields.io/badge/privacy-minimisation%20first-brightgreen" />
</p>

---

## Status

Anclora SyncXML is an open-source project under the MIT License. The repository is public so the product, privacy model and operational controls can be inspected and improved.

The product is currently in **pre-MVP / controlled validation**. It must be described carefully:

- Not legal advice.
- Not a guarantee of regulatory compliance.
- Not an automatic production SES.HOSPEDAJES submission system.
- Not a place to store real guest data without approved security, retention and access controls.

## What It Does

SyncXML helps operators turn reservation spreadsheets into a reviewable XML workflow while keeping sensitive data exposure low.

| Capability | Current behavior |
| --- | --- |
| Spreadsheet import | Reads `.xlsx` booking files with defensive parsing through ExcelJS. |
| Smart validation | Detects missing or risky booking, traveller, address, document and payment fields. |
| Guided review | Lets the operator correct blocking issues before XML generation. |
| XML preparation | Generates visual and technical XML views before download. |
| SES assistance | Supports local validation and controlled pre-production actions when configured. |
| Reservation history | Optional persistence with user-scoped reservation access. |
| Pilot access | Email/password access for approved users, temporary-password change and admin provisioning. |
| Feedback loop | In-app pilot feedback without asking for guest data. |

## Controls

The application is built around operational guardrails rather than broad claims.

| Control | Purpose |
| --- | --- |
| Controlled access | `/app` and `/dashboard` require an approved session unless local demo mode is enabled. |
| Role checks | SES submission actions are restricted by role and environment configuration. |
| Fail-closed auth | Production does not allow the local auth bypass flag. |
| Owner isolation | Persisted reservations are scoped to the authenticated user. |
| PII minimisation | Guest data is masked by default and document images are not stored. |
| Upload restrictions | File type, size and payload shape are validated before processing. |
| Prudent SES scope | Production SES remains blocked unless explicitly configured, tested and approved. |
| Public copy discipline | Product copy avoids absolute compliance or legal guarantees. |

## Product Surface

| Area | Route or artifact |
| --- | --- |
| Public landing | `/` |
| Pilot request | `/piloto` |
| Pilot login | `/login` |
| Admin login | `/admin/login` |
| Application workflow | `/app` |
| Reservation dashboard | `/dashboard` |
| Test pre-check-in | `/precheckin/[token]` |
| Published manuals | `public/manuals/` |

## Architecture

| Layer | Stack |
| --- | --- |
| Web application | Next.js App Router, React 19, TypeScript |
| API routes | Next.js server routes with Zod validation |
| Persistence | Prisma, optional database-backed storage |
| Spreadsheet parsing | ExcelJS |
| XML parsing/generation | `fast-xml-parser` plus local SES validation helpers |
| Email | Resend-backed delivery helpers when configured |
| Tests | Vitest, React Testing Library and focused route/unit coverage |
| Manuals | Markdown sources rendered to HTML/PDF through Chromium |

## Quick Start

### Requirements

- Node.js 22 recommended.
- npm 10+ recommended.
- Chrome or Chromium only when regenerating PDF manuals.

### Local development

```bash
cp .env.example .env
npm install
npm run dev
```

For a local demo without real data:

```bash
SYNCXML_LOCAL_DEMO=true npm run dev
```

For controlled access flows in local or staging, configure `.env` carefully and use synthetic or anonymized data unless a real-data pilot has been approved.

## Environment

Common variables during development:

| Variable | Use |
| --- | --- |
| `SESSION_SECRET` | Session signing secret. |
| `SYNCXML_ADMIN_PASSWORD` | Controlled admin access fallback. |
| `DATABASE_URL` / `DIRECT_URL` | Prisma database connection. |
| `SYNCXML_ENABLE_PERSISTENT_STORAGE` | Enables optional reservation persistence. |
| `SYNCXML_LOCAL_DEMO` | Allows local demo mode outside production. |
| `RESEND_API_KEY` | Enables email delivery where needed. |

More detail:

- [.env.example](.env.example)
- [docs/env-syncxml-pilot.md](docs/env-syncxml-pilot.md)
- [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)

## Manuals

The latest published user manuals live in one canonical folder: [public/manuals](public/manuals).

| Language | PDF | HTML |
| --- | --- | --- |
| Spanish | [PDF](public/manuals/anclora-syncxml-manual-usuario-es.pdf) | [HTML](public/manuals/anclora-syncxml-manual-usuario-es.html) |
| English | [PDF](public/manuals/anclora-syncxml-user-manual-en.pdf) | [HTML](public/manuals/anclora-syncxml-user-manual-en.html) |
| German | [PDF](public/manuals/anclora-syncxml-benutzerhandbuch-de.pdf) | [HTML](public/manuals/anclora-syncxml-benutzerhandbuch-de.html) |

Editable sources are in [docs/manual](docs/manual). Regenerate published manuals with:

```bash
node scripts/generate-syncxml-manual-pdf.mjs --lang=all
```

## Quality Gates

Run the full local gate before handing off a branch:

```bash
npm run check:public-docs
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --omit=dev --audit-level=high
```

## Security Expectations

- Do not commit real guest data, exported XML files or spreadsheets containing PII.
- Do not log names, IDs, phone numbers, emails, addresses, payments or full XML payloads.
- Use synthetic or anonymized data for tests, screenshots, demos and bug reports.
- Do not copy production secrets between environments.
- Use pre-production evidence before considering any SES production workflow.

Responsible disclosure and security handling: [SECURITY.md](SECURITY.md).

## Documentation Map

| Topic | Document |
| --- | --- |
| Documentation index | [docs/README.md](docs/README.md) |
| Access model | [docs/ACCESS_MODEL.md](docs/ACCESS_MODEL.md) |
| Privacy model | [docs/PRIVACY_MODEL.md](docs/PRIVACY_MODEL.md) |
| SES access control | [docs/SES_ACCESS_CONTROL.md](docs/SES_ACCESS_CONTROL.md) |
| Pilot flow | [docs/pilot/SYNCXML_CONTROLLED_PILOT_FLOW.md](docs/pilot/SYNCXML_CONTROLLED_PILOT_FLOW.md) |
| Environment setup | [docs/ENVIRONMENT_SETUP_SYNCXML_PILOT.md](docs/ENVIRONMENT_SETUP_SYNCXML_PILOT.md) |
| Roadmap | [ROADMAP.md](ROADMAP.md) |
| Governance | [GOVERNANCE.md](GOVERNANCE.md) |

## Contributing

Contributions are welcome when they preserve the privacy-first and controlled-pilot boundaries.

Start with:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [docs/community/INITIAL_ISSUES.md](docs/community/INITIAL_ISSUES.md)
- [docs/devops/AGENT_GIT_WORKFLOW_CONTRACT.md](docs/devops/AGENT_GIT_WORKFLOW_CONTRACT.md)

## License

MIT. See [LICENSE](LICENSE).
