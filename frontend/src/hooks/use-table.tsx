import { useEffect, useState } from 'react';

import { socket } from '@/lib/api';
import { fetchTable } from '@/lib/utils';
import type { Table, Team, TeamPlayer, TeamEliminated } from '@/lib/types';

interface TeamInfo {
  teamId: number;
  matchElims: number;
  liveMemberNum: number;
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
                rank: 1,
                uID: i,
                health: 100,
                liveState: 1,
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
    socket.on(`team-info-${uuid}`, (data: TeamInfo[]) => {
      setTeams(prev => {
        return prev
          .map(team => {
            const teamInfo = data.find(teamInfo => teamInfo.teamId === team.teamId);
            if (teamInfo) {
              return {
                ...team,
                points: team.points + (teamInfo.matchElims - team.matchElims),
                matchElims: teamInfo.matchElims,
              };
            }
            return {
              ...team,
              eliminated: true,
            };
          })
          .filter(team => team !== undefined)
          .sort((a, b) => b.points - a.points);
      });
    });

    socket.on(`players-info-${uuid}`, (data: TeamPlayer[]) => {
      setTeamPlayers(
        data.sort((a, b) => {
          if (a.health === 0 && b.health !== 0) return 1;
          if (a.health !== 0 && b.health === 0) return -1;
          if (a.liveState === 4 && b.liveState !== 4) return 1;
          if (a.liveState !== 4 && b.liveState === 4) return -1;
          return 0;
        })
      );
      setTeams(prev => {
        return prev.map(team => {
          const teamPlayer = data.find(player => player.teamId === team.teamId);
          if (teamPlayer) {
            return { ...team, rank: teamPlayer.rank };
          }
          return team;
        });
      });
    });

    socket.on(`team-eliminated-${uuid}`, (data: TeamEliminated[]) => {
      data.forEach(teamEliminated => {
        setTeams(prev => {
          return prev.map(team => {
            if (team.teamId === teamEliminated.teamId) {
              return { ...team, eliminated: true, rank: team.rank };
            }
            return team;
          });
        });
      });
    });
  }, [uuid]);

  return { table, teams, teamPlayers };
};
