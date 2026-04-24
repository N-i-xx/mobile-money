# Contributing Guide

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/backend.git`
3. Add the original repository as an upstream remote:
   `git remote add upstream https://github.com/sublime247/mobile-money.git`
4. Sync your local main branch with upstream:
   `git checkout main`
   `git pull upstream main`
5. Create a feature branch: `git checkout -b feature/your-feature`
6. Make your changes.
7. Run tests and linting.
8. Commit: `git commit -m "Add your feature"`
9. Push: `git push origin feature/your-feature`
10. Open a Pull Request:
    *   Go to your forked repository on GitHub.
    *   Click the "Compare & pull request" button.
    *   Ensure the base repository is `sublime247/mobile-money` (main branch) and the head repository is your fork (your feature branch).
    *   Provide a clear and descriptive title and description for your Pull Request. Include:
        *   A summary of the changes.
        *   Why these changes were made (e.g., fixing a bug, adding a feature).
        *   References to any related issues (e.g., `Fixes #123`).
        *   Instructions on how to test your changes.

## Development Setup

```bash
npm install
cp .env.example .env
# Update .env with your credentials
npm run dev
```

## Code Style

- Use TypeScript
- Follow existing patterns
- Add comments for complex logic
- Keep functions small and focused

## Pull Request Guidelines

- Clear description of changes
- Reference related issues
- Update documentation if needed
- Ensure all checks pass

## Questions?

Open an issue for discussion.
