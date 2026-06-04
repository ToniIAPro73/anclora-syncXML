# Initial Community Issues

These issue drafts are prepared in case GitHub CLI issue creation is not used or
not available during repository setup.

## 1. Add more synthetic XML validation fixtures

Labels: `good first issue`, `tests`, `xml-validation`

Add more synthetic test fixtures for XML generation and validation.

Rules:

- Use synthetic data only.
- Do not include real guest data.
- Cover edge cases: missing fields, invalid document numbers, dates, duplicate
  guests, non-EU documents.

Acceptance criteria:

- New fixtures added under `test-data` or test fixtures.
- Relevant Vitest coverage added.
- Existing tests still pass.

## 2. Improve README setup section for first-time contributors

Labels: `good first issue`, `documentation`

Clarify the setup path for first-time contributors, including demo mode,
environment examples and validation commands.

## 3. Review accessibility of landing and app forms

Labels: `accessibility`, `good first issue`

Review keyboard access, focus states, labels, error messaging and contrast in
the public landing and protected app forms.

## 4. Document privacy-first data handling architecture

Labels: `privacy`, `documentation`

Expand public-facing documentation for how data flows through import, preview,
validation, masking and optional persistence without overstating compliance.

## 5. Add test coverage for file upload rejection cases

Labels: `tests`, `security`

Add or extend tests for empty files, wrong extension, wrong MIME type, corrupt
files and suspicious payloads.

## 6. Improve developer documentation for SES schema validation

Labels: `documentation`, `xml-validation`

Document the current XML validation expectations, schema limits and contributor
guidance for adding new fixtures or validation rules.
