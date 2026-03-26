# Contributing to AI Internship Recommendation Engine

Thank you for your interest in contributing! To maintain a high standard of quality, please follow these guidelines.

## Branching Strategy

We follow a standard branching model to ensure stability:

- **`main`**: This branch contains the production-ready code. Only merge here from `develop` after testing.
- **`develop`**: This is the primary development branch. All feature branches and bug fixes should be merged here first for integration testing.
- **`feature/*`**: Create a new branch from `develop` for every new feature.
  - Example: `feature/user-authentication`
- **`fix/*`**: Create a new branch from `develop` for bug fixes.
  - Example: `fix/search-results-bug`

## Development Workflow

1. **Fork the repository** (if you are an external contributor).
2. **Clone the repository** and install dependencies:
   ```bash
   npm install
   cd backend && npm install
   ```
3. **Create a new branch** from `develop`:
   ```bash
   git checkout develop
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes**.
5. **Run Linting**:
   ```bash
   npm run lint
   cd backend && npm run lint
   ```
6. **Run Tests**:
   ```bash
   npm test
   cd backend && npm test
   ```
7. **Commit your changes** using descriptive commit messages.
8. **Push to your branch** and **create a Pull Request** against the `develop` branch.

## Pull Request Guidelines

- Ensure your code follows the project's styling and linting rules.
- Include unit tests for new features.
- Update documentation if necessary.
- Fill out the PR template completely.
