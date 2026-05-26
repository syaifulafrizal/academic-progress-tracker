---
name: manual-pdf
description: Create or update the Academic Tracker user manual and regenerate its PDF. Use when asked to add, revise, export, or regenerate user manual guidelines or PDF documentation for this repo.
---

# Manual PDF

Use this workflow for user manual changes in this repository.

1. Edit `docs/user-manual.md` as the source of truth.
2. Keep wording role-based and deployment-neutral: Lecturer, Student, administrator, live deployment.
3. Avoid screenshots or environment secrets in the manual.
4. Regenerate the PDF with:

```bash
npm run manual:pdf
```

5. Verify both artifacts exist:

```text
docs/user-manual.md
docs/Academic-Tracker-User-Manual.pdf
```

6. Run `npm run lint` and `npm run build` before pushing code changes.
