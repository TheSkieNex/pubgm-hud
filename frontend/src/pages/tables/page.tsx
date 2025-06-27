import { useEffect, useState } from 'react';
import { EllipsisVertical, Clipboard } from 'lucide-react';
import { toast } from 'sonner';

import type { Table } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    const fetchTables = async () => {
      const res = await fetch(`${API_BASE_URL}/api/table`);
      const data = await res.json();
      setTables(data);
    };
    fetchTables();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Tables</h1>
      <div className="w-full h-full grid grid-cols-3 items-start gap-4">
        {tables.map(table => (
          <div
            key={table.uuid}
            className="flex items-center justify-between border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100"
          >
            <a href={`/table/${table.uuid}`} className="flex items-start flex-1 p-2">
              {table.name}
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer p-2">
                <EllipsisVertical size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => handleCopy(`${window.location.origin}/elimination/${table.uuid}`)}
                >
                  <Clipboard size={16} />
                  Copy Elimination URL
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleCopy(`${window.location.origin}/table/${table.uuid}`)}
                >
                  <Clipboard size={16} />
                  Copy Table URL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
