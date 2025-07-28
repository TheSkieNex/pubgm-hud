import { Outlet } from 'react-router-dom';

import { Toaster } from '@/components/ui/sonner';

export default function Layout() {
  return (
    <div className="w-full h-screen">
      <Outlet />
      <Toaster />
    </div>
  );
}
