import { useParams } from 'react-router-dom';

import { useTable } from '@/hooks/use-table';
import { TableComponent } from '@/components/table';

export default function TablePage() {
  const { uuid } = useParams();

  const { table, teams, teamPlayers } = useTable(uuid || '');

  if (!table || !teams) return null;

  return <TableComponent table={table} teams={teams} teamPlayers={teamPlayers} />;
}
