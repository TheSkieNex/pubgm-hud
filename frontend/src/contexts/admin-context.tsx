import { useEffect, useState } from 'react';

import type { User } from '@/lib/admin/types';
import { API_ROUTER_URL } from '@/lib/api';

import { AdminContext } from '@/contexts/ctx/admin';

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`${API_ROUTER_URL}/admin/auth/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access-token')}`,
        },
      });
      const data = await response.json();

      if (data.error) {
        localStorage.removeItem('access-token');
        setUser(null);
      } else {
        setUser(data);
      }

      setIsLoading(false);
    };
    fetchUser();
  }, []);

  if (isLoading) return null;

  return <AdminContext.Provider value={{ user }}>{children}</AdminContext.Provider>;
};
