import { Express, Request, Response } from 'express';

export interface LogEntry {
  id: string;
  timestamp: string;
  schoolId: string;
  schoolName: string;
  userId: string;
  userEmail: string;
  userRole: string;
  activityType: 'download' | 'print' | 'conduct' | 'scan' | 'verify' | 'ticket';
  status: 'Success' | 'Failed' | 'Delayed';
  details: string;
}

// Initial operational log seed entries
const logStore: LogEntry[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    schoolId: 'gps-mt-001',
    schoolName: 'GPS Model Town',
    userId: 'u-teacher-01',
    userEmail: 'gps-mt-001.t01@fln.org',
    userRole: 'Teacher',
    activityType: 'conduct',
    status: 'Success',
    details: 'Completed Baseline Diagnostic Test for Class 2-A (5 students evaluated)',
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    schoolId: 'gps-mt-001',
    schoolName: 'GPS Model Town',
    userId: 'u-teacher-01',
    userEmail: 'gps-mt-001.t01@fln.org',
    userRole: 'Teacher',
    activityType: 'print',
    status: 'Success',
    details: 'Generated and printed 15 copies of Worksheet WST-001 (Baseline L1-L5)',
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    schoolId: 'gps-vl-002',
    schoolName: 'GPS Village Lohara',
    userId: 'u-vol-01',
    userEmail: 'vol.rahul@fln.org',
    userRole: 'Volunteer',
    activityType: 'scan',
    status: 'Success',
    details: 'Uploaded and processed 8 student OMR assessment sheets via ICR scanner',
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    schoolId: 'gps-amb-003',
    schoolName: 'GPS Ambala Cantt',
    userId: 'u-teacher-02',
    userEmail: 'gps-mt-001.t02@fln.org',
    userRole: 'Teacher',
    activityType: 'verify',
    status: 'Success',
    details: 'Verified Level 12 milestone achievement for Amanpreet Singh',
  },
  {
    id: 'log-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    schoolId: 'gps-jai-004',
    schoolName: 'GPS Govind Dev Ji',
    userId: 'u-admin-pb',
    userEmail: 'admin.pb@fln.org',
    userRole: 'State Admin',
    activityType: 'ticket',
    status: 'Success',
    details: 'Escalated Curriculum support ticket: Guidance on Class 3 fractions pacing',
  },
  {
    id: 'log-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    schoolId: 'gps-lko-005',
    schoolName: 'GPS Hazratganj',
    userId: 'u-dist-ldh',
    userEmail: 'district.ldh@fln.org',
    userRole: 'District Admin',
    activityType: 'download',
    status: 'Success',
    details: 'Downloaded Q2 District Progress Audit Summary PDF',
  },
];

export function registerLogbookRoutes(app: Express) {
  // GET /api/logbook - Query operational logs with filters
  app.get('/api/logbook', (req: Request, res: Response) => {
    try {
      const { activityType, status, schoolId, search } = req.query;
      let results = [...logStore];

      if (activityType && typeof activityType === 'string' && activityType !== 'all') {
        results = results.filter(l => l.activityType === activityType);
      }
      if (status && typeof status === 'string' && status !== 'all') {
        results = results.filter(l => l.status === status);
      }
      if (schoolId && typeof schoolId === 'string' && schoolId !== 'all') {
        results = results.filter(l => l.schoolId === schoolId);
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        results = results.filter(l =>
          l.details.toLowerCase().includes(q) ||
          l.userEmail.toLowerCase().includes(q) ||
          l.schoolName.toLowerCase().includes(q)
        );
      }

      // Sort newest first
      results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return res.json(results);
    } catch (err: any) {
      console.error('Error fetching logbook:', err);
      return res.status(500).json({ error: 'Failed to fetch audit logbook.' });
    }
  });

  // POST /api/logbook - Record a new operational event
  app.post('/api/logbook', (req: Request, res: Response) => {
    try {
      const { schoolId, schoolName, userId, userEmail, userRole, activityType, status, details } = req.body;

      if (!details || !activityType) {
        return res.status(400).json({ error: 'Activity type and details are required.' });
      }

      const newLog: LogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        timestamp: new Date().toISOString(),
        schoolId: schoolId || 'general',
        schoolName: schoolName || 'General Facility',
        userId: userId || 'anonymous',
        userEmail: userEmail || 'system@fln.org',
        userRole: userRole || 'System',
        activityType,
        status: status || 'Success',
        details,
      };

      logStore.unshift(newLog);

      return res.status(201).json(newLog);
    } catch (err: any) {
      console.error('Error recording log entry:', err);
      return res.status(500).json({ error: 'Failed to create log entry.' });
    }
  });
}
