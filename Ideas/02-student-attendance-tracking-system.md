# Proposal: Student Attendance Tracking & Growth Analytics

## 1. Executive Summary
This proposal introduces a full-featured Student Attendance Tracking System with batch-marking capabilities, multi-role geographic scoping, real-time analytics correlating attendance rates with FLN competency gains, and formatted Excel (`.xlsx`) export functionality.

---

## 2. Problem Statement & Motivation
- **Missing Attendance Dimension**: Prior to this feature, FLN diagnostics only tracked test submissions without visibility into student attendance regularity or classroom participation.
- **Attendance-to-Outcome Correlation**: Field coordinators and school principals needed data to understand whether student struggle was caused by conceptual difficulty or absenteeism.
- **Reporting & Compliance**: School inspectors and district officials required standard Excel attendance registers for administrative reporting.

---

## 3. Architecture & Technical Design

### A. Backend Storage & Upsert Pipeline
- **MongoDB Collection**: Stores records in the `attendance` collection with unique indexing on `(studentId, date)`.
- **In-Memory Fallback**: Provides a local memory store for offline testing or environments without a live MongoDB connection.
- **Batch Upsert Endpoint**: Efficiently updates daily classroom rosters in a single HTTP request using MongoDB `updateOne` with `upsert: true`.

### B. Correlation & Analytics Engine
- Computes daily attendance rates (`(Present + Late) / Total * 100`).
- Ranks students by attendance percentage and flags chronic absenteeism (`<75%`).
- Evaluates growth correlation metrics showing rate of level advancement (e.g. `3.4x faster advancement` for students with >90% attendance).

---

## 4. API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance` | Fetches attendance records filtered by `date`, `schoolId`, `classGroup`, and `section` | Yes |
| `POST` | `/api/attendance/mark` | Batch marks or updates attendance for a list of students on a given date | Yes |
| `GET` | `/api/attendance/stats` | Returns aggregate metrics, attendance rates, top attendees, and level gain correlations | Yes |

---

## 5. Data Model (`AttendanceRecord`)

```typescript
export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classGroup: string; // e.g. "Class 2", "Preschool 3"
  section: string;    // e.g. "A", "B"
  schoolId: string;
  date: string;       // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
  markedBy?: string;
  updatedAt: string;
}
```

---

## 6. Frontend UI Components (`AttendanceTracker.tsx`)

1. **Interactive Class Roster**:
   - Quick one-click status toggles for `Present`, `Absent`, `Late`, and `Excused`.
   - "Mark All Present" batch action to expedite daily roll call.
   - Per-student remarks field for recording notes (e.g. sick leave, late arrival reasons).
2. **Date & Scope Filters**:
   - Calendar date picker with fast "Today", "Yesterday", and "Last Week" presets.
   - Dynamic class and section dropdown selectors.
3. **Analytics & Metrics Banner**:
   - Summary cards: Overall Attendance Rate, Total Present, Absent, Late, Excused.
   - Growth correlation card highlighting the relationship between attendance and FLN level advancement.
4. **Excel (.xlsx) Export**:
   - Generates formatted Microsoft Excel workbooks using the `xlsx` library.
   - Contains a **Daily Attendance** sheet and an **Attendance Summary** sheet with auto-configured column widths.

---

## 7. Role-Based Access Control (RBAC)
- **Teachers**: Can mark and edit attendance for students in their assigned school and classes.
- **Principals**: Can view attendance across all classes in their school and export spreadsheets.
- **Block / District / State Admins**: Can view aggregate attendance statistics and filter by school within their jurisdiction.
