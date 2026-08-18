# Proposal: MongoDB Authentication & Session Persistence

## 1. Executive Summary
This proposal introduces robust, production-ready authentication and persistent session management backed by MongoDB Atlas with a graceful offline/fallback file-based database. It replaces transient memory-only user sessions with persistent JWT tokens, bcrypt-hashed credentials, role-based authorization scoping, and brute-force protection.

---

## 2. Problem Statement & Motivation
Prior to this implementation:
- **Ephemeral Sessions**: User data, roles, and credentials were lost whenever the backend restarted or when the application ran in containerized environments.
- **Insecure Password Handling**: Plaintext comparison posed security vulnerabilities and lacked standard industry hardening.
- **Incomplete MongoDB Wiring**: Although a MongoDB Atlas URI was configured, the application would silently stay on the local JSON fallback due to connection lifecycle mismatches.
- **Auth Proxy & CORS Disconnects**: API requests lacked standardized token attachment, causing frequent 401 unauthenticated drops during view transitions.

---

## 3. Architecture & Technical Design

### A. Database Connection Lifecycle
- **Dynamic Connection Manager**: Connects to MongoDB Atlas using `MongoClient` with exponential retry attempts and a 5-second connection timeout.
- **Resilient Fallback Mode**: If MongoDB Atlas is unreachable or unconfigured, the system automatically falls back to `data/db.json` with zero downtime, logging clear diagnostic status.
- **Connection Status Endpoint**: Exposes `GET /api/db-status` so the frontend can dynamically display live connection indicators (`MongoDB Atlas` vs `Local File DB`).

### B. Security & Cryptographic Standards
- **Password Hashing**: Uses `bcrypt` (salt rounds: 10) for all user password hashes. Plaintext passwords are never stored in the database.
- **JWT Authorization**: Emits signed JWTs containing `id`, `email`, `role`, and geographic scope (`schoolId`, `districtCode`, `stateCode`, `blockCode`).
- **Rate Limiting**: Integrates `express-rate-limit` on `/api/auth/login` to prevent brute-force credential stuffing.

---

## 4. API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticates user credentials, validates bcrypt hash, returns JWT + sanitized user profile | No (Rate Limited) |
| `GET` | `/api/auth/me` | Validates active JWT from `Authorization: Bearer <token>` header and returns current user context | Yes |
| `GET` | `/api/db-status` | Returns whether MongoDB Atlas or local JSON DB is actively serving requests | No |

---

## 5. Data Model (`User`)

```typescript
export enum UserRole {
  SUPERADMIN = 'SuperAdmin',
  ADMIN = 'State Admin',
  DISTRICT_ADMIN = 'District Admin',
  BLOCK_ADMIN = 'Block Admin',
  SCHOOL = 'Principal',
  TEACHER = 'Teacher',
  VOLUNTEER = 'Volunteer'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  stateCode?: string;
  districtCode?: string;
  blockCode?: string;
  schoolId?: string;
  assignedSchools?: string[];
  createdAt?: string;
  updatedAt?: string;
}
```

---

## 6. Frontend Integration
- **`apiClient` Middleware**: Auto-attaches `Authorization: Bearer <token>` from browser `localStorage` on every outbound API call.
- **Seamless Logout & Expiry**: Catches 401 responses, dispatches `fln_unauthorized` custom event, cleans local storage, and returns the user to the landing page.
- **Live Status Header**: Displays connection health badges and active user identity in real-time.

---

## 7. Verification & Testing
- ✅ Login flow verified across all 7 user roles (SuperAdmin to Volunteer).
- ✅ Rate limiting successfully blocks rapid-fire invalid attempts (>5 per 15 min window).
- ✅ Server restart preserves user sessions in MongoDB Atlas.
