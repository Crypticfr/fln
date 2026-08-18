# Contributor Onboarding Document

**Contributor Name:** Subhajit Samajpati  
**GitHub Username:** Crypticfr  
**Date:** August 18, 2026  
**Repository:** [vicharanashala/fln](https://github.com/vicharanashala/fln)

---

## 1. What is FLN?

**Foundational Literacy and Numeracy (FLN)** refers to a child's foundational ability to read with basic comprehension and perform elementary mathematical operations (such as number recognition, counting, addition, and subtraction). FLN serves children in early childhood and primary schooling—specifically from pre-school through Grade 3 (ages 3 to 9).

In India's education ecosystem, while primary school enrollment rates are high, large-scale educational assessments consistently highlight a severe "learning poverty" challenge: a vast number of children reach Grade 5 without having acquired foundational Grade 2 reading and math competencies. Because learning is cumulative, children who miss these initial foundational milestones inevitably fall further behind across all academic subjects as grade levels advance, resulting in chronic learning gaps, disengagement, and eventual school dropout.

The national mandate under **NEP 2020** and the **NIPUN Bharat Mission** established that achieving universal foundational literacy and numeracy by Grade 3 is the highest national priority. The FLN platform addresses this challenge by equipping teachers and administrators with scalable, automated, and personalized diagnostic tools to evaluate exactly where each child stands on the foundational spectrum, administer targeted instructional interventions, and continuously monitor mastery until every child achieves grade-level competency.

---

## 2. What do you understand by FLN (as a system)?

FLN as a software system is a multi-tier, data-driven assessment, intervention, and governance platform designed to bridge physical classroom paper-based evaluation with real-time digital learning analytics.

### A. System Actors (Users & Hierarchy)
The platform operates on a 7-tier geographic and administrative hierarchy:
1. **SuperAdmin (National Level)**: Oversight of system health, cross-state performance benchmarks, question bank administration, and global configurations.
2. **State Admin (`ADMIN`)**: Monitors state-level key performance indicators, manages district administrative coordinators, and tracks mission targets.
3. **District Admin (`DISTRICT_ADMIN`)**: Analyzes block performance, allocates resources, and tracks district progress.
4. **Block Admin (`BLOCK_ADMIN`)**: Oversees school clusters, teacher training pacing, and field verification.
5. **School Principal / Headmaster (`SCHOOL`)**: Manages school-level teacher allocations, student enrollment, and school audit logbooks.
6. **Teacher (`TEACHER`)**: Classroom practitioner who conducts daily attendance roll-calls, generates diagnostic tests, assigns personalized worksheets, and manages classroom student profiles.
7. **Volunteer / Evaluator (`VOLUNTEER`)**: Field assistants who support scanning physical assessment sheets, administering diagnostic tests, and assisting teachers with ICR verification.

### B. Core Entities & Lifecycle Flow
The system manages relationships among the following entities:
- **`School`**, **`Class`**, and **`Student`**: Establish the student's academic baseline, class grade, and institutional context.
- **`FLN Levels` (1 to 93)**: The structured pedagogical curriculum spanning 7 class groups (Preschool 1 to Class 4), sub-divided into `.0` Core Mastery, `.1` Guided Remediation, and `.2` Concrete Foundations.
- **`DiagnosticPaper` & `LevelWorksheet`**: Standardized and personalized assessments generated on demand.
- **`AnswerSubmission` & `EvaluationReport`**: Captured student responses from physical paper sheets via ICR scanner or manual scoring.
- **`AttendanceRecord`**: Daily roll-call records capturing student presence, absence, and correlation with skill advancement.
- **`LogEntry`**: Immutable operational audit logs tracking all sheet downloads, scans, logins, and verifications.

```
+-----------------------------------------------------------------------------------+
|                              FLN System Workflow                                  |
+-----------------------------------------------------------------------------------+
  1. Teacher/Admin Dashboard 
        │
        ├──> Generates Baseline Diagnostic or Level-Specific Worksheets
        │
  2. Physical Printout & Administration
        │
        ├──> Students complete physical worksheet / assessment paper in class
        │
  3. Image Capture & ICR Auto-Evaluation
        │
        ├──> Camera/Scanner uploads answer sheet
        ├──> Backend ICR / AI Evaluation Pipeline scores questions automatically
        │
  4. Student Mastery Profile Update
        │
        ├──> PASS  ──> Certify milestone achieved ──> Advance to next FLN level
        └──> RETRY ──> Diagnose specific struggle ──> Issue .1/.2 Remediation Sheet
        │
  5. Administrative Governance & Analytics
        │
        └──> Attendance, performance distributions, and audit reports roll up
             to Principal -> Block -> District -> State -> SuperAdmin dashboards
+-----------------------------------------------------------------------------------+
```

---

## 3. Current State of the Repository — What Has Been Done So Far

### A. Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Lucide React icons, SheetJS (`xlsx`) for spreadsheet generation, and custom Dark/Light accessibility themes.
- **Backend**: Node.js, Express.js (v4.21), TypeScript (compiled with `esbuild`), dotenv configuration loading, bcrypt password hashing, and JWT token authentication.
- **Database Layer**: MongoDB Atlas integration via official `mongodb` driver (v6.12/v7.5) with automatic fallback to local JSON persistence (`data/db.json`) during offline execution.
- **AI & Automation Services**: Google Gemini API (`@google/genai`) for adaptive question generation/remediation, Puppeteer for PDF rendering, and Python-based OCR/ICR image processing scripts.

### B. Implemented Features
1. **Modular Route Architecture**: Endpoints split cleanly under `backend/src/routes/` (`auth.ts`, `students.ts`, `worksheets.ts`, `evaluation.ts`, `analytics.ts`, `diagnosticBulk.ts`, `interventions.ts`, `teachers.ts`, `schools.ts`, `geo.ts`, `classes.ts`, `tickets.ts`, `logbook.ts`, `attendance.ts`, `content.ts`).
2. **Role-Based Access Control (RBAC)**: Geo-scoped authorization ensuring users only access data within their assigned state, district, block, or school.
3. **Assessment Engine**: Standardized Baseline, Mid-year, and End-of-year diagnostic test generation; student-specific personalized worksheet generation.
4. **ICR / OMR Scanner Pipeline**: Upload and auto-grading of student response sheets with confidence scoring and manual verification fallback.
5. **Analytics & Executive Dashboards**: Role-specific dashboards for Teachers, Principals, District/Block Officers, State Admins, and SuperAdmins.
6. **Student Attendance Tracker**: Batch daily roll-call marking, attendance metrics, growth correlation indicators, and Excel exports.
7. **FLN Content Library**: Interactive browser and detail modal for all 93 curriculum levels, sub-level breakdowns, and question previews.

---

## 4. Gaps Observed in the Code

During my exploration of the codebase, I identified the following concrete technical and design gaps:

### Gap 1: Ephemeral User Authentication & Incomplete MongoDB Session Wiring
- **Where**: `backend/src/db.ts` (lines 17–50) and `frontend/src/services/apiClient.ts` (lines 1–25).
- **What**: The MongoDB Atlas connection flag (`dbStore.useMongo`) was not consistently flipped upon successful ping, causing the system to silently revert to local fallback file mode. Furthermore, frontend API requests occasionally omitted the `Authorization: Bearer <token>` header on view switches, triggering unnecessary 401 unauthenticated drops.
- **Why it matters**: User session data, password hashes, and operational logs were at risk of being lost across restarts, and teachers experienced session drops while navigating between dashboard views.

### Gap 2: Absence of Student Attendance Tracking & Growth Correlation
- **Where**: `backend/src/` (previously lacked attendance routes/models) and `frontend/src/components/PanelViews.tsx`.
- **What**: The system tracked assessment outcomes but had zero capability to record daily classroom roll calls (Present, Absent, Late, Excused). There was no mechanism to correlate whether low diagnostic test scores were linked to conceptual difficulty or chronic absenteeism.
- **Why it matters**: Educators could not identify students whose learning regression was caused by low attendance versus those needing targeted pedagogical remediation.

### Gap 3: Disconnected Static Curriculum vs. Interactive Teacher Tooling
- **Where**: `FLN Levels Structure/` (static directory of 93 folders with markdown files) and `backend/src/index.ts`.
- **What**: The 93-level FLN framework existed solely as isolated markdown files on disk without any programmatic backend API or visual frontend exploration modal for educators to inspect level objectives, competencies, and question bank samples before assigning tests.
- **Why it matters**: Teachers were forced to manually read directory files to understand the scaffolding differences between `.0` Core Mastery, `.1` Guided Remediation, and `.2` Concrete Foundational levels.

### Gap 4: CSV-Only Logbook Export with Formatting Limitations
- **Where**: `frontend/src/components/LogbookView.tsx` (lines 120–150).
- **What**: Audit log exports relied solely on raw client-side CSV string concatenation without proper column formatting, auto-column width sizing, or multi-sheet workbook structure.
- **Why it matters**: Government audit compliance requires standard Microsoft Excel (`.xlsx`) registers that format dates, log IDs, school codes, and multi-line descriptions cleanly.

### Gap 5: Missing UI Error Boundaries for Complex Sub-Panels
- **Where**: `frontend/src/App.tsx` (lines 350–430).
- **What**: Large sub-views inside `PanelViews.tsx` lacked isolated React Error Boundaries. An unexpected null pointer in any experimental sub-panel would crash the entire dashboard to a blank white screen.
- **Why it matters**: Diminishes application reliability and user experience during teacher field trials.

---

## 5. Ideas for the Project

### Idea 1: Hardened MongoDB Authentication & Session Persistence
- **What**: Persistent authentication backed by MongoDB Atlas, bcrypt password hashing, signed JWTs with geo-scoping claims, and rate-limited login endpoints.
- **Why**: Ensures secure, multi-tenant session persistence with graceful fallback to local file DB for offline field environments.
- **How**: Implemented in `backend/src/routes/auth.ts`, `backend/src/db.ts`, and `frontend/src/services/apiClient.ts` with live connection health indicators (`GET /api/db-status`).

### Idea 2: Full-Featured Classroom Attendance Tracker with FLN Gain Analytics
- **What**: An interactive daily roll-call interface with one-click status toggles, batch marking, attendance rate calculations, and growth correlation analytics.
- **Why**: Allows schools and educational officers to pinpoint absenteeism trends and measure the direct impact of attendance regularity on FLN milestone attainment.
- **How**: Implemented in `backend/src/routes/attendance.ts` (with upsert queries to MongoDB `attendance` collection) and `frontend/src/components/AttendanceTracker.tsx` with formatted `.xlsx` export.

### Idea 3: Interactive FLN Content Library & Level Detail Modal
- **What**: An interactive curriculum explorer covering all 93 levels across 7 class groups, featuring dynamic markdown parsing and question bank previews.
- **Why**: Empowers teachers to inspect pedagogical objectives, sub-level scaffolding (`.0`, `.1`, `.2`), and sample questions before generating worksheets.
- **How**: Implemented in `backend/src/routes/content.ts` (dynamic parser for `FLN Levels Structure/` and `questionBank.json`) and `frontend/src/components/LevelDetailModal.tsx`.

### Idea 4: Formatted Multi-Sheet Microsoft Excel (.xlsx) Reporting
- **What**: Professional spreadsheet export engine integrated across Logbook and Attendance modules using SheetJS (`xlsx`).
- **Why**: Produces ready-to-print, auditor-friendly `.xlsx` workbooks with custom column widths, summary statistics, and structured headers.
- **How**: Implemented via client-side workbook generation in `frontend/src/components/LogbookView.tsx` and `frontend/src/components/AttendanceTracker.tsx`.

---

## 6. Your Contribution

As part of this onboarding and contribution cycle, I have implemented and verified the following concrete enhancements:

1. **Student Attendance Tracking Subsystem**:
   - Built backend routes in `backend/src/routes/attendance.ts` (`GET /api/attendance`, `POST /api/attendance/mark`, `GET /api/attendance/stats`).
   - Created the responsive `frontend/src/components/AttendanceTracker.tsx` UI with one-click roll-call toggling, "Mark All Present" batch actions, date filtering, and attendance rate statistics.
   - Built native multi-sheet Excel (`.xlsx`) export for daily class attendance registers.

2. **FLN Content Library & 93-Level Curriculum Explorer**:
   - Built `backend/src/routes/content.ts` with dynamic markdown parsing of `FLN Levels Structure/` and integration with `data/questionBank.json`.
   - Created `frontend/src/components/LevelDetailModal.tsx` for inspecting learning objectives, sub-level remediation scaffolds, and question previews.
   - Wired the Content Library into the main dashboard navigation in `frontend/src/components/Layout.tsx` and `PanelViews.tsx`.

3. **Audit Logbook Microsoft Excel (.xlsx) Export**:
   - Enhanced `frontend/src/components/LogbookView.tsx` to generate multi-column, auto-width formatted `.xlsx` workbooks replacing simple CSV downloads.
   - Preserved role-based server-side security scoping on `/api/logbook` in `backend/src/routes/logbook.ts`.

4. **Frontend Error Boundary & Stability**:
   - Implemented `frontend/src/components/ErrorBoundary.tsx` and wrapped dashboard panels in `frontend/src/App.tsx` to prevent blank white screens during component runtime exceptions.

5. **Monorepo Build & Integration Verification**:
   - Resolved merge conflicts with `main` following upstream route modularization.
   - Verified that `npm run build` passes with 0 TypeScript/Vite/esbuild compilation errors across both frontend and backend workspaces.
