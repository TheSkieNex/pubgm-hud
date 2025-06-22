import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { API_URL } from '@/lib/api';
import type { Table as TableType, Team, TeamElim, TeamPoint } from '@/lib/types';

import { TableComponent } from '@/components/table';

export default function TablePage() {
  const { uuid } = useParams();

  const [table, setTable] = useState<TableType | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamPoints, setTeamPoints] = useState<TeamPoint[]>([]);
  const [teamElims, setTeamElims] = useState<TeamElim[]>([]);

  useEffect(() => {
    const fetchTable = async () => {
      const res = await fetch(`${API_URL}/api/table/${uuid}`);
      const data = await res.json();
      setTable(data.table);
      setTeams(data.teams);
      setTeamPoints(data.teamPoints);
      setTeamElims(
        data.teams.map((team: Team) => ({
          id: team.id,
          tableId: team.tableId,
          teamId: team.id,
          elim: 0,
        }))
      );
    };
    fetchTable();
  }, [uuid]);

  if (!table || !teams || !teamPoints || !teamElims) return null;

  return (
    <TableComponent table={table} teams={teams} teamPoints={teamPoints} teamElims={teamElims} />
  );
}
