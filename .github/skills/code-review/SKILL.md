---
name: code-review
description: 'Angular (v17+) code review skill for this repository. Use when asked to review, check, audit, or auto-fix Angular code changes — staged, unstaged, or committed. Enforces mandatory repository standards for TypeScript, templates, SCSS, security, accessibility, and performance. Triggers on: review my code, review staged, review unstaged, review commits, review against <branch>, auto-fix, review and fix.'
argument-hint: 'staged | unstaged | commits | against <branch> | review and fix'
---

# Angular Code Review Skill

## When to Use

- "review my code", "review staged", "review unstaged"
- "review commits", "review my commits", "review against main", "review against <branch>"
- "review and fix", "auto-fix my code", "review and fix staged", "review and fix unstaged"
- "check my changes", "audit my code", "fix my code"

## What This Skill Does

Runs a full Angular code review against the standards defined in [pre-code-review.md](./pre-code-review.md).

Supports two behaviors:
- **Review Only** — Reports issues with exact LINE numbers and suggested fixes (default)
- **Auto-Fix** — Directly applies safe fixes to files via VS Code diff UI

Supports three scopes:
- **Staged** — Changes added with `git add`
- **Unstaged** — Working directory changes not yet staged
- **Commits** — All commits on current branch compared to `main` or a specified branch

## Procedure

1. Load coding standards from [pre-code-review.md](./pre-code-review.md)
2. Determine scope from the user's command:
   - `against <branch>` → `git diff <branch>...HEAD`
   - `commits` / `my commits` → `git diff main...HEAD`
   - `staged` → `get_changed_files` with `sourceControlState: ["staged"]`
   - `unstaged` → `get_changed_files` with `sourceControlState: ["unstaged"]`
   - No keyword → auto-detect: staged first, then unstaged
3. Determine behavior: review-only (default) or auto-fix (if "fix" in command)
4. Apply rules from [pre-code-review.md](./pre-code-review.md) to changed lines only
5. Report every finding with exact `[FILE]` and `LINE` references using `[MUST|SHOULD|NICE]` labels

## Output Format

Every `LINE` reference must be a clickable markdown link so the user can jump directly to the file and line in VS Code:

```text
[FILE] src/app/example.component.ts
[LINE 42](src/app/example.component.ts#L42) - [MUST] Missing subscription teardown.
Suggested Fix:
this.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...);
```

## Severity Labels

- `[MUST]` — Blocking: security issues, bugs, strict standards violations
- `[SHOULD]` — Quality, performance, maintainability
- `[NICE]` — Stylistic improvements, polish
