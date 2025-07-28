import { useState, useEffect } from 'react';

import type { LottieFile } from '@/lib/admin/types';
import { getLottieFiles } from '@/lib/admin/api-requests';

import { DashboardContext } from '@/contexts/ctx/admin-files';

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [lottieFiles, setLottieFiles] = useState<LottieFile[]>([]);

  useEffect(() => {
    const fetchLottieFiles = async () => {
      const files = await getLottieFiles();
      if (files && files.length > 0) {
        setLottieFiles(files);
      }
    };

    fetchLottieFiles();
  }, []);

  return <DashboardContext.Provider value={{ lottieFiles }}>{children}</DashboardContext.Provider>;
};
