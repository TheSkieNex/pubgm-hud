import { useParams } from 'react-router-dom';

import { useTable } from '@/hooks/use-table';
import { TableComponent } from '@/components/table';

const TablePage = () => {
  const { uuid } = useParams();

  const { table, teams, teamPlayers } = useTable(uuid || '');

  if (!table || !teams) return null;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <TableComponent table={table} teams={teams} teamPlayers={teamPlayers} />
    </div>
  );
};

export default TablePage;
