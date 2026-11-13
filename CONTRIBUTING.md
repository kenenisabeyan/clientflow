# Contributing to ClientFlow

Thank you for your interest in contributing to ClientFlow!

## Development Workflow

1. **Fork the repository** and clone it locally:
   ```bash
   git clone https://github.com/<your-username>/clientflow.git
   cd clientflow
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Create a new branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

4. **Verify types and builds before committing**:
   ```bash
   npm run typecheck
   npm run build
   ```

5. **Commit your changes**:
   Use conventional commit messages (e.g. `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`).

6. **Push and create a Pull Request**:
   Ensure all CI checks pass.

