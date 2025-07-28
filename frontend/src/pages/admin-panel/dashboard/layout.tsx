import { Outlet } from 'react-router-dom';

import { Modal } from '@/components/modal';

export const AdminPanelDashboardLayout = () => {
  return (
    <>
      <Outlet />
      <Modal />
    </>
  );
};
