import React from 'react';
import { User, UserRole } from '../types';
import { usePanelData } from './panels/usePanelData';
import { AdaptiveTestPanel } from './panels/AdaptiveTestPanel';
import { TestHistoryPanel } from './panels/TestHistoryPanel';
import { WorksheetTemplatesPanel } from './panels/WorksheetTemplatesPanel';
import { SystemSettingsPanel } from './panels/SystemSettingsPanel';
import { StudentListPanel } from './panels/StudentListPanel';
import { DiagnosticTestPanel } from './panels/DiagnosticTestPanel';
import { PerformancePanel } from './panels/PerformancePanel';
import { WorksheetsPanel } from './panels/WorksheetsPanel';
import { AssignedSchoolsPanel } from './panels/AssignedSchoolsPanel';
import { StudentProgressPanel } from './panels/StudentProgressPanel';
import { TeachersPanel } from './panels/TeachersPanel';
import { SchoolsPanel } from './panels/SchoolsPanel';
import { UsersPanel } from './panels/UsersPanel';
import { ContentPanel } from './panels/ContentPanel';
import { DistrictsPanel } from './panels/DistrictsPanel';
import { BlocksPanel } from './panels/BlocksPanel';
import { AnalyticsPanel } from './panels/AnalyticsPanel';
import { ReportsPanel } from './panels/ReportsPanel';
import { StudentProfilePanel } from './panels/StudentProfilePanel';
import { AttendanceTracker } from './AttendanceTracker';

interface PanelViewsProps {
  activePanel: string;
  currentUser: User;
  token: string;
}

export const PanelViews: React.FC<PanelViewsProps> = ({ activePanel, currentUser, token }) => {
  const {
    students, schools, usersList, reportsList, worksheetsList, teachersList,
    getDistrictStats, getBlockStats, updateStudentLocally, refreshStudents,
  } = usePanelData(token, currentUser, activePanel);

  const panel = activePanel;

  // ===================== TEACHER PANELS =====================
  if (panel === 'student_list' || panel === 'students') {
    return (
      <StudentListPanel
        students={students}
        currentUser={currentUser}
        token={token}
        refreshStudents={refreshStudents}
      />
    );
  }

  if (panel === 'student_profile') {
    return (
      <StudentProfilePanel
        students={students}
        schools={schools}
        reportsList={reportsList}
        currentUser={currentUser}
        token={token}
        updateStudentLocally={updateStudentLocally}
      />
    );
  }

  if (panel === 'diagnostic_test') {
    return (
      <DiagnosticTestPanel
        students={students}
        currentUser={currentUser}
        token={token}
        refreshStudents={refreshStudents}
      />
    );
  }

  if (panel === 'adaptive_test') return <AdaptiveTestPanel />;

  if (panel === 'test_history') return <TestHistoryPanel currentUser={currentUser} token={token} />;

  if (panel === 'worksheets') return <WorksheetsPanel reportsList={reportsList} worksheetsList={worksheetsList} />;

  if (panel === 'performance') return <PerformancePanel students={students} currentUser={currentUser} />;

  if (panel === 'reports') return <ReportsPanel currentUser={currentUser} schools={schools} students={students} reportsList={reportsList} />;

  // ===================== VOLUNTEER & TEACHER ATTENDANCE PANELS =====================
  if (panel === 'assigned_schools') return <AssignedSchoolsPanel schools={schools} students={students} />;

  if (panel === 'student_progress') return <StudentProgressPanel students={students} />;

  if (panel === 'attendance') {
    return (
      <AttendanceTracker
        token={token}
        students={students}
        currentUser={currentUser}
        schools={schools}
      />
    );
  }

  // ===================== PRINCIPAL / SCHOOL ADMIN PANELS =====================
  if (panel === 'teachers' && (currentUser.role === UserRole.SCHOOL || currentUser.role === UserRole.BLOCK_ADMIN)) {
    return <TeachersPanel schools={schools} teachersList={teachersList} currentUser={currentUser} />;
  }

  // ===================== BLOCK/DISTRICT/STATE ADMIN + SUPERADMIN SHARED PANELS =====================
  if (panel === 'schools') return <SchoolsPanel schools={schools} />;

  if (panel === 'districts') return <DistrictsPanel currentUser={currentUser} schools={schools} students={students} getDistrictStats={getDistrictStats} />;

  if (panel === 'blocks') return <BlocksPanel currentUser={currentUser} getBlockStats={getBlockStats} />;

  // ===================== SUPERADMIN PANELS =====================
  if (panel === 'users') return <UsersPanel usersList={usersList} />;

  if (panel === 'worksheet_templates') return <WorksheetTemplatesPanel />;

  if (panel === 'content') return <ContentPanel />;

  if (panel === 'analytics') return <AnalyticsPanel currentUser={currentUser} schools={schools} students={students} getDistrictStats={getDistrictStats} getBlockStats={getBlockStats} />;

  if (panel === 'system_settings') return <SystemSettingsPanel />;

  // Fallback for any unmatched panel — renders the roles workspace (dashboard) as the content
  return null;
};
