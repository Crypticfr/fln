# Proposal: MongoDB Authentication & Session Persistence

## Summary
Make user authentication persistent using MongoDB Atlas while keeping the local JSON file database as an automatic fallback when offline.

## Why this is needed
- User logins and credentials were lost whenever the backend restarted because sessions weren't saved properly in MongoDB.
- Passwords were not securely hashed with bcrypt.
- Frontend API calls sometimes dropped the auth token when switching tabs, causing unexpected 401 errors.

## What was built
1. **MongoDB Connection & Fallback**: Backend connects to MongoDB Atlas on startup. If the database is offline or not configured, it automatically falls back to `data/db.json` without crashing.
2. **Secure Passwords & JWT**: Stored passwords are now hashed using `bcrypt` (10 rounds). Logins return a signed JWT token containing the user's role and assigned school/region.
3. **Rate Limiting**: Added basic rate limiting on `/api/auth/login` to stop brute-force spam.
4. **Connection Status**: Added `GET /api/db-status` so the frontend header can show whether the system is connected to MongoDB Atlas or running in local fallback mode.
5. **Client Token Handling**: Updated `apiClient.ts` to automatically attach the Bearer token from localStorage to every request and cleanly log out on 401.

## Main Endpoints
- `POST /api/auth/login` - Validates email/password, returns JWT and user profile.
- `GET /api/auth/me` - Returns current user info from the token.
- `GET /api/db-status` - Checks whether MongoDB or local JSON DB is active.

## Screenshots
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/bedca80e-745d-4eac-b3bd-98e445febd20" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/25c8db38-2feb-4905-87fe-ea93f1d6a42f" />


