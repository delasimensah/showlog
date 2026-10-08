# 🌿 Git and Pull Request Guidelines

This document outlines our Git workflow, branch naming conventions, commit message standards, and PR requirements.

## 🌿 Branch Naming Conventions

Tickets live in `docs/product/linear-tickets.md`, numbered `SHOW-1`, `SHOW-2`, and so on. Every branch is named after one ticket that already exists in that file:

```bash
git checkout -b feature/SHOW-12
```

A tangent stays on the current ticket branch. If it cannot, add the ticket to the file first, then branch.

## 📝 Commit Message Guidelines

```
SHOW-12 Brief description of changes
```

```bash
git commit -m "SHOW-12 Added the Up next list"
```

## Agent pause before commit

When an AI agent is doing the work: branch, implement, and run checks. Then stop. Do not commit, push, or open a pull request until this message explicitly asks for that. A yes earlier in the chat does not cover a later commit or push.

When this message asks to open a PR: local `yarn lint`, `yarn format:check`, `yarn type-check`, and `yarn test:ci` first, then commit, push, and create the PR. Do not wait on GitHub Actions. If a test is too slow for the default 5s timeout, rewrite the test.

## STATUS.md in a feature pull request

Write `STATUS.md` and the ticket's status line in `docs/product/linear-tickets.md` as the state after this pull request merges: this ticket Done, next ticket named. Do not write “not merged” or “review this branch.” When you open the pull request, add its URL to STATUS Pointers on the same branch before you stop.

## 👨‍💻 Developer Workflow

### **Step 1: Create Feature Branch**

```bash
git checkout -b feature/SHOW-12
# Make your changes
yarn lint          # Check for ESLint issues
yarn format:check  # Check Prettier formatting
yarn type-check    # Check TypeScript types (Convex + apps)
git add .
git commit -m "SHOW-12 Added user authentication flow"
git push origin feature/SHOW-12
```

### **Step 2: Create Pull Request**

**PR Title Format:**

```
SHOW-12 Brief description of what the PR accomplishes
```

**PR Description Template:**

```markdown
## Why

**Purpose of the Change:**

- Explain the motivation behind the PR
- Describe the problem or issue it addresses

## What

**Summary of the Changes:**

- Clearly state what has been changed or added
- Outline the scope of the changes

**Files Changed:**

- List all modified files with brief descriptions

## How

**Implementation Details:**

- Describe how the changes were implemented
- Highlight key technical decisions

## Testing

**Testing Strategy and Results:**

- Describe types of tests conducted
- Mention any new tests added
- Include results from automated tests
```

### **Step 3: Merge**

1. Local `yarn lint`, `yarn format:check`, `yarn type-check`, and `yarn test:ci` already passed before the PR was opened
2. Merge your PR
3. Merge Protection deletes the feature branch after a successful merge

## 🔄 Merge Conflict Resolution

```bash
git fetch origin main
git rebase origin/main
# Resolve conflicts in editor
git add .
git rebase --continue
git push --force-with-lease origin feature/SHOW-12
```

## 👀 How to Review a Pull Request

### **When Reviewing, Ask These Questions:**

1. **Does the code fulfill the business requirement?**
2. **Is the code implementation performant or could it be done better?**
3. **Any typos/spelling errors?**
4. **Are naming conventions correct?**
5. **Could the code cause any security issues?**

---

End the PR description with the ticket id and its heading from `docs/product/linear-tickets.md`.
