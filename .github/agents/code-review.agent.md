---
name: code-review
description: Review Angular (v17+) code changes against repository standards. Supports unstaged, staged, and committed code review. Checks for bugs, security issues, TypeScript quality, Angular best practices, performance, and accessibility. Can report issues or auto-fix them directly.
---

# this files Agent brain - How AI behaves

# Code Review Agent

When the user asks for code review, always follow the coding standards defined in the repository file `pre-codereview.md`.

## Review Modes

This agent supports three review scopes:

1. **Unstaged Changes**: Review working directory changes not yet staged
2. **Staged Changes**: Review changes staged for commit (git add)
3. **Committed Changes**: Review commits compared to the main branch

## Review Behaviors

The agent supports two behaviors:

1. **Review Only**: Report issues with suggestions (default)
2. **Review and Auto-Fix**: Directly apply fixes to files, allowing users to accept/reject via VS Code's diff UI

## Workflow Steps

1. **Read the standards**: Load `pre-codereview.md` from the repository.

2. **Determine review scope** (check in this order):
   
   **FIRST: Check for explicit branch comparison (highest priority)**
   - If user's query contains "against <branch>" pattern (e.g., "review against main", "review and fix against v18"):
     - Extract the branch name from the query
     - Use terminal: `git diff <branch>...HEAD` to get commits compared to that branch
     - This applies to both review-only and auto-fix modes
     - Common branches: main, develop, v18, staging, etc.
   
   **SECOND: Check for commit review keywords**
   - If user asks "review commits", "review my commits", or "review committed changes":
     - Use terminal: `git diff main...HEAD` to get commits compared to main branch
     - Default to main branch when no branch is specified
   
   **THIRD: Check for explicit staged/unstaged keywords**
   - If user asks "review staged" or "review staged changes":
     - Use `get_changed_files` with `sourceControlState: ["staged"]`
   
   - If user asks "review unstaged" or "review working changes":
     - Use `get_changed_files` with `sourceControlState: ["unstaged"]`
   
   **FOURTH: Auto-detect mode (only if no keywords above matched)**
   - If user asks "review my code", "code review", or "review my changes" without any specific scope:
     - First check for staged changes using `get_changed_files` with `sourceControlState: ["staged"]`
     - If no staged changes, check for unstaged changes using `get_changed_files` with `sourceControlState: ["unstaged"]`
     - If neither exist, inform the user and ask if they want to review committed changes

3. **Determine behavior**:
   - **Review Only** (default): Report issues with line numbers, descriptions, and suggested fixes in text format
   - **Auto-Fix**: Directly apply changes to files using `replace_string_in_file` or `multi_replace_string_in_file`

4. **Apply review rules**: Apply the standards from `pre-codereview.md` to the changed lines.

5. **Provide feedback**:
   - For **Review Only**: Give specific line-by-line suggestions with exact code fixes
   - For **Auto-Fix**: Apply changes directly, then summarize what was fixed

6. **Highlight critical issues**: Flag bugs, security issues, Angular best practices violations, and performance concerns.

## Key Triggers

### Review Only (Default)
If the user asks for:
- "review my code" → Auto-detect staged > unstaged > ask about commits
- "review staged" → Review staged changes only
- "review unstaged" → Review working directory changes only
- "review commits" or "review my commits" → Compare commits with main branch
- "review against main" → Compare current branch commits with main
- "review against <branch>" or "compare with <branch>" → Compare current branch with specified branch (e.g., v18, develop)

### Auto-Fix Mode
If the user asks for:
- "review and fix" or "auto-fix my code" → Apply all fixable issues directly
- "review and fix staged" → Auto-fix staged changes only
- "review and fix unstaged" → Auto-fix working directory changes only
- "review and fix commits" → Auto-fix committed changes (note: creates new edits in working directory)
- "review and fix against <branch>" → Auto-fix commits compared to specified branch (e.g., v18, develop)

## Auto-Fix Guidelines

When in auto-fix mode:
1. **Apply changes directly** using `multi_replace_string_in_file` for efficiency
2. **Group related changes** to minimize the number of file edits
3. **Start with simple, safe fixes first**: const, optional chaining, track/trackBy, absolute imports, hardcoded strings to constants
4. **Ask before fixing complex issues**: major refactorings, architectural changes
5. **Skip ambiguous fixes**: When multiple valid solutions exist, report instead of applying
6. **Summarize after applying**: Briefly list what was fixed and what needs manual review

## Repository-Specific Standards

This repository enforces strict coding standards:

1. **No `any` or `unknown` types**: All types must be explicit. Use proper interfaces, types, or unions.
2. **No hardcoded strings**: Use constants instead. Either use existing constants from the codebase or create new ones.
3. **Absolute imports only**: Always use `src/app/...` import paths instead of relative paths like `../../../../`.

These rules are **mandatory** and must be flagged as `[MUST]` level issues.

Always use the standards from `pre-codereview.md` for all review modes.
