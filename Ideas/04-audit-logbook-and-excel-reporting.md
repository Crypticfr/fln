# Proposal: Audit Logbook & Formatted Excel (.xlsx) Reporting

## 1. Executive Summary
This proposal introduces an operational audit logging and reporting subsystem. It tracks critical platform operations (worksheet downloads, printing, diagnostic tests, ICR scanning, verification, and support ticketing) with server-side role scoping, full-text search, and multi-sheet Microsoft Excel (`.xlsx`) export.

---

## 2. Problem Statement & Motivation
- **Accountability & Compliance**: State and District educational authorities require verifiable logs of who generated diagnostic tests, when evaluations were submitted, and which schools conducted assessments.
- **Data Export Limitations**: Raw CSV exports often encounter character-encoding issues and lack proper column widths, formatting, and multiple sheet support required by official government audits.
- **Authorization Privacy**: Audit logs must not expose state-wide or district-wide teacher activity to unauthorized local school users.

---

## 3. Architecture & Technical Design

### A. Role-Based Log Scoping
- **SuperAdmin**: Full nationwide visibility across all schools, districts, and states.
- **State Admin (`ADMIN`)**: Scoped to schools within their `stateCode`.
- **District Admin (`DISTRICT_ADMIN`)**: Scoped to schools within their `districtCode`.
- **Block Admin (`BLOCK_ADMIN`)**: Scoped to schools within their `blockCode`.
- **Principal / Teacher (`SCHOOL` / `TEACHER`)**: Scoped strictly to their assigned `schoolId`.
- **Volunteer**: Scoped to their list of `assignedSchools`.

### B. Microsoft Excel (.xlsx) Engine
- Uses SheetJS (`xlsx`) in the frontend to compile formatted spreadsheets client-side.
- Custom column auto-width styling for readability:
  - Timestamp, Log ID, User Email, Role, School ID, School Name, Activity Type, Status, and Activity Details.
- Timestamped automated file naming (`FLN_System_Logbook_Export_YYYY-MM-DD.xlsx`).

---

## 4. API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/logbook` | Returns role-scoped audit logs matching query filters (`activityType`, `status`, `schoolId`, `search`) | Yes |
| `POST` | `/api/logbook` | Records a new operational audit event with authenticated user identity | Yes |

---

## 5. Data Model (`LogEntry`)

```typescript
export interface LogEntry {
  id: string;
  timestamp: string;
  schoolId: string;
  schoolName: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  activityType: 'download' | 'print' | 'conduct' | 'scan' | 'verify' | 'ticket';
  status: 'Success' | 'Failed' | 'Delayed';
  details: string;
}
```

---

## 6. Frontend UI Components (`LogbookView.tsx`)
- **Filter Bar**: Dynamic dropdowns for Activity Type, Status, and School selection.
- **Instant Search**: Real-time filtering across log details, user emails, and school names.
- **Audit Table**: Responsive data grid with activity status badges (`Success`, `Failed`, `Delayed`).
- **Excel Export Button**: Immediate `.xlsx` spreadsheet download with emerald styling and progress feedback.
