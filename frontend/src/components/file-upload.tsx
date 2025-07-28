import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FileUploadProps {
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  setImageFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
}

export const FileUpload = ({ setSelectedFile, setImageFiles }: FileUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDirectoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const imageFiles = Array.from(files).filter(
        file => file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png)$/i)
      );

      setImageFiles(imageFiles);
    } else {
      setImageFiles(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Label>Lottie JSON File</Label>
        <Input type="file" accept=".json,application/json" onChange={handleFileChange} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Images Directory</Label>
        <Input
          type="file"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ webkitdirectory: 'true' } as any)}
          onChange={handleDirectoryChange}
        />
      </div>
    </div>
  );
};
