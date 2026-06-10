# SDD — Spec-Driven Development

This directory contains all SDD artifacts for `anclora-syncXML`.

## Structure

```
sdd/
├── core/          # System-level specs and architecture decisions
└── features/      # Feature-level specs, plans, and tasks
    └── <name>/
        ├── <name>-spec-v1.md
        ├── <name>-plan-v1.md   (complex changes)
        └── <name>-tasks-v1.md
```

## Rules

- **No spec, no code** — every feature starts with a spec in `sdd/features/`
- Specs are immutable once archived — changes produce a new spec version
- Plans and tasks reference the spec that originated them

## Reference

- Methodology: `agency-agents/docs/guides/SDD_INTEGRATION_GUIDE.md`
- OpenSpec workflow: `agency-agents/docs/guides/OPENSPEC_WORKFLOW.md`
