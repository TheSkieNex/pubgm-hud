import { AdminLoginForm } from '@/components/admin-login-form';

export const AdminLoginPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center pt-40">
      <img src="/icon.svg" alt="PUBG Hud" className="w-20 h-20 mb-10" />
      <AdminLoginForm />
    </div>
  );
};
