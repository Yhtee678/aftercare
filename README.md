# After-School Care Workflow System

A mobile-first workflow management system for after-school care and tuition centres.

The system helps multiple teachers collaboratively manage students' daily care, homework, corrections, dictation, unresolved issues, final checks, parent communication, and student release.

Its central goal is simple:

> **Help teachers manage many students without having to remember everything.**

---

## Overview

Traditional student management systems focus heavily on records and administration.

This project focuses on **daily teacher workflow and attention management**.

The system helps answer:

> **Who still needs the teacher's attention right now?**

Typical workflow:

```text
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
Correction / Recheck
      ↓
Dictation
      ↓
Final Check
      ↓
Parent Contact
      ↓
Student Release
```

Unresolved work is automatically surfaced through the **Attention Dashboard**.

---

# Tech Stack

## Application

* Next.js
* React
* TypeScript

## UI

* Tailwind CSS
* shadcn/ui
* Lucide Icons
* TanStack Table

## Forms & Validation

* React Hook Form
* Zod

## Backend & Database

* Supabase
* PostgreSQL
* Drizzle ORM

## Authentication

* Supabase Auth

## Realtime

* Supabase Realtime

## File Storage

* Supabase Storage

## Testing

* Vitest
* Playwright

## Deployment

* Vercel

---

# Repository Documentation

Before contributing, read the following files.

### `plan.md`

Contains:

* product requirements
* feature scope
* business rules
* data models
* ERD
* UI/UX direction
* implementation roadmap

This is the main **product source of truth**.

---

### `AGENTS.md`

Contains:

* architecture rules
* coding conventions
* agent instructions
* UX principles
* database rules
* authentication rules
* realtime rules
* testing requirements

Coding agents should read this file before making changes.

---

# Getting Started

## 1. Clone Repository

```bash
git clone <repository-url>
cd <repository-name>
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create:

```text
.env.local
```

Use `.env.example` as the reference:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Do not commit `.env.local`.

---

# Environment Variables

Expected environment variables may include:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

DATABASE_URL=
```

Additional variables should be documented here when integrations are added.

Never commit production secrets.

---

# Supabase Setup

Create a Supabase project and configure:

```text
PostgreSQL Database
Supabase Auth
Supabase Realtime
Supabase Storage
```

---

## Authentication

Initial authentication method:

```text
Email + Password
```

Initial roles:

```text
ADMIN
STAFF
```

Each staff member should use their own account.

---

# Database Setup

The application uses:

```text
PostgreSQL
+
Drizzle ORM
```

Database schema should be maintained through Drizzle migrations.

Do not manually change the production database schema without a corresponding migration.

---

## Generate Migration

Depending on the configured package scripts:

```bash
npm run db:generate
```

---

## Apply Migration

```bash
npm run db:migrate
```

Exact commands should follow the scripts defined in `package.json`.

---

# Seed Database

Development should use realistic seed data.

Recommended seed data includes:

```text
Schools
├── 中化三小
└── 中化一小

Classes
├── 1H
├── 1B
├── 2M
├── 2H
├── 2B
├── 3H
├── 3B
├── 4M
├── 4H
└── 4B
```

Seed approximately:

```text
20–30 students
```

Include different states such as:

* completed homework
* homework awaiting correction
* homework awaiting recheck
* upcoming dictation
* unchecked school bag
* missing workbook
* student attending tuition
* student ready for release

This makes development and testing closer to the real workflow.

---

# Run Development Server

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# Development Commands

Typical commands:

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
```

E2E tests:

```bash
npm run test:e2e
```

The exact available commands are defined in:

```text
package.json
```

---

# Suggested Project Structure

```text
src/
│
├── app/
│   ├── login/
│   ├── today/
│   ├── students/
│   ├── classes/
│   ├── homework/
│   ├── care/
│   ├── dictation/
│   ├── answers/
│   ├── reports/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── students/
│   ├── homework/
│   ├── care/
│   ├── dictation/
│   └── attention/
│
├── db/
│   ├── schema/
│   ├── migrations/
│   └── queries/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── validation/
│   ├── attention/
│   └── utils/
│
├── actions/
│
├── hooks/
│
├── types/
│
└── tests/
```

The actual repository structure may evolve as the application grows.

Avoid introducing unnecessary architectural layers.

---

# Core Modules

The application is organized around the following domains:

```text
Student & Class Management
Daily Care
Homework
Dictation
Attention
Student Issues
Tuition Schedule
Final Check
Parent Contact
Student Release
Answer Library
Print Care Sheet
```

Future:

```text
AI Teacher Assistant
```

For detailed requirements, see:

```text
plan.md
```

---

# Realtime Collaboration

The application supports multiple teachers working with the same students.

Example:

```text
Teacher A
    │
    │ Marks homework complete
    ▼
PostgreSQL
    │
    │ Realtime event
    ▼
Teacher B
```

Teacher B should receive the updated operational state without manually refreshing where realtime is enabled.

Realtime should primarily be used for operational data such as:

```text
student_homework
student_dictation
daily_student_records
student_issues
```

---

# Source of Truth

PostgreSQL is the authoritative source for shared business data.

Do not use the following as the authoritative source for operational state:

```text
localStorage
Zustand
React state
browser memory
```

Those may be used for temporary UI state only.

---

# Printing

The system includes a printable Daily Care Sheet.

Printing should use browser-native printing:

```js
window.print()
```

with:

```css
@media print
```

and:

```css
@page
```

where appropriate.

Initial target:

```text
A4 Landscape
```

Users should be able to:

```text
Print to physical printer
```

or:

```text
Save as PDF
```

The print view and digital view use the same underlying database data.

---

# UI Philosophy

The application should feel:

> **Calm · Fast · Contextual · Operational**

It should not feel like a traditional enterprise ERP.

Avoid unnecessary:

* analytics charts
* dashboard decoration
* gradients
* animations
* excessive cards
* deep navigation
* tiny action buttons

The interface should help a busy teacher understand within seconds:

```text
Who?
What needs attention?
How urgent is it?
What should I press?
```

---

# Mobile First

The primary operational interface should work well on mobile devices.

Desktop may use:

```text
Sidebar + Tables
```

Mobile may use:

```text
Bottom Navigation + Cards + Sheets
```

Do not simply shrink desktop layouts onto mobile screens.

---

# Development Workflow

For each feature:

```text
Read requirement
      ↓
Check business rules
      ↓
Inspect existing code
      ↓
Implement smallest coherent change
      ↓
Validate
      ↓
Test
      ↓
Lint / Typecheck
      ↓
Review
      ↓
Commit
```

---

# Recommended Git Workflow

Create a feature branch:

```bash
git checkout -b feat/homework-management
```

Example commit messages:

```text
feat: add class homework creation

feat: add daily care bulk actions

fix: prevent duplicate daily student records

fix: clear attention after homework recheck

refactor: extract attention query logic

test: add student release workflow tests
```

Keep commits focused.

---

# Coding Agent Workflow

When using Cursor, Claude Code, Codex, or another coding agent:

## Step 1

Ask the agent to read:

```text
AGENTS.md
plan.md
README.md
```

before implementing major features.

---

## Step 2

Give the agent one coherent task.

Good:

```text
Implement class-level homework creation according to
plan.md.

Include:
- form
- Zod validation
- server-side mutation
- automatic StudentHomework creation
- loading/error states
- relevant tests

Follow AGENTS.md.
```

Bad:

```text
Build the entire system.
```

---

## Step 3

Review the changes.

Check:

```text
What files changed?
Did database schema change?
Did the agent add dependencies?
Are business rules preserved?
Does mobile UI still work?
```

---

## Step 4

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

before accepting major changes.

---

## Step 5

Commit working changes before moving to the next feature.

This makes AI-generated changes easier to review and revert.

---

# Testing

Important business rules should have automated tests.

Examples:

### Homework Correction

```text
Homework
→ CORRECTION_REQUIRED

Expected:
Not counted as completed
Appears in Attention
```

After recheck:

```text
Homework
→ COMPLETED

Expected:
Counts as completed
Disappears from Attention
```

---

### Bag Check

```text
Student Arrived
+
Bag Not Checked

Expected:
Appears in Attention
```

---

### Dictation

```text
Dictation scheduled for next school day
+
Not completed

Expected:
High-priority Attention
```

---

### Release

```text
Student has incomplete work
+
Leaves centre

Expected:
INCOMPLETE release
Reason required
Incomplete tasks preserved
Parent contact recorded
```

---

# Deployment

Recommended deployment:

```text
GitHub
   ↓
Vercel
   ↓
Next.js Application
   ↓
Supabase
   ├── PostgreSQL
   ├── Auth
   ├── Realtime
   └── Storage
```

Connect the GitHub repository to Vercel.

Configure production environment variables in the Vercel project settings.

Do not expose server secrets through variables prefixed with:

```text
NEXT_PUBLIC_
```

unless the value is explicitly intended to be public.

---

# Security

The system may contain:

* student information
* parent contact information
* staff accounts
* daily activity records

Therefore:

* authentication must protect operational pages
* authorization must be enforced server-side
* secrets must not be committed
* unnecessary personal information must not be sent to AI services
* user input must be validated
* database access must follow appropriate security policies

---

# MVP Definition

The MVP is successful when it can support one realistic after-school care day:

```text
Staff Login
      ↓
Student Arrival
      ↓
Daily Care
      ↓
Homework Entry
      ↓
Homework Checking
      ↓
Correction / Recheck
      ↓
Dictation
      ↓
Attention Management
      ↓
Final Check
      ↓
Parent Contact
      ↓
Student Release
      ↓
Print Care Sheet
```

The goal is not to build the largest possible management system.

The goal is to make the real daily workflow easier.

---

# Future Features

Potential future improvements include:

* AI Teacher Assistant
* Answer Library RAG
* PWA support
* push notifications
* WhatsApp integration
* weekly summaries
* student history
* advanced reporting
* parent portal
* more detailed audit logs

These should not be implemented until the core workflow is stable and validated through actual use.

---

# Project Philosophy

When choosing between something that is technically impressive and something that is easier for a busy teacher to use:

> **Choose the simpler workflow.**

The system should remember unresolved work so teachers do not have to.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
