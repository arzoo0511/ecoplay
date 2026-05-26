# Contributing to EcoPlay 🌍

Thanks for your interest in contributing to EcoPlay.

## Before You Start

- Read the project overview in [`README.md`](./README.md).
- For local setup, environment variables, and Supabase configuration, see [`docs/SETUP.md`](./docs/SETUP.md).
- Search existing issues before creating a new one.
- For major changes, open an issue first to discuss scope.

---

## What to Contribute

- Feature scaffolding aligned with modules in `README.md`
- Documentation improvements in `README.md` or `docs/`
- Bug fixes with reproducible steps
- Test coverage and quality improvements
- AI/ML enhancements to the EcoBot chatbot

---

## Branch and Commit Guidelines

- Branch naming:
  - `feat/<short-description>`
  - `fix/<short-description>`
  - `docs/<short-description>`
  - `refactor/<short-description>`
  - `chore/<short-description>`
  - `test/<short-description>`
- Keep commits small and focused.
- Write clear commit messages in imperative tense.

---

## Submitting a Pull Request

### PR Title

Write your PR title like this:

```
type: short description of what you did
```

Pick a `type` from this list:

| Type | Use when... |
|---|---|
| `feat` | You added something new |
| `fix` | You fixed a bug |
| `docs` | You updated documentation |
| `testing` | You added or fixed tests |
| `security` | Security-related change |
| `performance` | Performance improvement |
| `design` | UI/UX or styling change |
| `refactor` | Code cleanup with no behavior change |
| `devops` | CI/CD, build, or config change |
| `accessibility` | Accessibility improvement |

### PR Label

Add **one or more labels** that match your type (labels are stackable):

`type:bug` `type:feature` `type:docs` `type:testing` `type:security` `type:performance` `type:design` `type:refactor` `type:devops` `type:accessibility`


### PR Body (optional)

Add bullet points for anything notable. They'll appear as sub-items in the changelog automatically.


### Example

**PR Title:**
```
feat: add combo multiplier cap to ocean cleanup game
```

**Label:** `type:feature`

**PR Body:**
```
- Caps combo multiplier at 10x to prevent score abuse
- Displays max combo indicator in the UI
- Resets multiplier on missed trash
```

### PR Checklist

Before opening a PR, ensure:

- [ ] Changes are linked to an issue (if applicable)
- [ ] Code is readable and follows existing project structure
- [ ] Documentation is updated when behaviour changes
- [ ] No sensitive data, tokens, or secrets are committed
- [ ] Add some comments, so that other developers can understand

---

## Rules

- Do not submit PRs unrelated to an open issue without prior discussion.
- Do not commit directly to `main`. All changes go through PRs.
- Keep PRs focused, one feature or fix per PR. Avoid bundling unrelated changes.
- Respect existing code style and folder structure.
- All contributions must pass automated PR quality checks before review.

---

## Code of Conduct

### Our Commitment
We aim to maintain a respectful, inclusive, and harassment-free environment for all contributors.

### Expected Behavior
- Be respectful and supportive.
- Accept constructive feedback.
- Collaborate professionally.
- Show empathy toward others.

### Unacceptable Behavior
- Harassment, discrimination, or hateful language.
- Personal attacks, trolling, or abusive behavior.
- Sharing private information without permission.

### Enforcement
Maintainers may remove or reject contributions that violate this Code of Conduct.

### Reporting
Report inappropriate behavior privately to the maintainers with relevant details or screenshots. All reports will be reviewed fairly and promptly.

# By participating, you agree to follow CODE OF CONDUCT.