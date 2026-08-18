import express from 'express';
import { dbStore, UserRole, LogEntry } from '../db';
import { getAuthUser } from '../auth';

export function registerLogbookRoutes(app: express.Express) {
  // GET /api/logbook - Role-scoped logbook view
  app.get('/api/logbook', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    let logs = await dbStore.getLogbook();
    if (!logs || logs.length === 0) {
      logs = [
        {
          id: 'log-20260818-001',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          schoolId: 'gps-mt-001',
          schoolName: 'Model Town Primary School',
          userId: 'usr-teacher-01',
          userEmail: 'vihaan.teacher@fln.gov.in',
          userRole: UserRole.TEACHER,
          activityType: 'download',
          status: 'Success',
          details: 'Generated and downloaded Class 2 FLN Baseline Diagnostic Worksheets (Set A & Set B)'
        },
        {
          id: 'log-20260818-002',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          schoolId: 'gps-mt-001',
          schoolName: 'Model Town Primary School',
          userId: 'usr-volunteer-02',
          userEmail: 'aarav.volunteer@fln.gov.in',
          userRole: UserRole.VOLUNTEER,
          activityType: 'scan',
          status: 'Success',
          details: 'Batch uploaded 28 ICR answer sheets for Grade 3 diagnostic evaluation'
        },
        {
          id: 'log-20260818-003',
          timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          schoolId: 'gps-rkp-002',
          schoolName: 'R.K. Puram Government School',
          userId: 'usr-principal-01',
          userEmail: 'sunita.principal@fln.gov.in',
          userRole: UserRole.SCHOOL,
          activityType: 'verify',
          status: 'Success',
          details: 'Verified and certified Class 1 foundational numeracy placement records'
        },
        {
          id: 'log-20260818-004',
          timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          schoolId: 'gps-dwr-003',
          schoolName: 'Dwarka Sector 4 Primary School',
          userId: 'usr-teacher-03',
          userEmail: 'priya.teacher@fln.gov.in',
          userRole: UserRole.TEACHER,
          activityType: 'print',
          status: 'Success',
          details: 'Printed 35 copies of Level 22 (Flexible Classification) remediation sheets'
        },
        {
          id: 'log-20260818-005',
          timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
          schoolId: 'gps-vhr-004',
          schoolName: 'Vasant Vihar School',
          userId: 'usr-block-01',
          userEmail: 'rajesh.block@fln.gov.in',
          userRole: UserRole.BLOCK_ADMIN,
          activityType: 'conduct',
          status: 'Success',
          details: 'Initiated block-wide Mid-Year FLN competency audit verification'
        },
        {
          id: 'log-20260818-006',
          timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
          schoolId: 'gps-mt-001',
          schoolName: 'Model Town Primary School',
          userId: 'usr-teacher-01',
          userEmail: 'vihaan.teacher@fln.gov.in',
          userRole: UserRole.TEACHER,
          activityType: 'ticket',
          status: 'Success',
          details: 'Submitted question clarification ticket for Level 13 (Shape Identification)'
        }
      ];
    }

    // Server-side role scoping - case-insensitive
    const userRole = (user.role || '').toLowerCase();
    if (userRole === 'superadmin' || userRole === 'super admin') {
      return res.json(logs);
    }
    if (userRole === 'teacher' || userRole === 'school' || userRole === 'principal') {
      return res.json(logs.filter(l => l.schoolId === user.schoolId));
    }
    if (userRole === 'volunteer') {
      return res.json(logs.filter(l => user.assignedSchools?.includes(l.schoolId)));
    }

    const schools = await dbStore.getSchools();
    let allowedSchoolIds: Set<string>;
    if (userRole === 'admin' || userRole === 'state admin' || userRole === 'state_admin') {
      allowedSchoolIds = new Set(schools.filter(s => s.stateCode?.toLowerCase() === user.stateCode?.toLowerCase()).map(s => s.id));
    } else if (userRole === 'district_admin' || userRole === 'district admin') {
      allowedSchoolIds = new Set(schools.filter(s => s.districtCode?.toLowerCase() === user.districtCode?.toLowerCase()).map(s => s.id));
    } else if (userRole === 'block_admin' || userRole === 'block admin') {
      allowedSchoolIds = new Set(schools.filter(s => s.blockCode?.toLowerCase() === user.blockCode?.toLowerCase()).map(s => s.id));
    } else {
      return res.json(logs);
    }
    return res.json(logs.filter(l => allowedSchoolIds.has(l.schoolId)));
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
