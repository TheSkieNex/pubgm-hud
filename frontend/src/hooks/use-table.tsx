import { useEffect, useState } from 'react';

import { socket } from '@/lib/api';
import { fetchTable } from '@/lib/utils';
import type { Table, Team, TeamPlayer } from '@/lib/types';

interface TeamInfo {
  teamId: number;
  liveMemberNum: number;
  matchElims: number;
}

export const useTable = (uuid: string) => {
  const [table, setTable] = useState<Table | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<TeamPlayer[]>([]);

  useEffect(() => {
    const fetchTableData = async () => {
      const data = await fetchTable(uuid);
      setTable(data.table);
      setTeams(data.teams.sort((a, b) => b.points - a.points));
      setTeamPlayers(
        data.teams
          .map(team => {
            const players: TeamPlayer[] = [];
            for (let i = 0; i < 4; i++) {
              players.push({
                teamId: team.teamId,
                uID: i,
                health: 100,
                liveState: 1,
                bHasDied: false,
              });
            }
            return players;
          })
          .flat()
      );
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

    socket.on('playersInfo', (data: TeamPlayer[]) => {
      setTeamPlayers(
        data.sort((a, b) => {
          if (a.bHasDied && !b.bHasDied) return 1;
          if (!a.bHasDied && b.bHasDied) return -1;
          if (a.liveState === 0 && b.liveState === 1) return 1;
          if (a.liveState === 1 && b.liveState === 0) return -1;
          return 0;
        })
      );
    });
  }, []);

  return { table, teams, teamPlayers };
};
