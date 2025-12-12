import React from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';

// Dashboard components for each role
import { SuperAdminDashboard } from '@/components/dashboards/SuperAdminDashboard';
import { SchoolAdminDashboard } from '@/components/dashboards/SchoolAdminDashboard';
import { PrincipalDashboard } from '@/components/dashboards/PrincipalDashboard';
import { VicePrincipalDashboard } from '@/components/dashboards/VicePrincipalDashboard';
import { CounselorDashboard } from '@/components/dashboards/CounselorDashboard';
import { TeacherDashboard } from '@/components/dashboards/TeacherDashboard';
import { StudentDashboard } from '@/components/dashboards/StudentDashboard';

const dashboardComponents: Record<UserRole, React.FC> = {
  yonetici: SuperAdminDashboard,
  admin: SchoolAdminDashboard,
  mudur: PrincipalDashboard,
  mudur_yardimcisi: VicePrincipalDashboard,
  rehber: CounselorDashboard,
  ogretmen: TeacherDashboard,
  ogrenci: StudentDashboard,
};

export const Dashboard: React.FC = () => {
  const { user, role } = useAuth();

  if (!user || !role) return null;

  const DashboardComponent = dashboardComponents[role];

  return <DashboardComponent />;
};
