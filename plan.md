# After-School Care Workflow System

## 1. 项目概述 (Project Overview)

### 一句话描述

After-School Care Workflow System 是一个面向安亲班 / 托育中心老师的移动优先内部管理系统，用于统一管理学生每日托育流程、学校功课、听写、订正、异常事项、家长联系与离开状态，并通过 Attention Dashboard 帮助老师避免遗漏需要继续跟进的学生。

系统支持多名老师同时在不同设备操作同一批学生，并同步最新状态。

未来可加入 AI Teacher Assistant，协助老师解题、解释答案及参考答案资料。

---

### 核心问题

目前安亲班老师通常同时照顾大量不同年级、不同学校、不同班级的学生。

每天需要处理：

- 学生到班
- 吃饭
- 冲凉
- 检查书包
- 查看学校功课
- 记录功课
- 教导不会的题目
- 检查功课
- 要求学生订正
- 再次检查订正
- 学校听写
- 补习听写
- 学生补习课
- 家长联系
- 学生离开

现有流程通常依赖：

- 手写托育表
- 功课簿
- 听写簿
- WhatsApp
- 老师自己的记忆

最大的痛点并不是“没有记录”，而是：

> 老师必须同时记住很多学生目前进行到哪里、谁还需要检查、谁正在订正、谁明天有听写、谁还没有检查书包。

因此系统的核心价值是：

> **Help teachers manage many students without having to remember everything.**

---

## 2. 产品设计原则 (Product Principles)

### Core Principle

**Normal case = one tap. Exception = system remembers it.**

正常情况尽量减少操作次数。

系统不应该要求老师为了记录每一个微小步骤而不断操作手机。

系统应该重点记录：

- 尚未完成
- 需要订正
- 需要复查
- 明天要听写
- 书包未检查
- 缺少材料
- 尚未联系家长
- 其他尚未解决事项

---

### Attention-Oriented Design

传统 School Management System 的核心通常是：

> Records

本系统的核心应该是：

> **Attention**

首页必须优先回答：

> 现在还有谁需要老师处理？

---

### Student Context Follows the Student

学生不会固定属于某一名老师。

多名老师可以共同照顾同一个学生。

因此：

> Context follows the student, not the teacher.

---

## 3. 技术栈 (Tech Stack)

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

---

### Table / Data UI

- TanStack Table

用于：

- Daily Care Table
- Student Table
- Bulk Operations
- Reports
- Printable Care Sheet Preview

---

### Forms & Validation

- React Hook Form
- Zod

---

### Database

- PostgreSQL

---

### Backend Platform

- Supabase

Supabase 用于：

- PostgreSQL hosting
- Authentication
- Realtime
- Storage

---

### ORM

- Drizzle ORM

---

### Authentication

- Supabase Auth

第一版：

- Email
- Password

Roles：

```text
ADMIN
STAFF
```

---

### Realtime

- Supabase Realtime

用于同步：

- Homework status
- Dictation status
- Daily care status
- Student issues

例如：

```text
Teacher A 手机：
Jason Math → Completed

↓

PostgreSQL Update

↓

Supabase Realtime

↓

Teacher B 手机自动显示：
Jason Math ✓
```

---

### File Storage

- Supabase Storage

用于：

- Answer PDFs
- Future uploaded learning resources

---

### Printing

第一版：

- Browser `window.print()`
- CSS `@media print`
- CSS `@page`

不使用复杂 PDF library。

未来如需要复杂分页：

- Paged.js（Optional）

---

### Date Handling

- date-fns

---

### State Management

优先使用：

- Server State
- React Local State

Zustand 只在真正需要共享客户端状态时使用。

不要为了使用 Zustand 而使用 Zustand。

---

### Deployment

- Vercel

---

### Version Control

- Git
- GitHub

---

### Testing

- Vitest
- Playwright

---

### Tooling

- ESLint
- Prettier

---

### AI Coding

项目主要允许使用 coding agents / vibe coding，例如：

- Cursor
- Claude Code
- Codex
- Other coding agents

Coding agent 必须遵守：

- `plan.md`
- `AGENTS.md`
- Business Rules
- Database Schema
- Existing architecture

---

## 4. 用户角色 (User Roles)

### STAFF

普通老师 / 助教可以：

- 查看学生
- 查看班级
- 更新托育状态
- 查看与记录功课
- 检查功课
- 标记订正
- 重新检查订正
- 管理听写状态
- 记录学生异常
- 查看 Attention Dashboard
- Final Check
- 联系家长
- 查看答案资料

---

### ADMIN

拥有 STAFF 所有权限，并可以：

- 创建 Staff Account
- 停用 Staff Account
- 管理 School
- 管理 School Class
- 管理 Student
- 管理 Answer Resources
- 修改系统基本设置

---

## 5. 核心功能边界 (In-Scope)

# Module 1 — Student & Class Management

系统可以：

- 创建学生
- 编辑学生
- 停用学生
- 搜索学生
- 按学校筛选
- 按年级筛选
- 按班级筛选
- 管理学校
- 管理学校班级
- 保存家长联系方式
- 保存学生备注
- 保存学生固定补习时间表

Hierarchy：

```text
School
↓
School Class
↓
Student
```

例如：

```text
中化三小
└── Year 2
    ├── 2M
    ├── 2H
    └── 2B
```

---

# Module 2 — Daily Care Management

每日托育流程包括：

- 到班
- 吃饭
- 冲凉
- 书包检查
- Final Check
- Parent Contact
- Release

老师可以：

- Mark student arrived
- Mark meal completed
- Mark shower completed
- Mark bag checked
- 批量更新状态
- 查看年级 / 班级每日托育状态
- Print 托育表

---

# Module 3 — Homework Management

老师可以：

- 为学校班级创建当天功课
- 一次输入功课后自动分配给同班所有学生
- 为单独学生加入额外任务
- Mark homework completed
- Mark correction required
- Recheck correction
- 查看学生功课完成状态
- 查看整个班级完成进度

Example：

```text
中化三小 · 2H

今日功课

华文活动本 P20–22
数学活动本 P44
英文作业
生字
```

自动应用给：

```text
Jason
Amy
Ryan
...
```

---

### Homework Status

```text
PENDING
CORRECTION_REQUIRED
COMPLETED
```

---

# Module 4 — Dictation Management

支持：

- 听写
- 默写
- Ejaan
- Spelling
- Rencana
- Dictation
- Tuition Dictation
- Other

老师可以：

- 为整个班建立 Dictation Task
- 为单独学生建立 Dictation Task
- 设置 scheduled date
- 标记未完成
- 标记尚未全对
- 标记完成
- 查看即将到期的听写任务

---

### Dictation Status

```text
PENDING
NEEDS_PRACTICE
COMPLETED
```

---

# Module 5 — Attention Dashboard

系统自动识别需要老师继续处理的事项。

Attention 不需要老师手动创建。

Example：

```text
🔴 URGENT

Jason · 2H
华文听写 · Tomorrow
尚未完成

────────────────

🟠 NEEDS ATTENTION

Amy · 2H
数学活动本 P44
待复查

Ryan · 3B
书包尚未检查

────────────────

⚠ ISSUES

Daniel · 3H
科学活动本没有带
Parent 未联系
```

---

### Attention Sources

Attention 根据以下状态自动产生：

```text
Arrived + Bag Not Checked
→ Attention
```

```text
Homework = CORRECTION_REQUIRED
→ Attention
```

```text
Dictation due next school day
AND status != COMPLETED
→ High Priority Attention
```

```text
Student Issue = OPEN
→ Attention
```

Underlying issue 解决后 Attention 自动消失。

---

# Module 6 — Student Issues

老师可以记录特殊情况，例如：

```text
BOOK_NOT_BROUGHT
WORKBOOK_FINISHED
MISSING_MATERIAL
OTHER
```

每个 issue 可以记录：

- Description
- Parent contact required
- Parent contacted
- Status
- Created by
- Resolved by
- Created time
- Resolved time

---

# Module 7 — Tuition Schedule

School Class 和 Centre Tuition 必须分开。

例如：

```text
School Class:
中化三小 · 1H

Centre Tuition:
Tuesday 2:30 PM – 3:30 PM
```

一个学生可以参加多个 Tuition Sessions。

---

# Module 8 — Final Check & Student Release

正常流程：

```text
Homework Completed
        ↓
Dictation Completed
        ↓
Corrections Resolved
        ↓
Final Check
        ↓
Parent Contact
        ↓
Ready to Go
```

---

### Exceptional Release

允许学生在任务未完成时离开。

必须记录：

- Incomplete Tasks
- Reason
- Parent Contacted
- Remark

状态：

```text
RELEASED_NORMAL
RELEASED_INCOMPLETE
```

---

# Module 9 — Answer Library

用于存放老师需要参考的答案资料。

组织方式：

```text
Academic Year
↓
Grade
↓
Subject
↓
Book
↓
PDF
```

老师可以：

- Browse
- Search
- Open PDF
- Upload PDF
- Categorize Resource

---

# Module 10 — Print Care Sheet

Daily Care 必须提供 Print 功能。

Digital View：

```text
Year 2 · Today

        到班  吃饭  冲凉  书包  功课  听写
Jason    ✓     ✓     ✓     ✓     ◐     ✓
Amy      ✓     ✓     ✓     ✓     ✓     ✓
Ryan     ✓     ✓     ✓     ⚠     ◐     ✓
```

Print View：

```text
                    每日托育表

日期：____________       年级：____________

┌──────┬────┬────┬────┬────┬──────┬──────┬────┬────┐
│ 姓名 │到班│吃饭│冲凉│书包│学校听写│补习听写│功课│备注│
├──────┼────┼────┼────┼────┼──────┼──────┼────┼────┤
│      │    │    │    │    │      │      │    │    │
└──────┴────┴────┴────┴────┴──────┴──────┴────┴────┘
```

Print page：

```text
/app/care/print
```

要求：

- A4
- 优先 landscape
- No sidebar
- No navbar
- No buttons
- No shadows
- Print-friendly
- Save as PDF compatible

---

# Module 11 — AI Teacher Assistant (Phase 2)

AI 必须作为辅助功能，不是系统核心。

老师可以：

- 拍摄题目
- 输入题目
- 请求答案
- 请求简单解释
- 请求适合小学生的解释方式

未来可结合 Answer Library：

```text
Teacher Question
      ↓
Search Internal Answer Resources
      ↓
Retrieve Relevant Content
      ↓
LLM
      ↓
Suggested Answer
```

---

### AI Entry Point

AI 不应该占据首页。

应该 contextual。

例如：

```text
数学活动本 P44

[✓ Complete]
[订正]
[✨ Ask AI]
```

---

## 6. Out of Scope — MVP

第一版本不做：

- Parent Portal
- Student Login
- Online Payment
- Payroll
- Accounting
- Transport Management
- Full Exam Result System
- AI Student Tutor
- Automatic WhatsApp Business API
- Complex RBAC
- Push Notification System
- Microservices
- Native Mobile App
- React Native
- Flutter
- Redis
- Kafka
- Kubernetes
- GraphQL

---

## 7. Business Rules

### BR1 — Student Class

每名 active student 必须属于明确的：

```text
School + Grade + School Class
```

---

### BR2 — School Class Identity

相同班级名称在不同学校属于不同班级。

```text
中化三小 · 1B
≠
中化一小 · 1B
```

---

### BR3 — Shared Student Responsibility

学生不属于单一老师。

所有 authorized staff 都可以照顾与更新学生状态。

---

### BR4 — Daily Record

Daily Care 状态每天独立。

昨天的状态不能影响今天。

---

### BR5 — Arrival

只有已经到班的学生才进入当天 active workflow。

---

### BR6 — Bag Check

同班已经记录功课，不代表某位学生已经完成 Bag Check。

Bag Check 必须 individually confirmed。

---

### BR7 — Class Homework

同一个 School Class 的 class-level homework 自动应用给所有该班 active students。

---

### BR8 — Individual Homework

Individual homework 不影响其他同班学生。

---

### BR9 — Homework Completion

学生自己完成功课不代表 Completed。

必须经过老师检查。

```text
Done by student
≠
Checked by teacher
```

---

### BR10 — Correction

如果老师发现错误：

```text
Homework
↓
CORRECTION_REQUIRED
```

不得计入 Completed。

---

### BR11 — Recheck

订正后必须经过老师重新检查才能：

```text
COMPLETED
```

---

### BR12 — Shared Recheck

不要求原本检查的老师负责重新检查。

任何 authorized staff 都可以 recheck。

---

### BR13 — Dictation

Dictation 必须最终全部正确才能：

```text
COMPLETED
```

---

### BR14 — Dictation Priority

Scheduled Date 越接近，priority 越高。

Next school day 未完成的 dictation 属于 high priority。

---

### BR15 — Attention

Attention 必须由 underlying data 自动推导。

不要求老师手动 mark Attention completed。

---

### BR16 — Attention Resolution

Underlying issue 解决后对应 Attention 自动消失。

---

### BR17 — No Duplicate Attention

同一个 unresolved issue 不得产生重复 Attention。

---

### BR18 — Final Completion

正常情况下：

```text
All Homework Completed
AND
All Corrections Resolved
AND
Required Dictations Completed
```

之后才能进入 Final Check。

---

### BR19 — Final Check

Academic tasks 全部完成不代表学生可以直接离开。

必须经过 Final Check。

---

### BR20 — Exceptional Release

未完成任务也允许离开，但必须：

- 记录原因
- 保留 incomplete tasks
- 确认家长已知情

---

### BR21 — Parent Contact

Open WhatsApp 不代表 Parent Contacted。

必须由 staff 手动确认。

---

### BR22 — Historical Records

学生未来换班不得影响过去 daily records。

---

## 8. 数据模型 (Data Models)

### Staff

```ts
interface Staff {
  id: string;
  authUserId: string;

  name: string;
  email: string;

  role: "ADMIN" | "STAFF";

  status: "ACTIVE" | "INACTIVE";

  createdAt: string;
  updatedAt: string;
}
```

---

### School

```ts
interface School {
  id: string;

  name: string;

  status: "ACTIVE" | "INACTIVE";

  createdAt: string;
  updatedAt: string;
}
```

---

### SchoolClass

```ts
interface SchoolClass {
  id: string;

  schoolId: string;

  academicYear: number;

  grade: number;

  className: string;

  status: "ACTIVE" | "INACTIVE";
}
```

---

### Student

```ts
interface Student {
  id: string;

  schoolClassId: string;

  name: string;

  parentName?: string;
  parentPhone?: string;

  notes?: string;

  status: "ACTIVE" | "INACTIVE";

  createdAt: string;
  updatedAt: string;
}
```

---

### DailyStudentRecord

```ts
interface DailyStudentRecord {
  id: string;

  studentId: string;

  date: string;

  arrivalTime?: string;

  mealCompleted: boolean;
  showerCompleted: boolean;
  bagChecked: boolean;

  finalCheckCompleted: boolean;
  parentContacted: boolean;

  remark?: string;

  updatedBy?: string;
  updatedAt: string;
}
```

Constraint：

```text
UNIQUE(studentId, date)
```

---

### Subject

```ts
interface Subject {
  id: string;

  name: string;

  status: "ACTIVE" | "INACTIVE";
}
```

---

### HomeworkTask

```ts
interface HomeworkTask {
  id: string;

  scope: "CLASS" | "INDIVIDUAL";

  schoolClassId?: string;
  studentId?: string;

  subjectId?: string;

  taskDate: string;

  taskType: string;

  description: string;

  pageFrom?: number;
  pageTo?: number;

  createdBy: string;
  createdAt: string;
}
```

---

### StudentHomework

```ts
interface StudentHomework {
  id: string;

  studentId: string;

  homeworkTaskId: string;

  status:
    | "PENDING"
    | "CORRECTION_REQUIRED"
    | "COMPLETED";

  checkedBy?: string;
  checkedAt?: string;

  remark?: string;

  updatedAt: string;
}
```

---

### DictationTask

```ts
interface DictationTask {
  id: string;

  scope: "CLASS" | "INDIVIDUAL";

  schoolClassId?: string;
  studentId?: string;

  type:
    | "CHINESE_DICTATION"
    | "SPELLING"
    | "EJAAN"
    | "MEMORIZATION"
    | "RENCANA"
    | "DICTATION"
    | "TUITION_DICTATION"
    | "OTHER";

  description: string;

  assignedDate: string;
  scheduledDate?: string;

  source: "SCHOOL" | "TUITION";

  createdBy: string;
  createdAt: string;
}
```

---

### StudentDictation

```ts
interface StudentDictation {
  id: string;

  studentId: string;
  dictationTaskId: string;

  status:
    | "PENDING"
    | "NEEDS_PRACTICE"
    | "COMPLETED";

  verifiedBy?: string;
  verifiedAt?: string;

  updatedAt: string;
}
```

---

### StudentIssue

```ts
interface StudentIssue {
  id: string;

  studentId: string;

  date: string;

  issueType:
    | "BOOK_NOT_BROUGHT"
    | "WORKBOOK_FINISHED"
    | "MISSING_MATERIAL"
    | "OTHER";

  description: string;

  status: "OPEN" | "RESOLVED";

  parentContactRequired: boolean;
  parentContacted: boolean;

  createdBy: string;

  resolvedBy?: string;

  createdAt: string;
  resolvedAt?: string;
}
```

---

### TuitionSession

```ts
interface TuitionSession {
  id: string;

  name: string;

  dayOfWeek: number;

  startTime: string;
  endTime: string;

  grade?: number;

  status: "ACTIVE" | "INACTIVE";
}
```

---

### TuitionEnrollment

```ts
interface TuitionEnrollment {
  id: string;

  studentId: string;
  tuitionSessionId: string;
}
```

---

### StudentRelease

```ts
interface StudentRelease {
  id: string;

  studentId: string;

  date: string;

  releaseStatus:
    | "NORMAL"
    | "INCOMPLETE";

  releasedAt: string;

  approvedBy: string;

  parentContacted: boolean;

  exceptionReason?: string;
  remark?: string;
}
```

---

### AnswerResource

```ts
interface AnswerResource {
  id: string;

  academicYear: number;

  schoolId?: string;

  grade: number;

  subjectId: string;

  bookName: string;

  title: string;

  filePath: string;

  uploadedBy: string;

  createdAt: string;
}
```

---

## 9. ERD Overview

```text
SCHOOL
  ↓
SCHOOL_CLASS
  ↓
STUDENT
  │
  ├── DAILY_STUDENT_RECORD
  │
  ├── STUDENT_HOMEWORK
  │       ↑
  │   HOMEWORK_TASK
  │
  ├── STUDENT_DICTATION
  │       ↑
  │   DICTATION_TASK
  │
  ├── STUDENT_ISSUE
  │
  ├── STUDENT_RELEASE
  │
  └── TUITION_ENROLLMENT
           ↓
      TUITION_SESSION


SUBJECT
  ↑             ↑
  │             │
HOMEWORK_TASK   ANSWER_RESOURCE


STAFF
  ↓
createdBy
checkedBy
verifiedBy
updatedBy
approvedBy
```

---

## 10. Attention Engine

第一版不要创建独立 `attention_items` table。

Attention 应由 query / application logic 动态产生。

---

### Rule 1

```text
DailyStudentRecord.arrivalTime != null
AND
bagChecked = false

→ BAG_NOT_CHECKED
```

---

### Rule 2

```text
StudentHomework.status = CORRECTION_REQUIRED

→ HOMEWORK_RECHECK
```

---

### Rule 3

```text
StudentDictation.status != COMPLETED
AND
DictationTask.scheduledDate = nextSchoolDay

→ URGENT_DICTATION
```

---

### Rule 4

```text
StudentIssue.status = OPEN

→ OPEN_ISSUE
```

---

## 11. 页面结构 / Routes

```text
/
├── login
│
├── today
│
├── students
│   └── [studentId]
│
├── classes
│   └── [classId]
│
├── homework
│   ├── new
│   └── [taskId]
│
├── care
│   ├── [grade]
│   └── print
│
├── dictation
│
├── answers
│
├── reports
│
├── settings
│   ├── schools
│   ├── classes
│   ├── subjects
│   └── staff
│
└── api / server actions
```

---

## 12. Navigation

### Desktop

Left Sidebar：

```text
Today
Students
Homework
Care
Answers
Reports
More
```

More：

```text
Dictation
Schools & Classes
Staff
Settings
```

---

### Mobile

Bottom Navigation：

```text
Today
Students
+
Care
More
```

`+` 用于快速：

- Add Homework
- Add Dictation
- Add Issue

---

## 13. UI / UX Guidelines

### Design Direction

**Calm + Fast + Contextual + Operational**

不是传统：

- School ERP
- Analytics Dashboard
- Corporate Admin Panel

重点是：

> 老师在忙碌状态下 2–3 秒内知道下一步要处理谁。

---

### Visual Style

- Clean
- Professional
- Soft
- Mobile-first
- Medium information density
- Minimal clutter
- Clear status colors
- Fast interactions

---

### Layout

Desktop：

- Left sidebar
- Top header
- Main content area

Mobile：

- Bottom navigation
- Compact cards
- Large touch targets

---

### Components

- Rounded corners: 10px–14px
- Subtle borders
- Minimal shadows
- Cards only where useful
- Clear status badges
- Compact student sections
- Drawer / Sheet for quick details
- Dialog only for actions requiring confirmation

---

### Status Color System

```text
Primary:
Indigo / Blue

Success:
Green

Warning / Recheck:
Amber

Urgent:
Red

Pending:
Gray

Background:
Light neutral gray
```

---

### Typography

- Inter
- Clear hierarchy
- Medium density
- Avoid oversized dashboard headings

---

## 14. Today Dashboard

Today 是整个系统最重要的页面。

Desktop example：

```text
┌─────────────────────────────────────────────────────────────┐
│ Today · 13 September                                       │
│                                                             │
│ 28 Arrived   19 Done   6 Attention   3 Urgent              │
│                                                             │
│ 🔴 NEEDS ATTENTION                                         │
│                                                             │
│ Jason · 2H                                                 │
│ 华文听写 · Tomorrow                                        │
│                                                             │
│ Amy · 2H                                                   │
│ Math P44 · Waiting for recheck                             │
│                                                             │
│ Ryan · 3B                                                  │
│ Bag not checked                                            │
│                                                             │
│ ─────────────────────────────────────────                  │
│                                                             │
│ CLASSES                                                     │
│                                                             │
│ Year 1        8 / 11                                       │
│ Year 2        7 / 9                                        │
│ Year 3        6 / 8                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 15. Class Page

Example：

```text
← Year 2

2H
中化三小 · 9 Students

[Overview] [Homework] [Care]

────────────────────────────

Jason Tan

✓ 华文活动本 P20–22

🟠 数学活动本 P44
Waiting for recheck

✓ English Writing

🔴 华文听写
Tomorrow

[View Student]

────────────────────────────

Amy Lim

✓ 华文活动本 P20–22
✓ 数学活动本 P44
✓ English Writing

✓ Done
```

---

## 16. Student Detail Page

页面重点是：

> Student Today Context

不是完整 profile。

Example：

```text
Jason Tan
中化三小 · 2H

TODAY

Care
✓ Arrived · 1:18 PM
✓ Meal
✓ Shower
✓ Bag Checked

Homework
✓ 华文活动本 P20–22

🟠 数学活动本 P44
Waiting for recheck
[✓ Check]

✓ English Writing

Dictation
🔴 华文听写
Tomorrow
[Handle]

Tuition
✓ 2:30–3:30 PM

────────────────

2 / 3 Academic Tasks Completed

Not Ready to Go
```

---

## 17. Homework Entry UI

Homework 以 School Class 为主。

```text
Add Homework

School
[中化三小 ▼]

Class
[2H ▼]

Date
[13 Sep 2026]

────────────────────

Homework

Subject
[华文 ▼]

Type
[活动本]

Pages
[20] to [22]

[+ Add Task]

────────────────────

This will be assigned to:

9 students in 2H

[Save Homework]
```

---

## 18. Daily Care UI

Desktop / Tablet：

```text
托育 · Year 2 · Today

        到班  吃饭  冲凉  书包  功课  听写

Jason    ✓     ✓     ✓     ✓     ◐     ✓

Amy      ✓     ✓     ○     ✓     ✓     ✓

Ryan     ✓     ✓     ✓     ⚠     ◐     ✓

Chloe    ○     ○     ○     ○     -     -

─────────────────────────────

[Bulk Action]

[Print]
```

---

## 19. Multi-User Realtime Behaviour

多个老师可以同时操作。

Example：

```text
Teacher A
↓
Marks Jason Math Completed
↓
Database Update
↓
Realtime Event
↓
Teacher B UI automatically updates
```

重要 table：

```text
student_homework
student_dictation
daily_student_records
student_issues
```

需要 realtime subscription。

---

### Audit Fields

重要状态必须保存：

```text
updatedBy
updatedAt

checkedBy
checkedAt

verifiedBy
verifiedAt
```

UI 可以显示：

```text
✓ Completed
Checked by Ms Lim · 3:42 PM
```

---

## 20. Authentication Behaviour

### Login

```text
Email
Password
```

成功后：

```text
Supabase Auth
↓
Staff Profile
↓
Application
```

---

### Protected Routes

未登录不得访问：

```text
/today
/students
/homework
/care
/answers
/settings
```

---

### Authorization

STAFF：

```text
Daily operations
```

ADMIN：

```text
Daily operations
+
Configuration
+
Staff management
```

---

## 21. Implementation Roadmap

# Phase 1 — Project Foundation

### Task 1.1 Initialize Project

- Create Next.js project
- Enable TypeScript
- Configure Tailwind
- Install shadcn/ui
- Install Lucide
- Install date-fns
- Install Zod
- Install React Hook Form

---

### Task 1.2 Configure Supabase

- Create Supabase project
- Configure environment variables
- Configure PostgreSQL
- Configure Supabase Auth
- Configure Supabase Storage

---

### Task 1.3 Configure Drizzle

- Install Drizzle
- Create schema
- Create migration setup
- Connect PostgreSQL

---

### Task 1.4 App Shell

- Desktop sidebar
- Mobile bottom navigation
- Header
- Responsive layout

---

# Phase 2 — Authentication

### Task 2.1 Login

- Login page
- Email/password
- Error handling
- Loading state

### Task 2.2 Session

- Persist session
- Protected routes

### Task 2.3 Staff Profile

- Link Supabase Auth user to Staff table

---

# Phase 3 — Master Data

### Task 3.1 School

- Create
- Edit
- Deactivate

### Task 3.2 School Class

- Create
- Edit
- Filter

### Task 3.3 Student

- Create
- Edit
- Search
- Filter
- Deactivate

### Task 3.4 Subject

- Seed standard subjects
- Allow admin management

---

# Phase 4 — Daily Care

### Task 4.1 Daily Record

- Create daily record when needed
- Arrival
- Meal
- Shower
- Bag Check

### Task 4.2 Bulk Actions

- Select students
- Bulk meal complete
- Bulk shower complete

### Task 4.3 Care Page

- Grade view
- Class view
- Status indicators

---

# Phase 5 — Homework

### Task 5.1 Create Class Homework

- School class
- Subject
- Type
- Page
- Description

### Task 5.2 Auto Assignment

Create StudentHomework for all active students in selected class.

### Task 5.3 Individual Homework

- Add extra student task

### Task 5.4 Checking Workflow

```text
PENDING
↓
COMPLETED
```

or

```text
PENDING
↓
CORRECTION_REQUIRED
↓
COMPLETED
```

---

# Phase 6 — Dictation

### Task 6.1 Dictation Task

- Class
- Individual
- Type
- Scheduled Date

### Task 6.2 Status

- Pending
- Needs Practice
- Completed

### Task 6.3 Priority

- Highlight upcoming dictation

---

# Phase 7 — Attention Dashboard

### Task 7.1 Attention Query

Combine:

- Bag not checked
- Homework correction
- Upcoming dictation
- Open issues

### Task 7.2 Priority Grouping

```text
URGENT
NEEDS_ATTENTION
ISSUES
```

### Task 7.3 Today Dashboard

- Counts
- Attention cards
- Class progress

---

# Phase 8 — Student Issues

- Add Issue
- Resolve Issue
- Parent Contact Required
- Parent Contacted
- Display in Attention

---

# Phase 9 — Tuition

- Create Tuition Session
- Student Enrollment
- Show Today tuition schedule

---

# Phase 10 — Final Check & Release

- Determine academic completion
- Final Check
- Parent Contact
- Normal Release
- Incomplete Release
- Exception Reason

---

# Phase 11 — Print Care Sheet

- Dedicated print route
- Print layout
- A4 landscape
- `@media print`
- Hide navigation
- Repeat table header where possible
- Browser print
- Save as PDF

---

# Phase 12 — Answer Library

- Upload PDF
- Supabase Storage
- Resource Metadata
- Filter
- Search
- Open PDF

---

# Phase 13 — Realtime

Enable Supabase Realtime for:

```text
student_homework
student_dictation
daily_student_records
student_issues
```

UI should automatically update when another teacher changes data.

---

# Phase 14 — Testing

### Unit Tests

Test business rules such as:

```text
Arrived + Bag unchecked
→ Attention
```

```text
Correction Required
→ Not Completed
```

```text
Dictation not fully correct
→ Not Completed
```

---

### E2E Tests

Example：

```text
Login
↓
Open 2H
↓
Mark Jason Math correction
↓
Open Today
↓
Jason appears in Attention
↓
Mark homework completed
↓
Attention disappears
```

---

# Phase 15 — AI Teacher Assistant

Only implement after core system is stable.

Features:

- Ask question
- Upload / capture question image
- Generate suggested answer
- Generate explanation
- Future Answer Library retrieval

AI must display:

```text
AI-generated suggestion.
Teacher should verify before using.
```

---

## 22. Vibe Coding Rules

Coding agents must follow these rules.

### Rule 1

Do not redesign architecture without explicit instruction.

### Rule 2

Do not add new dependencies unless needed.

### Rule 3

Do not implement features outside `plan.md`.

### Rule 4

Do not modify unrelated files during a feature task.

### Rule 5

Use existing shared components before creating duplicates.

### Rule 6

All user input must be validated.

### Rule 7

Business rules must be enforced server-side where relevant.

### Rule 8

Do not trust client-side authorization.

### Rule 9

Use TypeScript strictly.

Avoid unnecessary:

```ts
any
```

### Rule 10

Keep mobile-first behaviour.

### Rule 11

Normal workflow should require minimal taps.

### Rule 12

Attention should be derived rather than manually maintained.

### Rule 13

Preserve historical records.

Do not hard-delete records that affect historical data.

### Rule 14

Always include loading, error and empty states.

### Rule 15

After completing a feature:

- Run lint
- Run type check
- Run tests where available
- Report changed files

---

## 23. Suggested Folder Structure

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
│   ├── students/
│   ├── homework/
│   ├── care/
│   ├── dictation/
│   ├── attention/
│   └── layout/
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

---

## 24. Initial Seed Data

开发阶段必须建立 realistic seed data。

Example：

```text
School
- 中化三小
- 中化一小

Classes
- 1H
- 1B
- 2M
- 2H
- 2B
- 3H
- 3B
- 4M
- 4H
- 4B
```

Students：

至少：

```text
20–30 students
```

包含：

- 已完成学生
- 待订正学生
- 明天听写学生
- 书包未检查学生
- 缺书学生
- Tuition 中学生

让 dashboard 在开发阶段就接近真实工作环境。

---

## 25. MVP Completion Definition

MVP 完成的标准不是：

> 所有 planned features 都写完。

而是系统可以完成一个真实的托育工作日：

```text
Teacher Login
↓
Students Arrive
↓
Bag Check
↓
Class Homework Recorded
↓
Students Work
↓
Teacher Checks Homework
↓
Corrections Tracked
↓
Dictation Completed
↓
Attention Dashboard Shows Remaining Work
↓
Final Check
↓
Parent Contact
↓
Student Release
↓
Print Daily Care Sheet
```

如果这个流程可以稳定完成，并且实际比纸本 + 记忆更容易管理，则 MVP 成功。

---

## 26. Future Improvements

后续才考虑：

- AI RAG Answer Assistant
- Parent Portal
- WhatsApp Integration
- Better Reporting
- Student History
- Weekly Summary
- PWA
- Push Notifications
- Advanced Audit Log
- Fine-grained Permissions
- Resource Version Management
- Academic Year Migration Tools

---

## 27. Final Product Vision

系统不是一个传统 Student Management System。

系统真正解决的是：

> **Teacher Attention Management**

核心结构：

```text
Students
+
Daily Care
+
Homework
+
Dictation
+
Issues
+
Realtime Collaboration

            ↓

      Attention Engine

            ↓

Teacher always knows:

“Who still needs me?”
```