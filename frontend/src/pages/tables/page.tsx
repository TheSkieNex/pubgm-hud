import { useEffect, useState } from 'react';

import type { Table } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api';

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
            {/* TODO: Add dropdown menu, after adding auth */}
          </div>
        ))}
      </div>
    </div>
  );
}
