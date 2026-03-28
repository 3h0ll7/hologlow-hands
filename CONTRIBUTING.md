# Contributing to HoloGlow Hands

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hologlow-hands.git
   cd hologlow-hands
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/3h0ll7/hologlow-hands.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

## Branch Naming

Use descriptive branch names with these prefixes:

- `feature/` — New features (e.g., `feature/gesture-writing`)
- `fix/` — Bug fixes (e.g., `fix/camera-permission-error`)
- `docs/` — Documentation changes (e.g., `docs/update-readme`)

```bash
git checkout -b feature/your-feature-name
```

## Commit Messages

Write clear, concise commit messages:

- Use present tense: "Add feature" not "Added feature"
- Use imperative mood: "Fix bug" not "Fixes bug"
- Keep the subject line under 50 characters
- Add a body for complex changes (wrap at 72 characters)

### Co-Authored Commits

To create co-authored commits (for the Pair Extraordinaire achievement), use the provided script:

```bash
.github/scripts/co-commit.sh "Add new effect mode" "Co-Author Name" "email@example.com"
```

Or manually add the trailer:

```
git commit -m "Add new effect mode

Co-authored-by: Name <email@users.noreply.github.com>"
```

You can also configure the git message template:

```bash
git config commit.template .gitmessage
```

## Pull Request Process

1. Update your branch with the latest changes from main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Open a Pull Request on GitHub
4. Fill out the PR template completely
5. Wait for CI checks to pass
6. Request a review

## Code Style

- **TypeScript** — Use strict types, avoid `any`
- **React** — Functional components with hooks
- **Naming** — camelCase for variables/functions, PascalCase for components
- **Imports** — Group by: external libs, internal modules, types
- **Effects** — New effects go in `src/lib/effects/` following the existing pattern

## Reporting Bugs

Use the [Bug Report](https://github.com/3h0ll7/hologlow-hands/issues/new?template=bug_report.yml) template. Include:

- Browser and version
- OS and device
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

## Suggesting Features

Use the [Feature Request](https://github.com/3h0ll7/hologlow-hands/issues/new?template=feature_request.yml) template. Include:

- Clear description of the feature
- Use case — how would it be used?
- Proposed implementation (optional)

## Testing

Before submitting a PR, test your changes:

1. Run `npm run dev` and open in Chrome
2. Allow camera access
3. Verify hand tracking works with your changes
4. Check the browser console for errors
5. Test on mobile if possible

---

Thank you for helping make HoloGlow Hands better!
