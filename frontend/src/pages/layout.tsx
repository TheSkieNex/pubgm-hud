import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

export default function Layout() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Outlet />
      <Toaster />
    </div>
  );
}
