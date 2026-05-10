# Contributing Guidelines

Thank you for considering a contribution to Family Expense Tracker!

## Ways to contribute
- Report bugs with clear reproduction steps.
- Suggest product improvements or usability fixes.
- Improve documentation, accessibility, or PWA behavior.
- Help test the app on different browsers and devices.
## Development setup

This is a static web app with no required package install.

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Branch naming

Use short, descriptive branch names:

- `feat/feature-name`
- `fix/bug-name`
- `docs/documentation-update`
- `chore/maintenance-task`

## Commit style

Use Conventional Commit-style messages when practical:

- `feat: add budget export`
- `fix: prevent duplicate category chips`
- `docs: document GitHub Pages deployment`
- `chore: update community templates`

## Pull request process

1. Fork the project or create a branch.
2. Make a focused change.
3. Run the app locally with a static server.
4. Verify relevant flows such as onboarding, adding transactions, profile settings, and PWA behavior.
5. Update documentation if behavior or setup changes.
6. Open a pull request using the PR template.

## Security and private data

Do not include secrets or personal finance data in issues, pull requests, screenshots, or examples. This includes real Google Apps Script URLs, family IDs, exported spreadsheets, API keys, and private transaction data.
5. Open a Pull Request using the provided PR template.

## Issues
Please use the provided Issue Templates for submitting bug reports or feature requests.
