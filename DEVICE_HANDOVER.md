# Device Handover & Workspace Migration Guide

> **Contributor:** Subhajit Samajpati (`subhajitsamajpati02@gmail.com`)  
> **Date Generated:** October 2, 2026  
> **Active Branch:** `feat/mongodb-auth`  
> **Current Commit:** `59527a64` (*Merge branch 'main' into feat/mongodb-auth and resolve all conflicts*)  
> **Git Status:** Clean working tree, fully synced with `origin/feat/mongodb-auth`.

---

## 1. Quick Repository Snapshot

| Attribute | Details |
| :--- | :--- |
| **Fork (Origin)** | [https://github.com/Crypticfr/fln.git](https://github.com/Crypticfr/fln.git) |
| **Upstream (Main Repo)** | [https://github.com/vicharanashala/fln.git](https://github.com/vicharanashala/fln.git) |
| **Active Working Branch** | `feat/mongodb-auth` |
| **Monorepo Structure** | npm workspaces (`frontend`, `backend`, `backend/fln-backend`, `ai-services`) |
| **Frontend Stack** | React 19, Vite, Tailwind CSS v4, TypeScript, Lucide React, SheetJS (`xlsx`) |
| **Backend Stack** | Node.js, Express 4, TypeScript, esbuild, JWT (`jsonwebtoken`/`jose`), bcrypt, MongoDB Atlas (with local JSON fallback) |
| **Node.js / npm Version** | Node `v24.18.0` (or `v20+`/`v22+` LTS), npm `11.16.0` |
| **Python Version** | Python `3.14.7` (or `3.10+` for OCR pipeline) |

---

## 2. Setup on New Device (Step-by-Step)

### Step 1: Clone and Set Up Remotes
```bash
# 1. Clone your fork
git clone https://github.com/Crypticfr/fln.git
cd fln

# 2. Add upstream remote to stay in sync with the core team
git remote add upstream https://github.com/vicharanashala/fln.git

# 3. Checkout your feature branch
git checkout feat/mongodb-auth

# 4. Confirm branch and remotes
git remote -v
git status
```

### Step 2: Install Monorepo Dependencies
From the repository root (installs both root, `frontend`, and `backend` workspaces):
```bash
npm install
```

### Step 3: Configure Environment Variables

Create `.env` at the root of the project (`C:\projects\fln\.env`):
```ini
GROQ_API_KEY=
MONGODB_URI=mongodb+srv://tanmaysex:tanmaysex@fln.lahjgmr.mongodb.net/?appName=fln
GEMINI_API_KEY=
APP_URL=
LEVELS_BACKEND_URL=
DNS_SERVERS=8.8.8.8,4.2.2.2
```

*(Optional)* Create `.vscode/.env` for VS Code debugger support:
```ini
GROQ_API_KEY=
MONGODB_URI=mongodb+srv://tanmaysex:tanmaysex@fln.lahjgmr.mongodb.net/?appName=fln
GEMINI_API_KEY=
APP_URL=
LEVELS_BACKEND_URL=
```

*(Optional / If using standalone backend env)* Copy `backend/.env.example` to `backend/.env`:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://tanmaysex:tanmaysex@fln.lahjgmr.mongodb.net/?appName=fln
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
SEED_DEMO_PASSWORD=Fln@2026
MISCONCEPTION_AI_NAMING=off
LOCAL_DEV_MASTER_KEY=udggfuiegljvhvheuvljhbcwoskjdbfsbfsajbsjsbsaj
```

> **Important Note on MongoDB Atlas Network Access:**  
> When connecting from a new IP address on your new device or network, ensure your IP address is whitelisted in the MongoDB Atlas console (or that `0.0.0.0/0` is allowed for development). If MongoDB is unreachable, the system automatically falls back to the file-based store in `backend/data/`.

---

## 3. How to Run the Application

The application runs using the **real backend only** (no mock backend).

### Terminal 1: Real Express Backend (Port 3000 / 5000)
```bash
npm run dev:backend
# Or: npm run dev --workspace @fln/backend
```

### Terminal 2: Vite Frontend Dev Server (Port 5173)
```bash
npm run dev:frontend
```
> The frontend runs on `http://localhost:5173` and automatically proxies `/api/*` requests to the real backend.

### Demo Login Accounts
- **Teacher Account:** `gps-mt-001.t01@fln.org`
- **School Principal:** `gps-mt-001.principal@fln.org`
- **Superadmin:** `admin@fln.org`
- **Demo Password:** `Fln@2026`

---

## 4. Verification & Testing Commands

Run these to verify that everything compiles and passes before resuming development:

```bash
# 1. Full Monorepo Type Check (zero errors required)
npm run lint

# 2. Run Attendance Persistence & Regression Test
npx tsx --test backend/tests/attendance-persistence.test.ts

# 3. Run User Scoping & Role Assignment Tests
npx tsx --test backend/tests/user-scoping.test.ts

# 4. Verify Full Production Build
npm run build
```

---

## 5. Summary of Completed Work on `feat/mongodb-auth`

All your work on this branch is committed and pushed to `origin/feat/mongodb-auth`:

### 1. Student Attendance Tracking Subsystem
- **Backend Persistence (`backend/src/db.ts`):**
  - Integrated `attendance` collection into `dbStore` with dual-mode MongoDB + JSON file persistence.
  - Implemented `getAttendance()` with query filters (`schoolId`, `date`, `classGroup`, `section`).
  - Implemented `upsertAttendance()` with automatic deduplication by `(studentId, date)`.
  - Removed in-memory fictional test data.
- **REST Endpoints (`backend/src/routes/attendance.ts`):**
  - `GET /api/attendance`: Role-scoped query for attendance records.
  - `POST /api/attendance/mark`: Batch attendance saving/updating with auth scoping.
  - `GET /api/attendance/stats`: Attendance rate and trend metrics.
- **Frontend UI (`frontend/src/components/AttendanceTracker.tsx`):**
  - Interactive roll-call table with status toggles (*Present, Absent, Late, Excused*).
  - Date selector and Class/Section filter dropdowns.
  - Quick action: "Mark All Present".
  - Locked assigned school badge for teachers and single-school roles.
  - Formatted Excel (`.xlsx`) export with SheetJS.
- **Automated Tests (`backend/tests/attendance-persistence.test.ts`):**
  - 5 comprehensive tests verifying empty states, clean upsert updates, school isolation, unauthenticated 401 guard, and HTTP route integration.

### 2. Interactive Content Library & Level Detail Modal
- **Backend Content API (`backend/src/routes/content.ts`):**
  - `GET /api/content/levels`: Returns list of all 93 levels with strand, class, stage metadata.
  - `GET /api/content/levels/:levelId`: Parses markdown files from `FLN Levels Structure/`.
  - `GET /api/content/levels/:levelId/questions`: Retrieves level questions from `data/questionBank.json`.
- **Frontend Modal (`frontend/src/components/LevelDetailModal.tsx`):**
  - Modal with Overview, Learning Objectives, Sub-level Breakdown (.0 Core, .1 Guided, .2 Concrete), and Question Bank preview.
- **Explorer Panel (`frontend/src/components/panels/ContentPanel.tsx`):**
  - Strand filters, live search, and modal inspection triggers.

### 3. Formatted Excel Export for Audit Logbook
- Upgraded raw CSV export in `frontend/src/components/LogbookView.tsx` to styled Microsoft Excel (`.xlsx`) format.
- Normalized role-scoping checks in `backend/src/routes/logbook.ts` to be case-insensitive.

### 4. Auth & Security Hardening
- Enriched JWT tokens with user location fields (`stateCode`, `districtCode`, `blockCode`, `schoolId`) in `backend/src/auth.ts` and `backend/src/routes/auth.ts`.
- Enforced fail-closed authorization checks and role normalization.

### 5. Frontend UI Resilience
- Created `frontend/src/components/ErrorBoundary.tsx` and wrapped dashboard panels in `frontend/src/App.tsx` to prevent blank white-screen crashes.

### 6. Contributor Onboarding & Technical Proposal
- Documented complete architecture, gaps, and ideas in `Ideas/ONBOARDING-Subhajit-Samajpati.md`.

---

## 6. Open Files & Context at Switch-Over

When you left off on this device, the following files were actively open in your editor:
1. `backend/tests/attendance-persistence.test.ts` (Line 1)
2. `frontend/src/components/LevelDetailModal.tsx`
3. `backend/package.json`
4. `backend/src/routes/students.ts`
5. `backend/src/auth.ts`
6. `backend/src/routes/auth.ts`

---

## 7. Next Recommended Steps on the New Device

1. **Verify Git Sync**:
   ```bash
   git fetch upstream
   git status
   ```
2. **Open PR**:
   If ready, create a Pull Request from `Crypticfr:feat/mongodb-auth` to `vicharanashala/fln:main`.
3. **If Merging Upstream Updates**:
   ```bash
   git fetch upstream
   git merge upstream/main
   npm run lint
   ```

---

## 8. Antigravity Migration: Preserving Conversations & AI Memory

When using Antigravity on your new device, you can carry forward **100% of your conversation history, agent trajectories, brain memory, generated artifacts, and custom settings**.

### Pre-Generated Backup Archive
A complete compressed backup has already been generated and saved to your Desktop:
- **Location:** `C:\Users\subha\OneDrive\Desktop\antigravity-backup.zip` (37.7 MB)

This archive bundles:
- `antigravity-ide/conversations/`: SQLite database files for all conversations and chat sessions (including current and past task IDs).
- `antigravity-ide/brain/`: All artifacts, trajectories, scratchpads, and execution logs.
- `antigravity-ide/knowledge/`: Curated knowledge items and project context.
- `config/`: Custom skills, plugins, rules, and global configurations (`~/.gemini/config`).
- `antigravity/`: CLI memory, credentials, and conversation states (`~/.gemini/antigravity`).

### How to Restore on the New Device

1. **Copy the Backup File**:
   Transfer `antigravity-backup.zip` to the new device via USB drive, Google Drive, OneDrive, or local network.
2. **Close Antigravity on the New Machine**:
   Ensure Antigravity / Antigravity IDE is closed so files are not locked during extraction.
3. **Extract into the `.gemini` Directory**:
   - On **Windows**: Extract directly into `C:\Users\<YourNewUsername>\.gemini\`
     ```powershell
     # PowerShell command on the new device:
     Expand-Archive -Path "$HOME\Downloads\antigravity-backup.zip" -DestinationPath "$HOME\.gemini" -Force
     ```
   - On **macOS / Linux**: Extract into `~/.gemini/`
     ```bash
     unzip -o ~/Downloads/antigravity-backup.zip -d ~/.gemini/
     ```
4. **Launch Antigravity**:
   Open Antigravity IDE on the new device. All your past conversations, previous chat sessions, artifacts, and memory will appear immediately in your history panel!

### How to Re-generate the Backup (If Needed in the Future)
Run this PowerShell command from any terminal:
```powershell
$stage = "$HOME\AppData\Local\Temp\antigravity_backup_stage"
$zip = "$HOME\OneDrive\Desktop\antigravity-backup.zip"
robocopy "$HOME\.gemini\antigravity-ide" "$stage\antigravity-ide" /E /XD bin /R:1 /W:1
robocopy "$HOME\.gemini\config" "$stage\config" /E /R:1 /W:1
robocopy "$HOME\.gemini\antigravity" "$stage\antigravity" /E /R:1 /W:1
Compress-Archive -Path "$stage\*" -DestinationPath $zip -Force
Remove-Item -Path $stage -Recurse -Force
```

