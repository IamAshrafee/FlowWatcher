---
description: Auto-generate a conventional commit message from staged changes and commit
---

// turbo-all

# Auto Commit Workflow

## Steps

1. Check what files are currently staged:

```bash
git status --short
```

2. View the staged diff to understand what changed:

```bash
git diff --cached --stat
git diff --cached
```

3. Based on the diff, determine the correct **conventional commit type**:
   - `feat:` — New feature or significant addition
   - `fix:` — Bug fix
   - `docs:` — Documentation changes only
   - `style:` — Formatting, whitespace, semicolons (no logic change)
   - `refactor:` — Code restructuring without feature/fix
   - `perf:` — Performance improvement
   - `test:` — Adding or updating tests
   - `chore:` — Maintenance, deps, tooling
   - `ci:` — CI/CD workflow changes
   - `build:` — Build system changes

4. Generate a commit message following this format:
   ```
   type(scope): short summary (imperative, lowercase, no period)

   - Bullet points explaining what changed and why (if non-obvious)
   ```

   **Rules:**
   - Subject line must be ≤72 characters
   - Use imperative mood ("add" not "added")
   - Scope is optional but recommended (e.g., `feat(dashboard):`, `fix(logger):`)
   - Body bullets should explain **why**, not just **what** (the diff already shows what)
   - If changes span multiple concerns, pick the primary one for the type

5. Show the proposed commit message to the user and ask for confirmation before committing.

6. Once confirmed, commit with the message:

```bash
git commit -m "type(scope): summary" -m "- bullet 1
- bullet 2"
```

## Important Notes

- If nothing is staged, tell the user to stage files first (`git add`)
- If the diff is very large, focus on the most important changes for the summary
- Never auto-run the `git commit` command — always confirm with the user first
