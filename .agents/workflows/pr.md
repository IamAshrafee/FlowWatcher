---
description: Auto-generate a PR title and description from the current branch diff against dev/main
---

// turbo-all

# Auto PR Description Workflow

## Steps

1. Identify the current branch and the target branch:

```bash
git branch --show-current
```

2. Determine the target branch (usually `dev`, fallback to `main`):

```bash
git branch -a --list "*/dev" | head -1
```

3. Get the list of commits on this branch that aren't on the target:

```bash
git log dev..HEAD --oneline --no-merges
```

   If `dev` doesn't exist, use `main`:

```bash
git log main..HEAD --oneline --no-merges
```

4. Get the overall diff summary:

```bash
git diff dev..HEAD --stat
```

5. If needed, view specific file diffs for important changes:

```bash
git diff dev..HEAD -- <important-file>
```

6. Generate a PR title and body following this format:

   **Title:** `type(scope): short summary` (same conventional commit format)

   **Body:**
   ```markdown
   ## What Changed

   Brief description of what this PR does and why.

   ## Type of Change

   - [ ] 🐛 Bug fix
   - [ ] ✨ New feature
   - [ ] 💥 Breaking change
   - [ ] 📝 Documentation update
   - [ ] 🔧 Refactor / chore

   ## Changes

   - Bullet list of specific changes made
   - Grouped by component/area if multiple

   ## How to Test

   Steps to verify the changes work correctly.

   ## Checklist

   - [ ] My code follows the project's architecture (`Strategic_shift.md`)
   - [ ] I've run `cargo clippy` with no warnings (if Rust changes)
   - [ ] I've run `cargo fmt` to format Rust code (if Rust changes)
   - [ ] I've run `npm run lint` with no errors (if frontend changes)
   - [ ] I've run `npm run format:check` with no errors (if frontend changes)
   - [ ] I've added/updated tests as appropriate
   - [ ] I've used conventional commit messages
   - [ ] I've wrapped all UI strings in `t()` for i18n (if adding new text)
   ```

7. Present the generated PR title and body to the user.

8. Ask the user if they want to:
   - **Copy to clipboard** — Copy the PR body so they can paste it on GitHub
   - **Create via GitHub CLI** — If `gh` is installed, create the PR directly:

```bash
gh pr create --title "type(scope): summary" --body "..." --base dev
```

## Important Notes

- Pre-check the checklist items based on what was actually changed (Rust files → check Rust items, frontend files → check frontend items)
- If the branch has only 1 commit, the PR title can match the commit message
- Never auto-run `gh pr create` — always show the output and confirm first
- If `gh` CLI is not installed, just copy the description to clipboard
