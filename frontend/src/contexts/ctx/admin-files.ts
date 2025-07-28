import { createContext } from 'react';

import type { LottieFile } from '@/lib/admin/types';

interface DashboardContextType {
  lottieFiles: LottieFile[];
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);
