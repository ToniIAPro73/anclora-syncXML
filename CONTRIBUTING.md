# Contributing to Anclora SyncXML

## Project status

This project is in pre-MVP / controlled validation.

## Ways to contribute

- Documentation improvements.
- Test coverage.
- XML validation improvements.
- Privacy and security review.
- Accessibility improvements.
- Internationalization.
- Developer experience.

## Local setup

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Pull request guidelines

- Use clear PR titles.
- Explain the problem and the solution.
- Include tests where relevant.
- Do not include real guest data.
- Do not commit secrets or `.env` files.
- Keep claims legally cautious.

## Data safety rules

- Use synthetic or anonymized test data only.
- Never commit real names, IDs, phone numbers, emails, addresses, payments, XML
  exports or Excel files containing real guest data.
- Mask or remove PII in screenshots.

## Issue labels

Suggested labels:

- `good first issue`
- `documentation`
- `tests`
- `security`
- `privacy`
- `xml-validation`
- `i18n`
- `accessibility`
- `developer-experience`

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
