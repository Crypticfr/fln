# Proposal: Student Attendance Tracking & Excel Export

## Summary
Add a daily classroom attendance tracker where teachers can quickly mark attendance, view attendance rates, and export registers to Excel (.xlsx).

## Why this is needed
- The app tracked diagnostic test scores, but teachers had no way to record daily classroom attendance.
- Without attendance data, it was hard to tell if a student's low test scores were due to missing too many classes or conceptual difficulty.
- Schools and district coordinators need formatted Excel attendance registers for their records.

## What was built
1. **Attendance UI (`AttendanceTracker.tsx`)**:
   - Quick status buttons for each student: `Present`, `Absent`, `Late`, and `Excused`.
   - "Mark All Present" button to speed up daily roll call.
   - Date picker and class/section dropdown filters.
   - Per-student remarks (e.g. sick leave notes).
2. **Backend API (`backend/src/routes/attendance.ts`)**:
   - `GET /api/attendance` - Load attendance for a selected date, class, and school.
   - `POST /api/attendance/mark` - Save or update daily attendance in MongoDB using upserts.
   - `GET /api/attendance/stats` - Calculate attendance percentages and highlight chronically absent students (<75%).
3. **Excel Export**:
   - Built-in `.xlsx` export using SheetJS that downloads a formatted attendance register with daily roll call and summary sheets.
4. **Role Permissions**:
   - Teachers mark attendance for their assigned classes.
   - Principals and admins can view and export school-wide attendance summaries.

## Screenshots

### 1. Attendance Tracker Roster & Status Toggles
<!-- PASTE SCREENSHOT: Attendance Tracker page with student roster, Present/Absent/Late toggles, and filters -->

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/84623e89-6d56-4c6c-88e3-b3d444350ac9" />


### 2. Attendance Analytics & Excel Export
<!-- PASTE SCREENSHOT: Summary metrics cards and Export to Excel (.xlsx) button -->


<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/45aa6394-dd9b-4a2e-95a9-09172226dabb" />

