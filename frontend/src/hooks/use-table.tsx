import { useEffect, useState } from 'react';

import { socket } from '@/lib/api';
import { fetchTable } from '@/lib/utils';
import type { Table, Team } from '@/lib/types';

interface TeamInfo {
  teamId: number;
  liveMemberNum: number;
  matchElims: number;
}

export const useTable = (uuid: string) => {
  const [table, setTable] = useState<Table | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchTableData = async () => {
      const data = await fetchTable(uuid);
      setTable(data.table);
      setTeams(data.teams.sort((a, b) => b.points - a.points));
    };
    fetchTableData();
  }, [uuid]);

  useEffect(() => {
    socket.on('teamInfo', (data: TeamInfo) => {
      setTeams(prev => {
        return prev
          .map(team =>
            team.teamId === data.teamId
              ? {
                  ...team,
                  points: team.points + (data.matchElims - team.matchElims),
                  matchElims: data.matchElims,
                }
              : team
          )
          .sort((a, b) => b.points - a.points);
      });
    });
  }, []);

  return { table, teams };
};
