import { useEffect, useState, useRef } from 'react';

import { socket } from '@/lib/api';
import { fetchTable } from '@/lib/utils';
import type { Table, Team, TeamPoint, TeamElim } from '@/lib/types';

interface TeamInfo {
  teamId: number;
  killNum: number;
  liveMemberNum: number;
  matchElims: number;
}

export const useTable = (uuid: string) => {
  const [table, setTable] = useState<Table | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamPoints, setTeamPoints] = useState<TeamPoint[]>([]);
  const [teamElims, setTeamElims] = useState<TeamElim[]>([]);

  const teamsNeedToUpdate = useRef(false);

  useEffect(() => {
    const fetchTableData = async () => {
      const data = await fetchTable(uuid);
      setTable(data.table);
      setTeams(
        data.teams
          .map(team => {
            const teamPoints = data.teamPoints.find(point => point.teamId === team.id);
            return {
              ...team,
              points: teamPoints?.points || 0,
            };
          })
          .sort((a, b) => b.points - a.points)
      );
      setTeamPoints(data.teamPoints);
      setTeamElims(data.teamElims);
    };
    fetchTableData();
  }, [uuid]);

  useEffect(() => {
    socket.on('teamInfo', (data: TeamInfo) => {
      setTeamElims(prev => {
        return prev.map(team =>
          team.teamId === data.teamId ? { ...team, elim: data.matchElims } : team
        );
      });
      setTeamPoints(prev => {
        return prev.map(team =>
          team.teamId === data.teamId ? { ...team, points: team.points + data.killNum } : team
        );
      });
      teamsNeedToUpdate.current = true;
    });
  }, []);

  useEffect(() => {
    if (teamsNeedToUpdate.current) {
      setTeams(prev => {
        return prev
          .map(team => {
            const points = teamPoints.find(point => point.teamId === team.id)?.points || 0;
            return {
              ...team,
              points,
            };
          })
          .sort((a, b) => b.points - a.points);
      });
      teamsNeedToUpdate.current = false;
    }
  }, [teams, teamPoints]);

  return { table, teams, teamPoints, teamElims };
};
