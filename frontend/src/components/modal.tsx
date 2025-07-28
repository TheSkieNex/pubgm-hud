import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useModal } from '@/hooks/use-modal';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Modal = () => {
  const { modalData } = useModal();

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        modalData?.onClose();
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        modalData?.onClose();
      }
    }

    if (modalData) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [modalData]);

  useEffect(() => {
    if (modalData && modalRef.current) {
      modalRef.current.focus();
    }
  }, [modalData]);

  if (!modalData) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all duration-300">
      <Card ref={modalRef} className="w-full max-w-md animate-slide-up">
        <CardHeader>
          <CardTitle>{modalData.title}</CardTitle>
          {modalData.description && <CardDescription>{modalData.description}</CardDescription>}
        </CardHeader>
        <form
          className="space-y-6"
          onSubmit={e => {
            e.preventDefault();
            modalData.submit.handler(e);
          }}
        >
          <CardContent>
            {modalData.children && <modalData.children {...modalData.childrenProps} />}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {modalData.cancel && (
              <Button variant="outline" onClick={modalData.onClose}>
                {modalData.cancel}
              </Button>
            )}
            <Button type="submit">{modalData.submit.label}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>,
    document.getElementById('modal-root') as HTMLElement
  );
};
