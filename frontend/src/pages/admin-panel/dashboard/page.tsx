import { useDashboard } from '@/hooks/use-admin-files';

import { AdminDashboardNavbar } from '@/components/admin-navbar';
import { AdminFiles } from '@/components/admin-files';

export const AdminDashboardPage = () => {
  const { lottieFiles } = useDashboard();

  return (
    <div className="flex flex-col justify-center">
      <AdminDashboardNavbar />
      <div className="w-full max-w-3xl mx-auto">
        <AdminFiles files={lottieFiles} />
      </div>
    </div>
  );
};
