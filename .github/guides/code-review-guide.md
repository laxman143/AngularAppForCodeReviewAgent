# Code Review - Command Reference

## Overview
This repository uses an Angular code review **skill** (`SKILL.md`) backed by a **custom agent** (`code-review.agent.md`). Together they provide automated Angular code review with strict repository standards enforcement. The skill can be invoked via the `/code-review` slash command in Copilot Chat. It can analyze unstaged changes, staged changes, or committed code, and either report issues or automatically fix them.

## How to Invoke

| Method | Example | When to Use |
|--------|---------|-------------|
| Slash command | `/code-review staged` | Quickest — type `/` and select from list |
| Natural language | `review my unstaged changes` | Copilot auto-discovers the skill from keywords |

## Command Categories

### 📋 Review Only Mode (Default)
Reports issues with line numbers and suggested fixes without modifying files.

| Command | Description |
|---------|-------------|
| `/code-review` | **Smart auto-detection**: First checks for staged changes, then unstaged changes, then asks if you want to review commits. Best for quick reviews when you're not sure what's changed. |
| `/code-review staged` | Reviews only changes that have been `git add`'ed (staged for commit). Use this before committing. |
| `/code-review unstaged` | Reviews working directory changes that haven't been staged yet. Use this while actively coding. |
| `/code-review commits` | Compares all commits on your current branch against the `main` branch. Shows what will be reviewed in a PR. |
| `/code-review my commits` | Same as above - compares current branch commits with main. |
| `/code-review against main` | Explicitly compares your branch against main branch. Useful for final PR preparation. |
| `/code-review against <branch>` | Compares your branch against any specified branch. Examples: `against v18`, `against develop`. |

### 🔧 Auto-Fix Mode
Automatically applies safe fixes directly to your files using VS Code's diff UI.

| Command | Description |
|---------|-------------|
| `/code-review fix` | **Auto-fixes all detectable issues**: Applies safe fixes (const, optional chaining, track/trackBy, absolute imports, hardcoded strings → constants). Auto-detects scope like review mode. |
| `/code-review fix staged` | Auto-fixes only staged changes. Review and accept/reject each fix before committing. |
| `/code-review fix unstaged` | Auto-fixes only working directory changes. Great for cleaning up code during development. |
| `/code-review fix commits` | Auto-fixes issues in committed code by creating new edits in your working directory. You'll need to commit the fixes separately. |
| `/code-review fix against <branch>` | Auto-fixes commits compared to specified branch. Examples: `fix against v18`. |

## What Gets Reviewed

### Strict Repository Standards (All flagged as `[MUST]`)
- ❌ **No `any` type** - Must use explicit interfaces, types, or unions
- ❌ **No `unknown` type** - Must use specific types or proper type narrowing
- ❌ **No hardcoded strings** - Must use constants (existing or create new ones)
- ❌ **No relative imports** - Must use absolute imports (`src/app/...` instead of `../../../../`)

### Angular Best Practices
- Variable declarations (`let` → `const` when never reassigned)
- Optional chaining (`?.`) for nullable property access
- Subscription teardown (`takeUntilDestroyed()` or `async` pipe)
- List rendering (`track` for `@for`, `trackBy` for `*ngFor`)
- Change detection strategy (`OnPush` recommendations)
- Signals and reactivity (Angular 17+)
- Dependency injection patterns

### Security Issues
- DOM safety (innerHTML, sanitizer bypass)
- Router and input validation
- HTTP and API safety
- Sensitive data exposure
- Authorization and UI guards

### Performance Issues
- Template performance (method calls in bindings, repeated pipes)
- Change detection optimization
- RxJS patterns (nested subscriptions, memory leaks)
- Bundle size (lazy loading, tree shaking)
- Large data sets (virtualization, pagination)

### Accessibility
- ARIA attributes
- Keyboard support
- Form labels
- Focus management

### TypeScript Quality
- Type safety
- Proper error handling
- Code style and hygiene

## Auto-Fix Behavior

### ✅ Safe Fixes (Applied Automatically)
- Replace `let` with `const` for never-reassigned variables
- Add optional chaining (`?.`) for nullable access
- Add `track` to `@for` or `trackBy` to `*ngFor`
- Add `takeUntilDestroyed(this.destroyRef)` to subscriptions
- Replace relative imports with absolute imports
- Extract obvious hardcoded strings to constants

### ⚠️ Complex Changes (Asks First)
- Architectural refactorings
- Component restructuring
- Logic flow changes
- Security-sensitive modifications

### 🚫 Skipped (Reported Only)
- Ambiguous cases with multiple valid solutions
- Complex type fixes requiring context
- Changes that could break functionality

## Output Format

### Review Only Mode
```text
[FILE] src/app/example.component.ts
LINE 42 - [MUST] Missing subscription teardown.
Suggested Fix:
this.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...);

[FILE] src/app/example.component.ts
LINE 57 - [SHOULD] Variable is never reassigned.
Suggested Fix:
const status = this.getStatus();
```

### Auto-Fix Mode
Files are edited directly. After completion, you'll see:
- Summary of what was fixed
- What still needs manual review
- VS Code diff view for each change (accept/reject with UI buttons)

## Severity Levels

- **[MUST]** - Blocking issues (security, bugs, strict standards violations)
- **[SHOULD]** - Quality, performance, maintainability issues
- **[NICE]** - Stylistic improvements, polish

## Workflow Examples

### Before Committing
```bash
# Review what you're about to commit
@code-review review staged

# Or auto-fix issues before committing
@code-review review and fix staged
```

### During Development
```bash
# Quick check of current changes
@code-review review unstaged

# Clean up code automatically
@code-review review and fix unstaged
```

### Before Creating PR
```bash
# See all changes vs main branch
@code-review review commits

# Compare against a specific branch
@code-review review against v18

# Auto-fix everything before PR
@code-review review and fix
```

### Not Sure What Changed
```bash
# Let the agent figure it out
@code-review review my code
```

## Additional Resources

- **Skill Entry Point**: `.github/skills/code-review/SKILL.md` - Skill registration, invocation triggers, and procedure
- **Agent Definition**: `.github/agents/code-review.agent.md` - Agent brain: scope detection, auto-fix workflow
- **Review Standards**: `.github/skills/code-review/pre-code-review.md` - Complete Angular review rules and examples
- **Repository Standards**: Enforces strict TypeScript, no hardcoded strings, and absolute imports

## Installation

No installation required! The agent is automatically available when you open this workspace in VS Code. Simply type `@code-review` in the Copilot chat to get started.

## Tips

1. **Use auto-fix during development** - Catches issues early and saves review time
2. **Review staged before committing** - Ensures clean commits
3. **Check commits before PR** - See what reviewers will see
4. **Accept/reject individual changes** - VS Code's diff UI lets you review each fix
5. **Run frequently** - Faster feedback loop = better code quality

## Support

For issues or questions about the code review skill, refer to:
- `.github/skills/code-review/pre-code-review.md` for detailed standards and examples
- `.github/skills/code-review/SKILL.md` for skill invocation and procedure
- `.github/agents/code-review.agent.md` for agent implementation and workflow
