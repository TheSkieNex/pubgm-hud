import { useEffect, useState } from 'react';
import { UploadIcon, LogOutIcon } from 'lucide-react';

import { useModal } from '@/hooks/use-modal';
import { Button } from '@/components/ui/button';
import { FileUpload } from './file-upload';

export const AdminDashboardNavbar = () => {
  const { setModalData } = useModal();

  const [triggerUploadModal, setTriggerUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[] | null>(null);

  useEffect(() => {
    if (triggerUploadModal) {
      setModalData({
        title: 'Upload a Lottie File',
        children: FileUpload,
        childrenProps: {
          setSelectedFile,
          setImageFiles,
        },
        onClose: () => {
          setModalData(null);
          setTriggerUploadModal(false);
        },
        cancel: 'Cancel',
        submit: {
          label: 'Submit',
          handler: () => {
            console.log(selectedFile);
            console.log(imageFiles);
          },
        },
      });
    }
  }, [triggerUploadModal, selectedFile, imageFiles, setModalData]);

  const handleLogout = () => {
    localStorage.removeItem('access-token');
    window.location.href = '/admin/login';
  };

  return (
    <div className="w-full flex items-center justify-center h-18 bg-background p-4 border-b border-border">
      <div className="w-full xl:w-1/2 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <a href="/" className="mr-2">
            <img src="/icon.svg" alt="logo" className="w-10 h-10" />
          </a>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setTriggerUploadModal(true)}>
            <UploadIcon className="w-4 h-4" />
            Upload File
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOutIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
