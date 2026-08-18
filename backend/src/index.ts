// Explicitly load .env from the backend directory. The dev wrapper
// script runs `npm run dev --workspace @fln/backend` from the repo root,
// so dotenv's default cwd lookup misses backend/.env and the backend
// silently falls back to the local file DB. This ensures the Atlas
// connection string is loaded regardless of how the script is started.
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dotenv_dir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dotenv_dir, '..', '.env') });

import express from 'express';
import { dbStore, connectDB } from './db';
import { registerAuthRoutes } from './routes/auth';
import { registerAnnouncementRoutes } from './routes/announcements';
import { registerStatsRoutes } from './routes/stats';
import { registerTicketRoutes } from './routes/tickets';
import { registerLogbookRoutes } from './routes/logbook';
import { registerGeoRoutes } from './routes/geo';
import { registerClassRoutes } from './routes/classes';
import { registerAdminRoutes } from './routes/admin';
import { registerTeacherRoutes } from './routes/teachers';
import { registerSchoolRoutes } from './routes/schools';
import { registerInterventionRoutes } from './routes/interventions';
import { registerBestPracticeRoutes } from './routes/bestPractices';
import { registerStudentRoutes } from './routes/students';
import { registerWorksheetRoutes } from './routes/worksheets';
import { registerEvaluationRoutes } from './routes/evaluation';
import { registerAnalyticsRoutes } from './routes/analytics';
import { registerDiagnosticBulkRoutes } from './routes/diagnosticBulk';
import { registerContentRoutes } from './routes/content';
import { registerAttendanceRoutes } from './routes/attendance';
import { ROOT_DIR } from './config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  // Initialize file-based DB
  await dbStore.init();

  const app = express();
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Serve Puppeteer output PDF sheets statically
  app.use('/output', express.static(path.join(ROOT_DIR, 'output')));
  app.use('/worksheets', express.static(path.join(ROOT_DIR, 'public', 'worksheets')));

  // --- API Endpoints ---
  registerAuthRoutes(app);
  registerAnnouncementRoutes(app);
  registerStatsRoutes(app);
  registerTicketRoutes(app);
  registerLogbookRoutes(app);
  registerAdminRoutes(app);
  registerGeoRoutes(app);
  registerTeacherRoutes(app);
  registerSchoolRoutes(app);
  registerClassRoutes(app);
  registerStudentRoutes(app);
  registerEvaluationRoutes(app);
  registerWorksheetRoutes(app);
  registerAnalyticsRoutes(app);
  registerDiagnosticBulkRoutes(app);
  registerInterventionRoutes(app);
  registerBestPracticeRoutes(app);
  registerContentRoutes(app);
  registerAttendanceRoutes(app);

  // In development, serve the frontend using Vite development middleware.
  // In production, serve the built frontend bundle (frontend/dist).
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        root: path.resolve(ROOT_DIR, '..', 'frontend'),
        server: { middlewareMode: true, hmr: false },
        appType: "spa"
      });
      app.use(vite.middlewares);
      console.log("[AI Studio] Vite development middleware mounted successfully");
    } catch (err) {
      console.warn("[AI Studio] Failed to load Vite dev middleware, falling back to static:", err);
    }
  } else {
    const distPath =
      process.env.FRONTEND_DIST_DIR ||
      path.resolve(ROOT_DIR, '..', 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
