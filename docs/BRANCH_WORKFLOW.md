# Repository Branch Workflow & Secure Deployment Policy

To maintain codebase stability, enforce code quality, and secure production deployments, this repository utilizes strict GitHub Rulesets and automated validation workflows.

---

## 1. Branch Policies

### The `main` Branch
- **Purpose**: Stable, production-ready code.
- **Direct Pushes**: **Blocked**. No contributor can push commits directly to the remote `main` branch.
- **Force Pushes and Deletions**: **Blocked**. The git history of `main` is protected and immutable.

### Feature & Bugfix Branches
- **Naming Pattern**: Use descriptive names such as `feature/summary-dashboard`, `bugfix/auth-redirect`, or `chore/dependencies`.
- **Contribution Flow**: Create a local branch from `main`, commit changes, push the branch to GitHub, and open a Pull Request (PR) targeting `main`.

### Inactive & Locked Branches
- **Old / Deprecated Branches**: Existing non-main branches (such as `vercel/react-server-components-cve-vu-a45dhp`) are marked as inactive and **locked**. They are read-only and cannot receive any new commits, pushes, or merges.

---

## 2. Pull Request & Code Review Requirements

To merge any code into the `main` branch, a Pull Request must be created and satisfy the following conditions:

1. **Required Approvals**: Must receive at least **1 approving review** from a repository administrator or team member before merging.
2. **Review Dismissal**: If new commits are pushed to a PR branch, any existing approvals are automatically dismissed to ensure the new changes are re-reviewed.
3. **Conversation Resolution**: All review comments and discussions must be marked as **resolved** before the PR can be merged.

---

## 3. Continuous Integration & Status Checks

Before a Pull Request can be merged into `main`, it must successfully pass the automated CI status checks:

- **CI Workflow Job**: `Build and Test`
- **Steps Executed**:
  1. **Linting**: Verifies code style and rules compliance (`npm run lint`).
  2. **Build Verification**: Compiles the Next.js application (`npm run build`).
  3. **Unit & Integration Tests**: Runs the Playwright/tsx test runner (`npm test`).

*If any step in the CI pipeline fails, the merge button is blocked.*

---

## 4. Production Deployment Pipeline

Deployments to production (e.g., Vercel, Firebase Hosting) are configured to trigger strictly from the `main` branch.

- **Trigger**: Pushes or PR merges directly to the `main` branch.
- **Automated Branch Guard**: The deployment pipeline includes a strict automated check that verifies `github.ref == 'refs/heads/main'`. If triggered on any other branch, the pipeline will instantly abort.
