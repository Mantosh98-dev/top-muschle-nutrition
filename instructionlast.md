# PROJECT AUDIT & DEVELOPMENT RULES (STRICT)

## Objective

You are not allowed to assume anything.

Before writing or modifying a single line of code, you MUST completely understand the entire project.

Your first task is NOT coding.
Your first task is auditing.

---

# Phase 1 - Full Project Audit

Read every file in the project.

Do NOT skip any file.

This includes:

- src/
- app/
- components/
- pages/
- layouts/
- hooks/
- utils/
- services/
- api/
- assets/
- public/
- styles/
- config/
- middleware/
- context/
- lib/
- constants/
- types/
- package.json
- tsconfig
- vite.config
- next.config
- eslint
- prettier
- environment files
- routing
- database
- authentication
- admin
- user panel
- documentation

Read EVERYTHING.

Never assume.

---

# Phase 2 - Understand Architecture

Generate a complete architecture report.

Explain:

- Folder structure
- Project flow
- Routing flow
- Authentication flow
- State management
- API flow
- Database flow
- Component hierarchy
- Admin workflow
- User workflow
- Product workflow
- Banner workflow
- Authentication workflow
- Search workflow
- Category workflow
- Checkout flow
- Build process
- Deployment process

Everything.

---

# Phase 3 - File Documentation

For EVERY file create documentation.

Example

File:
src/components/Navbar.tsx

Purpose:
...

Imports:
...

Exports:
...

Dependencies:
...

Used By:
...

Contains:
...

Functions:
...

Potential Problems:
...

Future Improvements:
...

Never skip a file.

---

# Phase 4 - Code Review

Review EVERY file.

Check line by line.

Find

✓ Bugs

✓ Dead code

✓ Duplicate code

✓ Bad naming

✓ Bad architecture

✓ Performance issues

✓ Memory leaks

✓ React issues

✓ State issues

✓ Routing issues

✓ Mobile issues

✓ Desktop issues

✓ Accessibility

✓ SEO

✓ Security

✓ Validation

✓ Error handling

✓ Loading states

✓ Empty states

✓ Edge cases

✓ Type safety

✓ Console errors

✓ Console warnings

✓ Unused imports

✓ Unused variables

✓ CSS conflicts

✓ Tailwind conflicts

✓ Responsive issues

✓ Image optimization

✓ Bundle size

✓ Lazy loading

✓ Code splitting

✓ API optimization

✓ Database optimization

✓ Render optimization

✓ Re-render issues

✓ Hydration issues

✓ SSR issues

✓ Client component issues

✓ Build warnings

✓ Production issues

✓ Scalability issues

Nothing should be skipped.

---

# Phase 5 - UI Review

Inspect EVERY page.

Desktop

Tablet

Mobile

Check

Navigation

Buttons

Forms

Cards

Product pages

Admin

Search

Authentication

Footer

Drawer

Sidebar

Banner

Responsive layout

Spacing

Typography

Alignment

Animations

Overflow

Broken links

Scroll

Hover

Touch interactions

Everything.

---

# Phase 6 - Feature Audit

List every feature.

Mark each feature as

✅ Working

⚠ Needs Improvement

❌ Broken

Explain WHY.

---

# Phase 7 - Documentation

Generate professional documentation.

Create:

PROJECT_OVERVIEW.md

ARCHITECTURE.md

FOLDER_STRUCTURE.md

COMPONENTS.md

ROUTES.md

API.md

DATABASE.md

STATE_MANAGEMENT.md

WORKFLOW.md

ADMIN_WORKFLOW.md

USER_WORKFLOW.md

DEPLOYMENT.md

KNOWN_ISSUES.md

TODO.md

CHANGELOG.md

FUTURE_IMPROVEMENTS.md

CODE_GUIDELINES.md

CONTRIBUTING.md

DEVELOPER_GUIDE.md

Every document must be complete.

---

# Phase 8 - Code Quality

Refactor ONLY where necessary.

Do NOT change functionality.

Improve

Naming

Structure

Readability

Maintainability

Performance

Consistency

Reusability

Add meaningful comments only where logic is complex.

Do NOT add unnecessary comments.

---

# Phase 9 - Reporting

Generate a final report.

Include

Overall score

Architecture score

Code quality score

Performance score

Security score

Accessibility score

SEO score

Responsive score

Developer experience score

Maintainability score

List every issue.

Rank them by priority.

Critical

High

Medium

Low

Include estimated fix effort.

---

# Rules

Never guess.

Never skip files.

Never delete code unless verified unused.

Never change UI without reason.

Never rename files unless necessary.

Always preserve functionality.

Always verify before modifying.

After every change explain:

- What changed
- Why it changed
- Which files changed
- Possible side effects
- How it was tested

Always think like a senior software architect, senior frontend engineer, senior backend engineer, QA engineer, UI/UX reviewer, DevOps engineer, security engineer, and technical writer.

Your priority is understanding the project first, then improving it safely.

No shortcuts.