import { createContext } from 'react';

import type { ModalData } from '@/lib/admin/types';

interface ModalContextType {
  modalData: ModalData | null;
  setModalData: React.Dispatch<React.SetStateAction<ModalData | null>>;
}

export const ModalContext = createContext<ModalContextType | null>(null);
