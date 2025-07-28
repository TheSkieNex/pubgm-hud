import type { LottieFile } from '@/lib/admin/types';

interface AdminFilesProps {
  files: LottieFile[];
}

export const AdminFiles = ({ files }: AdminFilesProps) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-4">
      {files.length > 0 ? (
        files.map(file => <div key={file.uuid}>{file.name}</div>)
      ) : (
        <p className="text-sm text-muted-foreground">Lottie files will be displayed here</p>
      )}
    </div>
  );
};
