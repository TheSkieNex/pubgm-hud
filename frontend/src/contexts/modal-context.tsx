import { useState } from 'react';

import type { ModalData } from '@/lib/admin/types';

import { ModalContext } from '@/contexts/ctx/modal';

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalData, setModalData] = useState<ModalData | null>(null);

  return (
    <ModalContext.Provider value={{ modalData, setModalData }}>{children}</ModalContext.Provider>
  );
};
