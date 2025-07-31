import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Clipboard, EllipsisVertical } from 'lucide-react';

import { fetcher } from '@/lib/utils';
import { isProduction, API_BASE_URL } from '@/lib/api';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ListWrapper } from '@/components/list-wrapper';

interface LottieFile {
  uuid: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  url: string;
}

const lottieBaseUrl = isProduction ? `${API_BASE_URL}/api/lottie` : `${API_BASE_URL}/lottie`;

export const LottieFilesPage = () => {
  const [lottieFiles, setLottieFiles] = useState<LottieFile[]>([]);

  useEffect(() => {
    const fetchLottieFiles = async () => {
      const data = await fetcher('/lottie');
      setLottieFiles(data);
    };
    fetchLottieFiles();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Lottie Files</h1>
      <ListWrapper>
        {lottieFiles.map(file => (
          <div
            key={file.uuid}
            className="flex items-center justify-between border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 w-full"
          >
            <a
              href={`${lottieBaseUrl}/${file.uuid}/index.html`}
              className="flex items-start flex-1 p-2"
            >
              {file.name}
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer p-2">
                <EllipsisVertical size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleCopy(file.uuid)}>
                  <Clipboard size={16} />
                  Copy UUID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleCopy(`${lottieBaseUrl}/${file.uuid}/index.html`)}
                >
                  <Clipboard size={16} />
                  Copy URL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </ListWrapper>
    </div>
  );
};

export default LottieFilesPage;
