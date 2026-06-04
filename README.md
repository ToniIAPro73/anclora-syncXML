# Anclora SyncXML

![Project status](https://img.shields.io/badge/status-pre--MVP%20%2F%20controlled%20validation-orange)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Tests](https://img.shields.io/badge/tests-vitest-blue)
![Privacy](https://img.shields.io/badge/privacy-local--first%20by%20default-brightgreen)

Anclora SyncXML is an open-source privacy-first tool for preparing, validating,
reviewing and exporting XML from reservation and guest data imported from
Excel/XLSX files.

The project is currently **pre-MVP / controlled validation**. It should not be
presented as legal advice, as an official SES.HOSPEDAJES integration, or as a
guarantee of regulatory compliance.

## Open Source status

Anclora SyncXML is released as an open-source project under the MIT License.

The repository is public to enable inspection, contribution and external review,
especially around privacy-first handling of sensitive hospitality workflows.

## Why this project matters

Small lodging operators often depend on manual workflows, spreadsheets,
fragmented tools or proprietary cloud-first platforms to prepare guest and
reservation data.

Anclora SyncXML explores a privacy-first, auditable and inspectable alternative
for preparing, validating and exporting structured XML workflows from
reservation data.

## Who this is for

- Independent property owners.
- Small accommodation operators.
- Developers building hospitality, XML, privacy or compliance-adjacent tooling.
- Contributors interested in local-first data handling and safer handling of
  sensitive guest data.

## Current scope

- Controlled XLSX import.
- Reservation, property, guest and payment validation.
- Masked preview of sensitive data by default.
- Duplicate detection and manual review workflow.
- Reviewable XML generation and download.
- Local-first operation without persistent storage by default.
- Optional Prisma-backed persistence when explicitly configured.
- Spanish public landing and multi-language app experience.
- Controlled pilot access flow with cautious onboarding copy.

## Not in scope

- Legal advice.
- Guarantee of compliance.
- Automatic official production submission unless explicitly implemented and
  audited.
- Storage of real guest data unless security, retention and privacy controls are
  configured and reviewed.

## Architecture at a glance

- Next.js App Router for UI and API routes.
- Prisma for optional persistence and pilot-user support.
- Vitest for tests.
- `xlsx` for defensive spreadsheet parsing.
- `fast-xml-parser` for XML parsing and generation with defensive restrictions.

## Privacy-first defaults

By default, imported data, previews, validations and generated XML stay in the
current operation context and are not persisted permanently.

Persistent storage must be enabled explicitly:

```bash
SYNCXML_ENABLE_PERSISTENT_STORAGE="true"
```

If persistence is enabled, the deployment must add encryption, retention,
access-control and deletion safeguards before handling real guest data.

## Access model

The current access model is intentionally limited and should be described
carefully:

- `/app` and `/dashboard` are protected.
- Local demo mode is available with `SYNCXML_LOCAL_DEMO=true`.
- In controlled environments, access can be backed by Prisma `PilotUser`
  records.
- A shared admin/password fallback also exists for controlled pilot scenarios.
- Pilot approval and invitation remain partially manual workflows.

More detail is documented in [docs/ACCESS_MODEL.md](docs/ACCESS_MODEL.md).

## Installation

### Requirements

- Node.js 22 recommended.
- npm 10+ recommended.

### Local setup

```bash
cp .env.example .env
npm install
npm run dev
```

For a local demo without real data:

```bash
SYNCXML_LOCAL_DEMO=true npm run dev
```

For controlled access flows in local or staging, configure `.env` carefully and
use synthetic or anonymized data only.

## Environment notes

Common variables you may need during development:

- `SESSION_SECRET`
- `SYNCXML_ADMIN_PASSWORD`
- `DATABASE_URL`
- `DIRECT_URL`
- `SYNCXML_ENABLE_PERSISTENT_STORAGE=false`
- `SYNCXML_LOCAL_DEMO=true` for local demo mode

Email and pilot-request related variables are documented in
[.env.example](.env.example) and [docs/env-syncxml-pilot.md](docs/env-syncxml-pilot.md).

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Security expectations

- Do not log names, IDs, phone numbers, emails, addresses, payments or full XML
  payloads.
- Do not commit real guest data, exported XML files or spreadsheets containing
  PII.
- Use synthetic or anonymized data for tests, screenshots and bug reports.
- Reject malformed uploads, unexpected MIME types and dangerous XML structures.

## Roadmap

See [ROADMAP.md](ROADMAP.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## Support

See [SUPPORT.md](SUPPORT.md).

## Governance

See [GOVERNANCE.md](GOVERNANCE.md).

## Additional documentation

- [docs/README.md](docs/README.md)
- [docs/ACCESS_MODEL.md](docs/ACCESS_MODEL.md)
- [docs/community/INITIAL_ISSUES.md](docs/community/INITIAL_ISSUES.md)
- [docs/PRIVACY_MODEL.md](docs/PRIVACY_MODEL.md)
- [docs/manual/manual-usuario.en.md](docs/manual/manual-usuario.en.md)
- [docs/manual/manual-usuario.md](docs/manual/manual-usuario.md)

## License

MIT. See [LICENSE](LICENSE).
