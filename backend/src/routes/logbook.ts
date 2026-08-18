import express from 'express';
import { dbStore, UserRole, LogEntry } from '../db';
import { getAuthUser } from '../auth';

export function registerLogbookRoutes(app: express.Express) {
  // GET /api/logbook - Role-scoped logbook view
  app.get('/api/logbook', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const logs = await dbStore.getLogbook();

    // Server-side role scoping - mirrors the pattern used elsewhere
    // LogEntry only carries schoolId, so district/block/state scoping goes through a schools lookup first.
    if (user.role === UserRole.SUPERADMIN) {
      return res.json(logs);
    }
    if (user.role === UserRole.TEACHER || user.role === UserRole.SCHOOL) {
      return res.json(logs.filter(l => l.schoolId === user.schoolId));
    }
    if (user.role === UserRole.VOLUNTEER) {
      return res.json(logs.filter(l => user.assignedSchools?.includes(l.schoolId)));
    }

    const schools = await dbStore.getSchools();
    let allowedSchoolIds: Set<string>;
    if (user.role === UserRole.ADMIN) {
      allowedSchoolIds = new Set(schools.filter(s => s.stateCode === user.stateCode).map(s => s.id));
    } else if (user.role === UserRole.DISTRICT_ADMIN) {
      allowedSchoolIds = new Set(schools.filter(s => s.districtCode === user.districtCode).map(s => s.id));
    } else if (user.role === UserRole.BLOCK_ADMIN) {
      allowedSchoolIds = new Set(schools.filter(s => s.blockCode === user.blockCode).map(s => s.id));
    } else {
      return res.status(403).json({ error: 'Forbidden: role not permitted to view the logbook.' });
    }
    res.json(logs.filter(l => allowedSchoolIds.has(l.schoolId)));
  });

  // POST /api/logbook - Record a new operational event
  app.post('/api/logbook', async (req, res) => {
    try {
      const user = getAuthUser(req);
      const { schoolId, schoolName, activityType, status, details } = req.body;

      if (!details || !activityType) {
        return res.status(400).json({ error: 'Activity type and details are required.' });
      }

      const newLog: LogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        timestamp: new Date().toISOString(),
        schoolId: user?.schoolId || schoolId || 'general',
        schoolName: schoolName || 'General Facility',
        userId: user?.id || 'anonymous',
        userEmail: user?.email || req.body.userEmail || 'system@fln.org',
        userRole: user?.role || (req.body.userRole as UserRole) || UserRole.TEACHER,
        activityType,
        status: status || 'Success',
        details,
      };

      await dbStore.addLog(newLog);
      return res.status(201).json(newLog);
    } catch (err: any) {
      console.error('Error recording log entry:', err);
      return res.status(500).json({ error: 'Failed to create log entry.' });
    }
  });
}
