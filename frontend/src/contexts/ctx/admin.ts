import { createContext } from 'react';

import type { User } from '@/lib/admin/types';

interface AdminContextType {
  user: User | null;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);
