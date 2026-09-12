<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

## 1. Purpose

This repository contains the **After-School Care Workflow System**, a mobile-first internal system for after-school care / tuition-centre staff.

The system helps multiple teachers collaboratively manage:

* student daily care
* homework
* corrections
* dictation
* student issues
* tuition schedules
* final checks
* parent contact
* student release
* printable care sheets
* future AI teacher assistance

Before making significant changes, read:

```text
plan.md
```

`plan.md` is the main product and requirement source of truth.

---

# 2. Core Product Principle

The system is not primarily a school ERP.

It is an:

> **Teacher Attention Management System**

The key question the UI should answer is:

> **Who still needs the teacher's attention right now?**

Design and implementation decisions should support this goal.

---

# 3. UX Principles

Always follow these principles.

## 3.1 Mobile First

Teachers are expected to use the system mainly on phones.

All important workflows must work comfortably on small screens.

Do not design desktop-first screens and then shrink them.

---

## 3.2 Minimize Teacher Interaction Cost

Core rule:

> **Normal case = one tap. Exception = system remembers it.**

Avoid requiring users to update unnecessary intermediate states.

Example:

Do not create:

```text
NOT_STARTED
DOING
WAITING_FOR_CHECK
CHECKING
CORRECTING
WAITING_FOR_RECHECK
COMPLETED
```

when the actual workflow only needs:

```text
PENDING
CORRECTION_REQUIRED
COMPLETED
```

---

## 3.3 Do Not Mirror Database Structure Directly Into UI

Database entities should not automatically become navigation items or pages.

Navigation should follow teacher workflows.

Do not create a sidebar item for every table.

---

## 3.4 Prefer Contextual Actions

Actions should appear where they are needed.

Example:

```text
数学活动本 P44

[Complete]
[Correction]
[Ask AI]
```

Avoid forcing users to navigate to separate management screens for simple actions.

---

## 3.5 Status Must Be Easy to Scan

Use consistent visual language:

```text
Green  = completed
Amber  = needs correction / recheck
Red    = urgent
Gray   = pending / inactive
Blue   = primary actions
```

Do not use colors decoratively if they reduce clarity.

---

# 4. Technology Stack

Use the existing project stack unless explicitly instructed otherwise.

## Core

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide Icons
```

## Data

```text
PostgreSQL
Supabase
Drizzle ORM
```

## Forms / Validation

```text
React Hook Form
Zod
```

## Data UI

```text
TanStack Table
```

## Utility

```text
date-fns
```

## Testing

```text
Vitest
Playwright
```

## Deployment

```text
Vercel
```

Do not introduce alternative frameworks without a clear technical reason.

---

# 5. Architecture Rules

## 5.1 Keep the Architecture Simple

This is currently a single application.

Do not introduce:

```text
microservices
Kafka
Redis
GraphQL
Kubernetes
separate backend repository
event buses
complex CQRS
```

unless explicitly requested.

---

## 5.2 Use Next.js as the Full-Stack Application Layer

Prefer:

```text
Next.js
├── UI
├── Server Components
├── Server Actions / Route Handlers
└── Application Logic
```

Do not add Express or NestJS unless there is a concrete requirement.

---

## 5.3 PostgreSQL Is the Source of Truth

Do not store important business state only in:

```text
localStorage
client state
Zustand
browser memory
```

Shared student data must live in PostgreSQL.

---

## 5.4 Client State Is Not Business State

Client state may be used for:

* open dialogs
* selected rows
* temporary filters
* form state
* UI preferences

Do not use client state as the authoritative source for:

* homework completion
* dictation completion
* care status
* release status
* parent contact status

---

# 6. Authentication Rules

Authentication uses Supabase Auth.

Each real staff member should have their own account.

Initial roles:

```text
ADMIN
STAFF
```

Do not add complex RBAC unless required.

---

## STAFF

Can perform daily operations:

* view students
* update care
* check homework
* manage corrections
* manage dictation
* record issues
* final check
* parent contact
* release workflow

---

## ADMIN

Can additionally:

* manage staff
* manage schools
* manage school classes
* manage subjects
* manage system configuration

---

# 7. Authorization Rules

Never trust client-side role checks alone.

Sensitive actions must be protected server-side.

Bad:

```ts
if (user.role === "ADMIN") {
  showDeleteButton();
}
```

This is only UI protection.

Server-side logic must independently confirm authorization.

---

# 8. Multi-User Collaboration Rules

Multiple teachers may manage the same student.

Do not design student ownership around one teacher.

Correct model:

```text
Multiple Staff
     ↓
Shared Student Context
```

Not:

```text
Student belongs to Teacher A
```

---

# 9. Realtime Rules

Realtime is useful for operational shared-state tables.

Prioritize realtime for:

```text
student_homework
student_dictation
daily_student_records
student_issues
```

Do not enable realtime everywhere by default.

Static or rarely changing data such as:

```text
subjects
schools
answer_resources
```

usually does not require realtime.

---

# 10. Business Rule Enforcement

Business rules must be enforced in application/server logic where relevant.

Do not rely only on UI.

---

## Homework

A student saying the homework is done does not mean:

```text
COMPLETED
```

Homework becomes completed only after teacher verification.

---

## Correction

If homework is marked:

```text
CORRECTION_REQUIRED
```

it must not count as completed.

It must be rechecked by a teacher before becoming:

```text
COMPLETED
```

---

## Dictation

Dictation can only be:

```text
COMPLETED
```

after the teacher confirms full correctness.

Do not infer completion merely from an attempted score.

---

## Bag Check

Class homework existing does not mean the student's bag has been checked.

Bag check is student-specific.

---

## Final Release

Normal release requires completion of the expected workflow.

If the student leaves with unfinished work:

```text
releaseStatus = INCOMPLETE
```

and the exception reason must be preserved.

Do not silently convert incomplete release into completed workflow.

---

# 11. Attention Engine Rules

Attention should be derived from underlying data whenever possible.

Do not manually maintain duplicated attention state unless there is a strong reason.

Examples:

```text
arrived = true
AND
bagChecked = false

→ Bag Check Attention
```

```text
studentHomework.status = CORRECTION_REQUIRED

→ Homework Recheck Attention
```

```text
dictation due next school day
AND
status != COMPLETED

→ Urgent Dictation Attention
```

```text
studentIssue.status = OPEN

→ Issue Attention
```

When the underlying condition is resolved, the attention item should disappear automatically.

---

# 12. Avoid Duplicate State

Do not create separate fields that represent the same business fact unless necessary.

Bad example:

```text
homework.status = COMPLETED
attention.isResolved = false
```

This creates synchronization problems.

Prefer deriving attention from homework status.

---

# 13. Data Integrity Rules

Use:

```text
PRIMARY KEY
FOREIGN KEY
UNIQUE
NOT NULL
CHECK
```

where appropriate.

Do not rely only on TypeScript validation.

---

## Example

Daily student record should enforce:

```text
UNIQUE(student_id, date)
```

so one student cannot accidentally have multiple daily records for the same date.

---

# 14. Historical Data Rules

Do not hard-delete historical operational records.

Prefer:

```text
ACTIVE
INACTIVE
```

for:

* students
* staff
* schools
* school classes
* subjects

Historical records must remain readable.

---

## Example

If Jason moves from:

```text
2H
```

to:

```text
2M
```

historical September records must still represent his original class context correctly.

---

# 15. Audit Fields

Important actions should store relevant audit information.

Use fields such as:

```text
createdBy
createdAt

updatedBy
updatedAt

checkedBy
checkedAt

verifiedBy
verifiedAt

resolvedBy
resolvedAt

approvedBy
```

Do not add audit data blindly to every table, but preserve it for meaningful staff actions.

---

# 16. Database Naming

Use consistent naming.

Recommended database naming:

```text
snake_case
```

Example:

```text
student_homework
daily_student_records
school_classes
```

TypeScript naming:

```text
camelCase
```

Example:

```ts
studentHomework
dailyStudentRecord
schoolClass
```

---

# 17. TypeScript Rules

Use strict TypeScript.

Avoid:

```ts
any
```

unless absolutely necessary.

Prefer explicit domain types.

Bad:

```ts
const status: string = ...
```

Better:

```ts
type HomeworkStatus =
  | "PENDING"
  | "CORRECTION_REQUIRED"
  | "COMPLETED";
```

---

# 18. Validation Rules

All user-provided input must be validated.

Use Zod for:

* forms
* route input
* server actions
* API payloads

Client validation improves UX.

Server validation protects the system.

Both may be required.

---

# 19. Forms

Use React Hook Form for non-trivial forms.

Avoid creating many independent `useState()` calls when a form library is more appropriate.

Forms must include:

* validation errors
* submission loading state
* success state
* failure state

---

# 20. Components

Prefer reusable domain components.

Examples:

```text
StudentStatusCard
HomeworkTaskRow
DictationStatusBadge
AttentionItemCard
DailyCareRow
StudentQuickView
```

Do not abstract too early.

A component should normally be extracted when:

* reused
* logically independent
* significantly improves readability

---

# 21. shadcn/ui

Prefer existing shadcn components before building custom primitives.

Examples:

```text
Button
Card
Sheet
Drawer
Dialog
Input
Select
Badge
Table
Tabs
DropdownMenu
Command
Skeleton
```

Do not modify base shadcn components in ways that make future maintenance difficult unless necessary.

---

# 22. Mobile Interaction Rules

Touch targets must be comfortable.

Avoid tiny icon-only buttons for primary actions.

Important actions such as:

```text
Complete
Correction
Bag Checked
Parent Contacted
```

must be easy to tap quickly.

---

# 23. Desktop vs Mobile

Desktop and mobile may use different layouts.

Example:

Desktop:

```text
Sidebar
+
Wide table
```

Mobile:

```text
Bottom navigation
+
Student cards
+
Sheets / Drawers
```

Do not force one layout to work identically everywhere.

---

# 24. Daily Care UI

Digital Care View and Print Care Sheet are separate presentations of the same data.

Do not create a separate source of truth for printing.

Architecture:

```text
Database
   ↓
Daily Care Data
   ├── Digital UI
   └── Print UI
```

---

# 25. Printing Rules

Print layout should be optimized for paper, not the screen.

Use:

```css
@media print
```

and where appropriate:

```css
@page
```

Print page should remove:

* navigation
* buttons
* sidebar
* shadows
* unnecessary decoration

Target:

```text
A4 Landscape
```

unless the final care sheet design specifies otherwise.

---

# 26. AI Teacher Assistant Rules

AI assistance is a future/supporting feature.

It must not become the central application architecture.

AI may assist with:

* answering questions
* explaining solutions
* simplifying explanations for children
* consulting answer resources
* generating suggested parent messages

AI output must be treated as a suggestion.

Do not automatically use AI output as verified academic truth.

---

# 27. AI Integration Boundaries

Do not send unnecessary student personal data to AI services.

When a question can be answered using only the homework content, avoid sending:

* student's full name
* parent phone
* unrelated personal notes

Minimize transmitted data.

---

# 28. Loading States

Every async page or action should handle loading appropriately.

Use:

* Skeletons
* Spinner where suitable
* Disabled submit buttons
* Optimistic updates only when safe

Do not leave the user wondering whether an action happened.

---

# 29. Error Handling

Do not silently swallow errors.

Provide clear user-facing errors.

Example:

```text
Unable to update homework status.
Please try again.
```

Log sufficient technical context for debugging without exposing sensitive details to users.

---

# 30. Empty States

Every major list should have an intentional empty state.

Examples:

```text
No homework recorded for today.
```

```text
No students need attention.
```

```text
No answer resources found.
```

Avoid blank screens.

---

# 31. Optimistic UI

Optimistic updates can be used for very simple reversible actions such as:

```text
tick meal
tick shower
mark homework completed
```

but must revert on server failure.

Do not show success permanently before the server confirms it.

---

# 32. Concurrent Updates

Multiple staff may update the same student at approximately the same time.

At minimum preserve:

```text
updatedAt
updatedBy
```

Do not assume only one user edits the system.

If a feature is particularly sensitive to concurrent changes, consider optimistic concurrency control.

Do not introduce complex locking without a demonstrated need.

---

# 33. Query Design

Avoid N+1 queries.

When displaying a class page, fetch the relevant:

* students
* homework
* homework statuses
* dictation
* daily status

efficiently.

Do not perform one database request per row when the data can be fetched together.

---

# 34. Performance

Do not prematurely optimize.

First prioritize:

* correctness
* clarity
* maintainability
* low interaction cost

Optimize after identifying a real bottleneck.

---

# 35. Accessibility

Use semantic HTML.

Ensure:

* labels for forms
* keyboard navigation where appropriate
* sufficient contrast
* meaningful button text
* icons accompanied by accessible labels when necessary

---

# 36. Dependencies

Before adding a dependency, ask:

1. Is this already possible with the current stack?
2. Is the dependency actively maintained?
3. Does it meaningfully simplify the implementation?
4. Is it worth increasing project complexity?

Do not add libraries for trivial functionality.

---

# 37. Git Rules

Before major changes, work in a clean Git state.

Keep commits focused.

Recommended commit style:

```text
feat: add class homework creation
fix: prevent duplicate daily records
refactor: extract attention query
test: add correction workflow tests
```

Avoid giant commits mixing unrelated work.

---

# 38. Scope Control

Do not implement future ideas automatically.

Examples currently outside MVP:

```text
Parent Portal
Student Login
Payment
Payroll
Transport
Accounting
Advanced Analytics
Native Mobile App
Complex Notifications
AI Tutor
```

If not present in the current task or `plan.md`, do not build it.

---

# 39. Feature Implementation Workflow

For each feature:

```text
1. Read relevant requirements
2. Identify relevant business rules
3. Inspect existing architecture
4. Inspect existing schema
5. Make the smallest coherent implementation
6. Validate input
7. Handle authorization
8. Handle loading/error states
9. Add/update tests
10. Run quality checks
11. Summarize changes
```

---

# 40. Required Checks Before Completion

Before declaring a task complete, run applicable checks:

```text
lint
typecheck
tests
build
```

If a check cannot be run, state why.

Do not claim success when the project does not compile.

---

# 41. Agent Change Reporting

After implementing a task, report:

```text
What changed
Files changed
Database changes
New dependencies
Tests added
Checks run
Known limitations
```

Keep the report concise.

---

# 42. Do Not Rewrite Unrelated Code

When asked to implement one feature:

Do not:

* rename unrelated files
* redesign unrelated pages
* reformat the entire repository
* replace established architecture
* modify unrelated database tables

Keep changes scoped.

---

# 43. Do Not Invent Requirements

If a product decision is not defined in `plan.md`, existing code, or the task request:

Prefer the simplest reasonable behavior.

Do not invent major new workflows.

For important product ambiguities, clearly flag the assumption in the implementation summary.

---

# 44. Preferred Domain Language

Use terminology consistently.

Preferred:

```text
Student
Staff
School
School Class
Homework Task
Student Homework
Dictation Task
Student Dictation
Daily Care
Attention
Student Issue
Final Check
Release
Answer Resource
Tuition Session
```

Avoid creating multiple names for the same concept.

For example, do not alternate between:

```text
HomeworkItem
Assignment
Task
SchoolWork
```

if the established domain term is:

```text
HomeworkTask
```

---

# 45. Core Domain Reminder

The application should support this real-world daily flow:

```text
Staff Login
↓
Student Arrives
↓
Bag Check
↓
Homework Identified
↓
Homework Recorded
↓
Student Works
↓
Teacher Checks
↓
Correction if needed
↓
Recheck
↓
Dictation
↓
Attention Dashboard tracks unresolved work
↓
Final Check
↓
Parent Contact
↓
Student Release
↓
Daily Care Sheet can be printed
```

Any implementation that makes this flow substantially harder should be reconsidered.

---

# 46. Final Rule

When choosing between:

```text
technically impressive
```

and:

```text
easy for a busy teacher to use
```

prefer:

> **easy for a busy teacher to use.**
