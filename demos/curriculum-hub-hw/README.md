# Oak Curriculum Hub — project directory

Everything belonging to the Oak Curriculum Hub demo: the app itself, the design
source of truth it reproduces, the evidence that proves the reproduction, and
the tooling that produces that evidence. The demo tier's contract (standards,
dependency boundary, licences) lives in the [tier README](../README.md).

| Path | Role |
| --- | --- |
| [`oak-curriculum-hub/`](oak-curriculum-hub/README.md) | **The app** — a Next.js workspace (registered in `pnpm-workspace.yaml`) over the live search + content SDKs. |
| `claude-design-canonical-export/` | **Design source of truth** — the authoritative Claude Design export the app visual-matches. Committed deliberately so each fresh export diffs against the last (the change-ingest mechanism's baseline). |
| `demo-evidence/` | **Evidence** — visual-fidelity captures at matched geometry and audit outputs, produced by `tools/`. |
| `tools/` | **Evidence tooling** — capture and render scripts (live-demo capture, canonical-target rendering). Run from the repo root. |
| [`PROJECT-BRIEF.md`](PROJECT-BRIEF.md) | **Provenance** — the original project brief. Historical: it predates the `demos/` placement, so paths inside it refer to `apps/`. |
| `oak-design-kit/` | **Provenance** — decoded design-kit assets (fonts, logos, tokens) extracted from the export, with `PROVENANCE.md` records. |
| `oak-design-system/` | Gitignored local reference copy (see the root `.gitignore`); not part of the committed tree. |
| `reference-prototype/` | An earlier decoded prototype, superseded by the canonical export. Kept for provenance only — never build against it. |
