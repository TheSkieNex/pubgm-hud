import { Routes, Route, Navigate } from 'react-router-dom';

import { useAdmin } from '@/hooks/use-admin';
import { AdminProvider } from '@/contexts/admin-context';
import { DashboardProvider } from '@/contexts/admin-files-context';
import { ModalProvider } from '@/contexts/modal-context';

import { AdminLoginPage } from './login/page';
import { AdminPanelDashboardLayout } from './dashboard/layout';
import { AdminDashboardPage } from './dashboard/page';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAdmin();

  if (!user) return <Navigate to="/admin/login" replace />;

  return children;
};

const UnprotectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAdmin();

  if (user) return <Navigate to="/admin" replace />;

  return children;
};

const ProtectedRoutes = () => {
  return (
    <ProtectedRoute>
      <DashboardProvider>
        <ModalProvider>
          <Routes>
            <Route path="/" element={<AdminPanelDashboardLayout />}>
              <Route path="/" element={<AdminDashboardPage />} />
            </Route>
          </Routes>
        </ModalProvider>
      </DashboardProvider>
    </ProtectedRoute>
  );
};

export const AdminPanelRouter = () => {
  return (
    <AdminProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <UnprotectedRoute>
              <AdminLoginPage />
            </UnprotectedRoute>
          }
        />
        <Route path="*" element={<ProtectedRoutes />} />
      </Routes>
    </AdminProvider>
  );
};
