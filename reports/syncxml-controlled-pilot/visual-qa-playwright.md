# Visual QA Playwright procedure

No Playwright config exists in `anclora-syncXML`. Use this reproducible manual command set after installing Playwright or from a repo-level Playwright runner.

Screens:

- `/`
- `/login`
- `/legal`
- `/privacy`
- `/terms`
- `/cookies`

Breakpoints:

- `375x812`
- `768x1024`
- `1024x768`
- `1440x900`

Checks:

- Main CTA `Solicitar piloto controlado` visible.
- Header/hero do not show a public login CTA.
- Floating Cookies button visible on the left.
- Section navigator visible on the right and not overlapping CTAs.
- Footer includes Cookies.
- Legal text is legible.
- Mobile layout has no obvious overlap.

Suggested command:

```bash
npx playwright install chromium
npx playwright codegen http://localhost:3000
```

Save captures under:

```text
reports/syncxml-controlled-pilot/visual-qa/screenshots/
```
